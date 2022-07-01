<template>
  <div class="com-container">
    <div class="title" :style="comStyle">
      <span>{{ "▎ " + showTitle }}</span>
      <span
        class="iconfont title-icon"
        @click="showChoice = !showChoice"
        :style="comStyle"
        >&#xe6eb;</span
      >
      <div class="select-con" v-show="showChoice" :style="marginStyle">
        <!-- <div class="select-item" v-for="item in selectType" :key="item.key" @click="handleSelect(item.key)" style="text-indent:0.9em">{{item.text}}</div> -->
        <div
          class="select-item"
          v-for="item in selectType"
          :key="item.key"
          @click="handleSelect(item.key)"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>

<script>
import { getThemeValue } from '../utils/theme_utils'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      chartInstance: null,
      allData: null, // 服务器返回的数据
      showChoice: false, // 是否显示可选项
      choiceType: "map",
      titleFontSize: 0, // 指明标题的字体大小
    };
  },

  created() {
    // 在组件创建完成之后 进行回调函数的注册
    this.$socket.registerCallBack("trendData", this.getData);
  },

  mounted() {
    this.initChart();
    // this.getData();
    //发送数据给服务器，告诉服务器我现在需要数据
    this.$socket.send({
      action: "getData",
      socketType: "trendData",
      chartName: "trend",
      value: "",
    });
    window.addEventListener("resize", this.screenAdapt);
    this.screenAdapt();
  },

  destroyed() {
    window.removeEventListener("resize", this.screenAdapt);
    // 在组件销毁的时候, 进行回调函数的取消
    this.$socket.unRegisterCallBack("trendData");
  },

  computed: {
    ...mapState(['theme']),
    selectType() {
      if (!this.allData) {
        return [];
      } else {
        return this.allData.type.filter((item) => {
          return item.key !== this.choiceType;
        });
      }
    },

    showTitle() {
      if (!this.allData) {
        return "";
      } else {
        return this.allData[this.choiceType].title;
      }
    },
    //设置给标题的计算属性
    comStyle() {
      return {
        fontSize: this.titleFontSize + "px",
        color: getThemeValue(this.theme).titleColor
      };
    },

    marginStyle() {
      return {
        marginLeft: this.titleFontSize + "px",
      };
    },

    
  },

  watch: {
    theme() {
      this.chartInstance.dispose() //销毁echarts组件
      this.initChart() //创建一个新的echarts实例
      this.screenAdapt() //屏幕的适配
      this.updataChart() //更新图表的展示
    },
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.trend_ref, this.theme);
      const initOption = {
        grid: {
          left: "3%",
          top: "35%",
          right: "4%",
          bottom: "5%",
          containLabel: true,
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          left: 20,
          top: "18%",
          icon: "circle",
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
        },

        yAxis: {
          type: "value",
        },
      };
      this.chartInstance.setOption(initOption);
    },

    // async getData() {
    //   const {data:ret} = await this.$http.get('trend')
    //   console.log(ret)
    //   this.allData = ret
    //   this.updataChart()
    // },

    //此处ret 由socket_sev.js中的realData传来
    getData(ret) {
      console.log(ret);
      this.allData = ret;
      this.updataChart();
    },

    //处理数据
    updataChart() {
      // 半透明的颜色值
      const colorArr1 = [
        "rgba(11, 168, 44, 0.5)",
        "rgba(44, 110, 255, 0.5)",
        "rgba(22, 242, 217, 0.5)",
        "rgba(254, 33, 30, 0.5)",
        "rgba(250, 105, 0, 0.5)",
      ];
      // 全透明的颜色值
      const colorArr2 = [
        "rgba(11, 168, 44, 0)",
        "rgba(44, 110, 255, 0)",
        "rgba(22, 242, 217, 0)",
        "rgba(254, 33, 30, 0)",
        "rgba(250, 105, 0, 0)",
      ];
      //x轴
      const timeArr = this.allData.common.month;
      //y轴
      const vauleArr = this.allData[this.choiceType].data;
      const seriesArr = vauleArr.map((item, index) => {
        return {
          name: item.name,
          type: "line",
          data: item.data,
          stack: this.choiceType, // 堆叠样式
          areaStyle: {
            //设置颜色渐变
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colorArr1[index] }, //0%的颜色值
              { offset: 1, color: colorArr2[index] }, //100%的颜色值
            ]),
          }, //填充面积
        };
      });

      const legendArr = vauleArr.map((item) => {
        return item.name;
      });

      const dataOption = {
        xAxis: {
          data: timeArr,
        },
        legend: {
          data: legendArr,
        },
        series: seriesArr,
      };

      this.chartInstance.setOption(dataOption);
    },
    screenAdapt() {
      this.titleFontSize = (this.$refs.trend_ref.offsetWidth / 100) * 3.6;
      const adaptOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 2,
          },
        },
      };
      this.chartInstance.setOption(adaptOption);
      this.chartInstance.resize();
    },

    handleSelect(currentType) {
      this.choiceType = currentType;
      this.updataChart();
      this.showChoice = false;
    },
  },
};
</script>

<style lang="less" scoped>
.title {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 11;
  color: white;

  .title-icon {
    margin-left: 10px;
    cursor: pointer;
  }

  .select-con {
    background-color: #222733;
  }
}
</style>