import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
import Judge from '../components/judge/Judge'
import Contest from '../components/contest/Contest'
import Competitor from "../components/competitor/Competitor";
import Toolbox from '../components/toolbox/Toolbox'
import Information from '../components/information/Information'
import Judge_home from '../components/Judge'


Vue.use(VueRouter)

const router = new VueRouter({
  routes:[
    {path:'/', redirect:'/login'},
    {path: '/login', component: Login},
    {
      path: '/home',
      component: Home,
      redirect:'/welcome',
      children:[
        {path:'/welcome',component:Welcome},
          {path:'/judge_list',component:Judge},
          {path:'/contest_list',component:Contest},
          {path:'/competitor_list',component:Competitor},
          {path:'/information',component:Information},
        {path:'/toolbox',component:Toolbox}
      ]
    },
      {path: '/judge', component: Judge_home}
  ]
})

router.beforeEach((to,from,next)=>{
  if(to.path==='/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next();
})




export default router
