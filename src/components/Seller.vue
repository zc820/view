<!-- 商家销量统计的横向柱状图 -->
<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '../utils/theme_utils'

export default {
  data() {
    return {
      chartInstance: null,
      allData: null, // 服务器返回的数据
      curentPage: 1, //当前页
      totalPage: 0, //总共多少页
      timeId: null, //定时器赋值
    };
  },
  created() {
    // 在组件创建完成之后 进行回调函数的注册
    this.$socket.registerCallBack("sellerData", this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    this.$socket.send({
      action: "getData",
      socketType: "sellerData",
      chartName: "seller",
      value: "",
    });
    window.addEventListener("resize", this.screenAdapt);
    //在页面加载完成时主动进行屏幕的适配
    this.screenAdapt();
  },
  destroyed() {
    clearInterval(this.timeId);
    //组件销毁时，移除监听器
    window.removeEventListener("resize", this.screenAdapt);
    this.$socket.unRegisterCallBack("sellerData");
  },
  methods: {
    //初始化echarts对象
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, this.theme);
      //拆解option，对图标初始化配置的控制
      const initOption = {
        title: {
          text: "||商家销售统计",
          textStyle: {
            // fontSize: 60,
            //color: 'white',
            color: getThemeValue(this.theme).titleColor,
          },
          left: 11,
          top: 10,
        },
        //grid配置坐标轴相对于容器的位置，只限于直角坐标系
        grid: {
          //  show:true, //是否展示坐标轴边框
          left: "3%",
          top: "20%",
          right: "6%",
          bottom: "3%",
          containLabel: true, //距离是否包含左边轴上的文字
        },

        xAxis: {
          type: "value",
        },
        yAxis: {
          type: "category",
        },
        //提示工具
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "line",
            z: 0,
            lineStyle: {
              // width:60,
              color: "#2D3443",
            },
          },
        },

        series: [
          {
            type: "bar",
            barWidth: 50,
            label: {
              show: true, //展示文字
              position: "right", //调整文字位置
              textStyle: {
                color: "white",
              },
            },
            itemStyle: {
              //设置柱状体圆角效果
              // barBorderRadius: [0 ,33 ,33,0],
              //设置颜色渐变
              color: {
                type: "liner",
                x1: 0,
                y1: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: "#5052EE" },
                  { offset: 1, color: "#AB6EE5" },
                ],
                globalCoord: false,
              },
            },
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

    //获取服务器数据
    // async getData() {
    //   //解构赋值
    //   const {data : ret} = await this.$http.get('seller');
    //   this.allData = ret;
    //   this.allData.sort((a,b) => {
    //     return b.value - a.value
    //   });
    //   this.totalPage = this.allData.length % 5 === 0 ? this.allData.length / 5 : this.allData.length / 5 + 1
    //   // console.log(ret);
    //   this.updateChart();
    //   this.startInterval();
    // },

    getData(ret) {
      this.allData = ret;
      console.log(ret)
      this.allData.sort((a, b) => {
        return b.value - a.value;
      });
      this.totalPage =
        this.allData.length % 5 === 0
          ? this.allData.length / 5
          : this.allData.length / 5 + 1;
      // console.log(ret);
      this.updateChart();
      this.startInterval();
    },

    //更新图表
    updateChart() {
      const start = (this.curentPage - 1) * 5;
      const end = this.curentPage * 5;
      const showData = this.allData.slice(start, end);
      // console.log(showData)

      const sellerNames = showData.map((item) => {
        return item.name;
      });

      const sellerValue = showData.map((item) => {
        return item.value;
      });
      const dataOption = {
        yAxis: {
          data: sellerNames,
        },

        series: [
          {
            data: sellerValue,
          },
        ],
      };
      this.chartInstance.setOption(dataOption);
    },

    startInterval() {
      //判断是否有timeId,有的话清除之前的定时器，方便开启新的定时器
      if (this.timeId) {
        clearInterval(this.timeId);
      }
      this.timeId = setInterval(() => {
        this.curentPage++;
        this.updateChart();
        if (this.curentPage == this.totalPage) {
          this.curentPage = 1;
        }
      }, 3000);
    },
    screenAdapt() {
      const screenWidth = this.$refs.seller_ref.offsetWidth;
      const finalSize = (screenWidth / 100) * 3.6;
      // console.log(screenWidth)

      const adaptOption = {
        title: {
          textStyle: {
            fontSize: finalSize,
          },
        },

        //提示工具
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: finalSize,
            },
          },
        },

        series: [
          {
            barWidth: finalSize,
            itemStyle: {
              //设置柱状体圆角效果
              barBorderRadius: [0, finalSize / 2, finalSize / 2, 0],
            },
          },
        ],
      };

      this.chartInstance.setOption(adaptOption);
      //手动打开屏幕自适应
      this.chartInstance.resize();
    },
  },
  computed: {
    //将theme映射生成计算属性
    //相当于theme() {return this.$store.state.theme}
    ...mapState(['theme'])
  },
  watch: {
    theme() {
      console.log('主题切换了')
      this.chartInstance.dispose() //销毁echarts组件
      this.initChart() //创建一个新的echarts实例
      this.screenAdapt() //屏幕的适配
      this.updateChart() //更新图表的展示
    }
  }
};
</script>

<style lang="less" scoped>
</style>
