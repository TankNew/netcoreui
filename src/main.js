// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import store from './store'
import App from './App'
import router from './router/router.config'
import VueDND from 'awe-dnd'
import { getToken, getUerFromLocalStorage } from './utiltools/auth'
import Ajax from './utiltools/ajax'
import tools from './utiltools/tools'
import jwtDecode from 'jwt-decode'

//使BootStrap-vue支持到IE11
import 'babel-polyfill'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import './utiltools/abp'
import './utiltools/abpbase'

import './plugins/AxiosPlugin'
import './plugins/vee-validate'

import './assets/main.css'
import './assets/layout.css'
import 'famfamfam-flags/dist/sprite/famfamfam-flags.css'

import fileFolderLi from './components/custom/fileFolderLi.vue'
import filefolderUl from './components/custom/filefolderUl.vue'

Vue.component('file-fodler-li', fileFolderLi)
Vue.component('file-fodler-ul', filefolderUl)

Vue.use(VueDND)
Vue.use(Vuex)
Vue.use(BootstrapVue)
Vue.config.productionTip = false

// 设置ABP本地化
if (!abp.utils.getCookieValue('Abp.Localization.CultureName')) {
    let language = navigator.language
    abp.utils.setCookieValue(
        'Abp.Localization.CultureName',
        language,
        new Date(new Date().getTime() + 5 * 365 * 86400000),
        abp.appPath
    )
}

router.beforeEach((to, from, next) => {
    const currentUser = getUerFromLocalStorage()
    const token = getToken()
    store.commit('setUser', currentUser)
    store.commit('setToken', token)
    if (to.matched.some(m => m.meta.auth)) {
        // 对路由进行验证
        if (store.getters.isAuthenticated) {
            // 已经登陆
            next()
        } else {
            // 未登录则跳转到登陆界面，query:{ Rurl: to.fullPath}表示把当前路由信息传递过去方便登录后跳转回来；
            next({ path: '/login', query: { Rurl: to.fullPath } })
        }
    } else {
        next()
    }
})

if (!window.localStorage) {
    alert('This browser do not supports localStorage. Please change browser to ie 9.0 at least .')
}
// 设置一个防伪令牌
Ajax.get('/api/AntiForgery/GetToken')

Ajax.get('/AbpUserConfiguration/GetAll').then(data => {
    window.abp = tools.extend(true, window.abp, data.data.result)
    new Vue({
        el: '#app',
        router,
        store,
        components: { App },
        template: '<App/>',
        created() {
            console.log(`当前时间：${tools.myTime.CurTime()}`)
        }
    })
})
