<!--
针对于 /Rankpage 这条路径而显示出来的
在这个组件中, 通过子组件注册的方式, 要显示出Rank.vue这个组件
 -->
<template>
  <div class="com-page">
    <rank></rank>
    <div class="resize" @click="jump('/screen')">
      <!-- icon-compress-alt -->
      <span class="iconfont icon-compress-alt"></span>
    </div>
  </div>
</template>

<script>
import Rank from "../components/Rank.vue";
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
    rank: Rank,
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
