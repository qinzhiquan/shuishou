import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    timer:[],
    now_time:'00:00:00',
    all_time:0,//定时器所有时间
    time:null,//定时器
    timer_status:false,//定时器状态
  },
  mutations: {
    push_timer:(state,timer)=>{
      state.timer.push(timer);
    },
    now_time:(state,timer)=>{
      state.now_time = timer
    },
    delete_timer:(state)=>{
      state.timer=[]
    },
    all_time:(state,timer)=>{
      state.all_time = timer
    },
    time:(state,timer)=> {
      state.time = timer
    },
    timer_status:(state,timer)=> {
      state.timer_status = timer
    },
  },
  actions: {
  },
  modules: {
  }
})
