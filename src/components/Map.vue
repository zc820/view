
<template>
  <div class="com-container" @dblclick="revertMap">
    <div class="com-chart" ref="map_ref"></div>
  </div>
</template>
<script>
import axios from "axios";
//按需导入
import { getProvinceMapInfo } from "../utils/map_utils";
export default {
  data() {
    return {
      chartInstance: null,
      allData: null, // 服务器返回的数据
      mapData: {}, // 所获取的省份的地图矢量数据
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
  methods: {
    async initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.map_ref, "chalk");
      // 获取中国地图的矢量数据
      // http://localhost:8999/static/map/china.json
      // 由于我们现在获取的地图矢量数据并不是位于KOA2的后台, 所以咱们不能使用this.$http
      const ret = await axios.get(
        "http://localhost:8999/static/map/china.json"
      );
      this.$echarts.registerMap("chinaMap", ret.data);
      const initOption = {
        title: {
          text: "商家分布",
          left: 20,
          top: 20,
        },
        geo: {
          type: "map",
          map: "chinaMap",
          top: "5%",
          bottom: "5%",
          // left: '3%',
          // right: '3%',
          itemStyle: {
            areaColor: "#2E72BF",
            borderColor: "#333",
          },
          label: {
            show: true,
          },
        },
        legend: {
          left: "5%",
          bottom: "5%",
          orient: "verticle",
        },
      };
      this.chartInstance.setOption(initOption);

      //单击进入省份地图
      //arg包含我们所点击省份的相关信息
      //此处不能写成 async function(arg) {} 会报错
      this.chartInstance.on("click", async (arg) => {
        // console.log(arg)
        const provinceInfo = getProvinceMapInfo(arg.name);
        console.log(provinceInfo);
        // 需要获取这个省份的地图矢量数据
        // 判断当前所点击的这个省份的地图矢量数据在mapData中是否存在
        if (!this.mapData[provinceInfo.key]) {
          const ret = await axios.get(
            "http://localhost:8999" + provinceInfo.path
          );
          this.mapData[provinceInfo.key] = ret.data
          console.log(ret);
          this.$echarts.registerMap(provinceInfo.key, ret.data);
        }

        const changeOption = {
          geo: {
            map: provinceInfo.key,
          },
        };
        this.chartInstance.setOption(changeOption);
      });
    },

    async getData() {
      const { data: ret } = await this.$http.get("map");
      this.allData = ret;
      console.log(ret);
      this.updataChart();
      // console.log(ret[1].children)
    },
    //处理数据
    updataChart() {
      const legendArr = this.allData.map((item) => {
        return item.name;
      });
      const seriesArr = this.allData.map((item) => {
        // return的这个对象就代表的是一个类别下的所有散点数据
        // 如果想在地图中显示散点的数据, 我们需要给散点的图表增加一个配置, coordinateSystem:geo
        //返回一个类别下的所有散点数据
        //如果想在地图中显示散点数据，需要给散点的图标增加一个配置coordinateSystem.geo
        return {
          type: "effectScatter",
          //涟漪效果
          rippleEffect: {
            scale: 5,
            brushType: "stroke",
          },
          name: item.name,
          data: item.children,
          coordinateSystem: "geo", // 表示散点将会使用地图坐标
          // geoIndex: 0
        };
      });
      const dataOption = {
        series: seriesArr,
        legend: {
          data: legendArr,
        },
      };
      this.chartInstance.setOption(dataOption);
    },

    screenAdapt() {
      const titleFontSize = (this.$refs.map_ref.offsetWidth / 100) * 3.6;
      const adaptOption = {
        title: {
          textStyle: {
            //标题大小自适应
            fontSize: titleFontSize,
          },
        },
        //图例自适应
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemGap: titleFontSize / 2,
          textStyle: {
            //图例文字大小自适应
            fontSize: titleFontSize / 2,
          },
        },
      };
      this.chartInstance.setOption(adaptOption);
      //帮助地图自适应
      this.chartInstance.resize();
    },

    revertMap() {
      const revertOption = {
        geo: {
          map: "chinaMap",
        },
      };

      this.chartInstance.setOption(revertOption);
    },
  },
};
</script>
<style lang="less" scoped>
</style>
