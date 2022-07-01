<!--
针对于 /stockpage 这条路径而显示出来的
在这个组件中, 通过子组件注册的方式, 要显示出Stock.vue这个组件
 -->
<template>
  <div class="com-page">
    <stock></stock>
    <div class="resize" @click="jump('/screen')">
      <!-- icon-compress-alt -->
      <span class="iconfont icon-compress-alt"></span>
    </div>
  </div>
</template>

<script>
import Stock from "../components/Stock.vue";
export default {
  data() {
    return {};
  },

  created() {},

  methods: {
    jump(adr) {
      // console.log(adr)
      this.$router.push(adr);
    },
  },
  //局部组件注册
  components: {
    stock: Stock,
  },
};
</script>

<style lang="less" scoped>
.resize {
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
  color: white;
}
</style>
