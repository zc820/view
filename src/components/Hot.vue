<!-- 热销商品饼图 -->
<template>
  <div class="com-container">
    <div class="com-chart" ref="hor_ref"></div>
    <span class="iconfont arr-left" @click="toLeft" :style="comStyle"
      >&#xe6ef;</span
    >
    <span class="iconfont arr-right" @click="toRight" :style="comStyle"
      >&#xe6ed;</span
    >
    <span class="catStyle" :style="comStyle">{{ catName }}</span>
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
      currentIndex: 0, //当前所展示的一级分类数据
      titleFontSize: 0,
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
  },

  computed: {
    catName() {
      if (!this.allData) {
        return "";
      } else {
        return this.allData[this.currentIndex].name;
      }
    },

    comStyle() {
      return {
        fontSize: this.titleFontSize + "px",
        color: getThemeValue(this.theme).titleColor
      };
    },

    //将theme映射生成计算属性
    //相当于theme() {return this.$store.state.theme}
    ...mapState(['theme'])
  },

  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.hor_ref, this.theme);
      const initOption = {
        title: {
          text: "热销商品占比",
          left: 20,
          top: 20,
        },

        legend: {
          itemWidth: 15,
          itemHeight: 15,
          itemGap: 8,
          textStyle: {
            fontSize: 8,
          },
          label: {
            show: true,
          },
          top: "20%",
          icon: "circle",
        },

        tooltip: {
          show: true,
          formatter: (arg) => {
            // console.log(arg)
            //三级分类
            const thirdCategory = arg.data.children;
            let total = 0;
            //计算出所有三级分类总和
            thirdCategory.forEach((item) => {
              total += item.value;
            });
            let resultStr = "";
            thirdCategory.forEach((item) => {
              resultStr += `${item.name}:${
                ((item.value / total) * 100).toFixed(2) + "%"
              } <br>`;
            });
            return resultStr;
          },
        },

        series: [
          {
            type: "pie",
            radius: "40%",
            //center确定饼图的圆心位置
            center: ["50%", "55%"], // 圆心在页面正中间
            label: {
              show: false,
            },
            emphasis: {
              label: {
                show: true,
              },
              labelLine: {
                show: false,
              },
            },
          },
        ],
      };
      this.chartInstance.setOption(initOption);
    },
    async getData() {
      const { data: ret } = await this.$http.get("hot");
      console.log(ret);
      this.allData = ret;
      this.updataChart();
    },
    //处理数据
    updataChart() {
      //处理图表需要的数据
      const seriesData = this.allData[this.currentIndex].children.map(
        (item) => {
          return {
            name: item.name,
            value: item.value,
            children: item.children,
          };
        }
      );
      const legendData = this.allData[this.currentIndex].children.map(
        (item) => {
          return {
            name: item.name,
          };
        }
      );
      const dataOption = {
        legend: {
          data: legendData,
        },
        series: [
          {
            data: seriesData,
          },
        ],
      };
      this.chartInstance.setOption(dataOption);
    },
    screenAdapt() {
      this.titleFontSize = (this.$refs.hor_ref.offsetWidth / 100) * 3.6;
      const adaptOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize,
          },

          legend: {
            itemWidth: this.titleFontSize / 2,
            itemHeight: this.titleFontSize / 2,
            itemGap: this.titleFontSize / 8,
            textStyle: {
              fontSize: this.titleFontSize / 8,
            },
          },

          series: [
            {
              radius: this.titleFontSize * 3,
            },
          ],
        },
      };
      this.chartInstance.setOption(adaptOption);
      this.chartInstance.resize();
    },

    toLeft() {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = this.allData.length - 1;
      }
      this.updataChart();
    },

    toRight() {
      this.currentIndex++;
      if (this.currentIndex > this.allData.length - 1) {
        this.currentIndex = 0;
      }
      this.updataChart();
    },
  },

  watch: {
    theme() {
      console.log('主题切换了')
      this.chartInstance.dispose() //销毁echarts组件
      this.initChart() //创建一个新的echarts实例
      this.screenAdapt() //屏幕的适配
      this.updataChart() //更新图表的展示
    }
  }
};
</script>

<style lang="less" scoped>
.arr-left {
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: aliceblue;
}

.arr-right {
  position: absolute;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: aliceblue;
}

.catStyle {
  position: absolute;
  left: 80%;
  bottom: 20px;
  color: white;
}
</style>
