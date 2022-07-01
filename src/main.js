import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
//引入全局样式文件
import './assets/css/global.less'
//引入字体文件
import './assets/font/iconfont.css'

import axios from 'axios'

//对服务端进行webSocket的连接
import SocketService from './utils/socket_sev'
SocketService.Instance.connect()

// 请求基准路径的配置
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/'
// 将axios挂载到Vue的原型对象上
// 在别的组件中 this.$http
Vue.prototype.$http = axios

// 将全局的echarts对象挂载到Vue的原型对象上
// 别的组件中 this.$echarts
Vue.prototype.$echarts = window.echarts

//其他组件可以通过 this.$socket 来得到SocketService类上的Instance对象
Vue.prototype.$socket = SocketService.Instance

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
