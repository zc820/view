<template>
  <div class="com-container">
    <div class="com-chart" ref="stock_ref"></div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      chartInstance: null,
      allData: null, // 服务器返回的数据
      currentPage: 0,
      totalPage: 0,
      timeId: null, // 定时器标识
    };
  },
  mounted() {
    this.initChart();
    this.getData();
    window.addEventListener("resize", this.screenAdapt);
    this.screenAdapt(); //屏幕自适应

   
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapt);
    clearInterval(this.timeId); //移除定时器
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.stock_ref, "chalk");
      const initOption = {
        title: {
          text: "库存与销量分析",
          left: 20,
          top: 20,
        },
      };
      this.chartInstance.setOption(initOption);
      //鼠标事件的监听
      //注意：此处要使用箭头函数不能使用function（）{} 作为回调函数，会报错
      //function（）{clearInterval(this.timeId);} 报错
      this.chartInstance.on("mouseover", () => {
        clearInterval(this.timeId);
      });
      this.chartInstance.on("mouseout", () => {
        this.startInterval();
      });
    },
    async getData() {
      const { data: ret } = await this.$http.get("stock");
      console.log(ret);
      this.allData = ret;
      this.totalPage =
        this.allData.length % 5 === 0
          ? this.allData.length / 5
          : this.allData.length / 5 + 1;
      this.updataChart();
      this.startInterval(); //启动定时器
    },
    //处理数据
    updataChart() {
      const centerArr = [
        ["18%", "40%"],
        ["50%", "40%"],
        ["82%", "40%"],
        ["34%", "75%"],
        ["66%", "75%"],
      ];
      const colorArr = [
        ["#4FF778", "#0BA82C"],
        ["#E5DD45", "#E8B11C"],
        ["#E8821C", "#E55445"],
        ["#5052EE", "#AB6EE5"],
        ["#23E5E5", "#2E72BF"],
      ];
      const start = this.currentPage * 5;
      const end = (this.currentPage + 1) * 5;
      const showData = this.allData.slice(start, end);
      const seriesArr = showData.map((item, index) => {
        return {
          type: "pie",
          radius: [120, 100],
          center: centerArr[index],
          hoverAnimation: false, // 关闭鼠标移入到饼图时的动画效果
          data: [
            {
              //销量
              name: item.name + "\n\n" + item.sales,
              value: item.sales,
              itemStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  {
                    offset: 0,
                    color: colorArr[index][0],
                  },
                  {
                    offset: 1,
                    color: colorArr[index][1],
                  },
                ]),
              },
            },
            {
              // "库存",
              value: item.stock,
              itemStyle: {
                color: "#333843",
              },
            },
          ],

          label: {
            position: "center",
            color: colorArr[index][0],
          },

          labelLine: {
            show: false, // 隐藏指示线
          },
        };
      });
      const dataOption = {
        series: seriesArr,
      };
      this.chartInstance.setOption(dataOption);
      this.screenAdapt();
    },
    screenAdapt() {
      const titleFontSize = (this.$refs.stock_ref.offsetWidth / 100) * 3.6;
      const innerRadius = titleFontSize * 2.8
      const outterRadius = innerRadius * 1.125
      const adaptOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          }
        ]
      }
      this.chartInstance.setOption(adaptOption);
      this.chartInstance.resize();
    },

    startInterval() {
      if (this.timeId) {
        clearInterval(this.timeId);
      }
      this.timeId = setInterval(() => {
        this.currentPage++;
        if (this.currentPage == this.totalPage) {
          this.currentPage = 0;
        }
        this.updataChart();
      }, 5000);
    },
  },
};
</script>
<style lang="less" scoped>
</style>
