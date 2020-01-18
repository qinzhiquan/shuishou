import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI);

Vue.config.productionTip = false;

Vue.prototype.$axios = axios
axios.defaults.baseURL = '/api'
axios.defaults.headers.post['Content-Type'] = 'application/json';

// axios.defaults.bashURL = 'http://localhost:8082/';
axios.interceptors.request.use(config=>{
   config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
