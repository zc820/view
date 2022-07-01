<template>
  <div class="com-page">
    <trend></trend>
  </div>
</template>

<script>
import Trend from '../components/Trend.vue'
export default {
  data() {
    return {}
  },
  components: {
    //局部组件注册
    trend: Trend,
  },
}
</script>

<style lang="less" scoped>

</style>