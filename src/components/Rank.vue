<!-- 地区销售排行组件 -->
<template>
  <div class="com-container">
    <div class="com-chart" ref="rank_ref"></div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      chartInstance: null,
      allData: null, // 服务器返回的数据
      startValue: 0, //区域缩放的起始值
      endValue: 9, //区域缩放的终点值
      timeId: null, // 定时器标识
    };
  },
  mounted() {
    this.initChart();
    this.getData();
    window.addEventListener("resize", this.screenAdapt);
    this.screenAdapt();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapt);
    clearInterval(this.timeId);
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.rank_ref, "chalk");
      const initOption = {
        title: {
          text: "地区销售排行",
          left: 20,
          top: 20,
        },
        grid: {
          containLabel: true,
          top: "40%",
          left: "5%",
          right: "5%",
          bottom: "5%",
        },
        tooltip: {
          show: true,
        },

        xAxis: {
          type: "category",
        },

        yAxis: {
          type: "value",
        },
        series: [
          {
            type: "bar",
          },
        ],
      };
      this.chartInstance.setOption(initOption);
      //对图表对象进行鼠标事件的监听
      this.chartInstance.on("mouseover", () => {
        clearInterval(this.timeId);
      });
      this.chartInstance.on("mouseout", () => {
        this.startInterval();
      });
    },

    async getData() {
      const { data: ret } = await this.$http.get("rank");
      console.log(ret);
      this.allData = ret;
      //排序,从大到小
      this.allData.sort((a, b) => {
        return b.value - a.value;
      });
      this.updataChart();
      this.startInterval();
    },
    //处理数据
    updataChart() {
      const colorArr = [
        ["pink", "cyan"],
        ["skyblue", "palegreen"],
        ["purple", "peachpuff"],
      ];
      const xDataArr = this.allData.map((item) => {
        return item.name;
      });
      const yDataArr = this.allData.map((item) => {
        return item.value;
      });
      const dataOption = {
        xAxis: {
          data: xDataArr,
        },
        //区域缩放,首先要已经获取到数据
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue,
        },
        series: [
          {
            data: yDataArr,
            itemStyle: {
              //color支持回调函数
              color: (arg) => {
                let finalColor = null;
                //console.log(arg)
                if (arg.data > 300) {
                  finalColor = colorArr[0];
                } else if (arg.data > 200) {
                  finalColor = colorArr[1];
                } else {
                  finalColor = colorArr[2];
                }

                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: finalColor[0],
                  },
                  {
                    offset: 1,
                    color: finalColor[1],
                  },
                ]);
              },
            },
          },
        ],
      };
      this.chartInstance.setOption(dataOption);
    },
    screenAdapt() {
      const titleFontSize = (this.$refs.rank_ref.offsetWidth / 100) * 3.6;
      const adaptOption = {
        title:{
          textStyle:{
            fontSize:titleFontSize,
          },
        },
        series:[
          {
            barWidth: titleFontSize,
            itemStyle:{
              barBorderRadius:[titleFontSize/2, titleFontSize/2, 0, 0]
            }
          }
        ]
      };
      this.chartInstance.setOption(adaptOption);
      this.chartInstance.resize();
    },

    startInterval() {
      if (this.timeId) {
        clearInterval(this, this.timeId);
      }
      this.timeId = setInterval(() => {
        this.startValue++;
        this.endValue++;
        if (this.endValue == this.allData.length) {
          this.startValue = 0;
          this.endValue = 9;
        }
        this.updataChart();
      }, 2000);
    },
  },
};
</script>
<style lang="less" scoped>
</style>
