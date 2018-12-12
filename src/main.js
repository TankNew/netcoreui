// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import store from './store'
import App from './App'
import router from './router/router.config'
import VeeValidate from 'vee-validate'
import './services/Validator.config'
import AxiosPlugin, { Axios } from './services/AxiosPlugin'
import AxiosMultiPart from './services/AxiosMultiPart'
import AxiosForm from './services/AxiosForm'
import VueDND from 'awe-dnd'

//使BootStrap-vue支持到IE11
import 'babel-polyfill'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import './assets/main.css'
import './assets/layout.css'

import fileFolderLi from './components/custom/fileFolderLi.vue'
import filefolderUl from './components/custom/filefolderUl.vue'

Vue.component('file-fodler-li', fileFolderLi)
Vue.component('file-fodler-ul', filefolderUl)


Vue.use(AxiosPlugin)
Vue.use(AxiosMultiPart)
Vue.use(AxiosForm)
Vue.use(VueDND)

const Veeconfig = {
  errorBagName: 'errors', // change if property conflicts.
  fieldsBagName: 'vvFields',
  delay: 0,
  events: 'input|blur',
  locale: 'zh_CN',
  strict: true
}

Vue.use(Vuex)
Vue.use(VeeValidate, Veeconfig)
Vue.use(BootstrapVue)
Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
  if (to.matched.some(m => m.meta.auth)) {
    // 对路由进行验证
    if (store.state.Users.currentUser.UserSign) { // 已经登陆
      //检查过期时间然后再进行验证，上面这条
      //var s = (store.state.Users.currentUser.ExpiresIn - tools.myTime.CurTime()) / 60
      //if (s < 5)
      //  Axios.get(tools.HttpUrl + '/api/account')
      next()
    } else {
      // 未登录则跳转到登陆界面，query:{ Rurl: to.fullPath}表示把当前路由信息传递过去方便登录后跳转回来；
      next({ path: '/login', query: { Rurl: to.fullPath } })
    }
  }
  else {
    next()
  }
})

if (!window.localStorage) {
  alert('This browser do not supports localStorage. Please change browser to ie 9.0 at least .')
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
