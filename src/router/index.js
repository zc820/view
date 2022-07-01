import Vue from 'vue'
import VueRouter from 'vue-router'

const SellerPage = () => import('../views/SellerPage.vue')
const TrendPage = () => import('../views/TrendPage.vue')
const HotPage = () => import('../views/HotPage.vue')
const MapPage = () => import('../views/MapPage.vue')
const StockPage = () => import('../views/StockPage.vue')
const RankPage = () => import('../views/RankPage.vue')
const ScreenPage = () => import('../views/ScreenPage')



Vue.use(VueRouter)

const routes = [
  {path:'/', redirect: '/screen'},
  {path:'/screen', component:ScreenPage},
  {path:'/sellerpage', component:SellerPage},
  {path:'/trendpage', component:TrendPage},
  {path:'/hotpage', component:HotPage},
  {path:'/mappage', component:MapPage},
  {path:'/stockpage', component:StockPage},
  {path:'/rankpage', component:RankPage}, 
]

const router = new VueRouter({
  routes,
  mode: "history"
})

export default router
