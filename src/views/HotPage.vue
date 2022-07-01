<!--
针对于 /hotpage 这条路径而显示出来的
在这个组件中, 通过子组件注册的方式, 要显示出Hot.vue这个组件
 -->
<template>
  <div class="com-page">
    <hot></hot>
    <div class="resize" @click="jump('/screen')">
      <!-- icon-compress-alt -->
      <span class="iconfont icon-compress-alt"></span>
    </div>
  </div>
</template>

<script>
import Hot from "../components/Hot.vue";
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
    hot: Hot,
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
  // z-index: 99;
}
</style>
