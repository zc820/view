<template>
  <div class="screen-container" :style="containerStyle">
    <!-- <div class="aa">
      你好世界
      <p class="bb">你好中国</p>
    </div> -->

    <header class="screen-header">
      <div>
        <img :src="headerSrc" alt="" />
      </div>
      <span class="logo">
        <img :src="logoSrc" alt="" />
      </span>
      <span class="title">通用平台实时监控系统</span>
      <div class="title-right">
        <img :src="themeSrc" class="qiehuan" @click="handleChangeTheme" />
        <span class="datetime">2049-01-01 00:00:00</span>
      </div>
    </header>

    <div class="screen-body">
      <section class="screen-left">
        <div :class="['left-top', fullScreenStatus.trend ? 'fullscreen' : '']">
          <!-- 销量趋势图表 -->
          <Trend ref="trend"></Trend>
          <div class="resize">
            <!-- <div class="resize" @click="jump('/trendpage')"> -->
            <!-- icon-compress-alt -->
            <span @click="changeScreen('trend')" :class="['iconfont', fullScreenStatus.trend ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>

        <!-- <div class="left-bottom"> -->
        <div :class="['left-bottom', fullScreenStatus.seller ? 'fullscreen' : '']">
          <!-- 商家销售金额图表 -->
          <Seller ref="seller"></Seller>
          <div class="resize">
            <!-- <div class="resize" @click="jump('/sellerpage')"> -->
            <!-- icon-compress-alt -->
            <span @click="changeScreen('seller')" :class="['iconfont', fullScreenStatus.seller ? 'icon-compress-alt': 'icon-expand-alt']"></span>
          </div>
        </div>
      </section>

      <section class="screen-middle">
        <div class="middle-top">
          <!-- 商家分布图表 -->
          <Map ref="map"></Map>
          <div class="resize" @click="jump('/mappage')">
            <!-- icon-compress-alt -->
            <span class="iconfont icon-expand-alt"> </span>
          </div>
        </div>

        <div class="middle-bottom">
          <!-- 地区销量排行图表 -->
          <Rank ref="rank"></Rank>
          <div class="resize" @click="jump('/rankpage')">
            <!-- icon-compress-alt -->
            <span class="iconfont icon-expand-alt"></span>
          </div>
        </div>
      </section>

      <section class="screen-right">
        <div class="right-top">
          <!-- 热销商品占比图表 -->
          <Hot ref="hot"></Hot>
          <div class="resize" @click="jump('/hotpage')">
            <!-- icon-compress-alt -->
            <span class="iconfont icon-expand-alt"></span>
          </div>
        </div>

        <div class="right-bottom">
          <!-- 库存销量分析图表 -->
          <Stock ref="stock"></Stock>
          <div class="resize" @click="jump('/stockpage')">
            <!-- icon-compress-alt -->
            <span class="iconfont icon-expand-alt"></span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import Hot from "@/components/Hot.vue";
import Map from "@/components/Map.vue";
import Rank from "@/components/Rank.vue";
import Seller from "@/components/Seller.vue";
import Stock from "@/components/Stock.vue";
import Trend from "@/components/Trend.vue";
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'

export default {
  data() {
    return {
      // 定义每一个图表的全屏状态
      fullScreenStatus: {
        trend: false,
        seller: false,
        map: false,
        rank: false,
        hot: false,
        stock: false,
      },
    };
  },
  _components: {
    //相当于 Hot:Hot
    Hot,
    Map,
    Rank,
    Seller,
    Stock,
    Trend,
  },
  // components: {
  // Hot:Hot,
  // Map:Map,
  // Rank:Rank,
  // Seller:Seller,
  // Stock:Stock,
  // Trend:Trend,
  // },
  get components() {
    return this._components;
  },
  set components(value) {
    this._components = value;
  },

  created() {
    // 在组件创建完成之后 进行回调函数的注册
    this.$socket.registerCallBack("fullScreen", this.recvData);
    this.$socket.registerCallBack("themeChange", this.recvThemeChange);
  },

  destroyed() {
    this.$socket.unRegisterCallBack("fullScreen");
    this.$socket.unRegisterCallBack("themeChange");
  },

  computed:{
    ...mapState(['theme']),

    logoSrc () {
      return '/static/img/' + getThemeValue(this.theme).logoSrc
    },
    headerSrc () {
      return '/static/img/' + getThemeValue(this.theme).headerBorderSrc
    },
    themeSrc () {
      return '/static/img/' + getThemeValue(this.theme).themeSrc
    },
    containerStyle () {
      return {
        backgroundColor: getThemeValue(this.theme).backgroundColor,
        color: getThemeValue(this.theme).titleColor
      }
    },
  },
  
  methods: {
    jump(adr) {
      // console.log(adr)
      this.$router.push(adr);
    },

    changeScreen(chartName) {
      // this.fullScreenStatus[chartName] = !this.fullScreenStatus[chartName]
      // this.$nextTick(() => {
      //   this.$refs[chartName].screenAdapt()
      // })

      // 将数据发送给服务端
      const targetValue = !this.fullScreenStatus[chartName];
      this.$socket.send({
        action: "fullScreen",
        socketType: "fullScreen",
        chartName: chartName,
        value: targetValue,
      });
    },
    // 接收到全屏数据之后的处理
    recvData(combackData) {
      console.log(combackData)
      // 取出是哪一个图表需要进行切换
      const chartName = combackData.chartName;
      // 取出value, 判断是否切换全屏
      const targetValue = combackData.value;
      this.fullScreenStatus[chartName] = targetValue;
      this.$nextTick(() => {
        this.$refs[chartName].screenAdapt()
      })
    },

    handleChangeTheme() {
      //修改vuex中的数据
      //this.$store.commit('changeTheme')

      //切换主题的联动效果
      this.$socket.send({
        action: 'themeChange',
        socketType: 'themeChange',
        chartName: '',
        value: ''
      })
    },

    recvThemeChange() {
      this.$store.commit('changeTheme')
    },
  },
};
</script>

<style lang="less" scoped>
// .aa {
//   color: pink;
//   font-size: 30px;
//   .bb {
//     color: purple;
//     font-size: 50px;
//   }
// }
// 全屏样式的定义
.fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  z-index: 100;
}

.screen-container {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  background-color: #161522;
  color: #fff;
  box-sizing: border-box;
}
.screen-header {
  width: 100%;
  height: 64px;
  font-size: 20px;
  position: relative;
  > div {
    img {
      width: 100%;
    }
  }
  .title {
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 20px;
    transform: translate(-50%, -50%);
  }
  .title-right {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-80%);
  }
  .qiehuan {
    width: 28px;
    height: 21px;
    cursor: pointer;
  }
  .datetime {
    font-size: 15px;
    margin-left: 10px;
  }
  .logo {
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-80%);
    img {
      height: 35px;
      width: 128px;
    }
  }
}
.screen-body {
  width: 100%;
  height: 100%;
  display: flex;
  margin-top: 10px;
  .screen-left {
    height: 100%;
    width: 27.6%;
    .left-top {
      height: 53%;
      position: relative;
    }
    .left-bottom {
      height: 31%;
      margin-top: 25px;
      position: relative;
    }
  }
  .screen-middle {
    height: 100%;
    width: 41.5%;
    margin-left: 1.6%;
    margin-right: 1.6%;
    .middle-top {
      width: 100%;
      height: 56%;
      position: relative;
    }
    .middle-bottom {
      margin-top: 25px;
      width: 100%;
      height: 28%;
      position: relative;
    }
  }
  .screen-right {
    height: 100%;
    width: 27.6%;
    .right-top {
      height: 46%;
      position: relative;
    }
    .right-bottom {
      height: 38%;
      margin-top: 25px;
      position: relative;
    }
  }
}

.resize {
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
}

// 边框红颜色
// section > div {
//   border: 1px solid red;
// }
</style>