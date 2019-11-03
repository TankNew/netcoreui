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
import jwtDecode from 'jwt-decode'

//使BootStrap-vue支持到IE11
import 'babel-polyfill'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import './utiltools/abp'

import './plugins/AxiosMultiPart'
import './plugins/AxiosPlugin'
import './plugins/vee-validate'

import './assets/main.css'
import './assets/layout.css'

import fileFolderLi from './components/custom/fileFolderLi.vue'
import filefolderUl from './components/custom/filefolderUl.vue'

Vue.component('file-fodler-li', fileFolderLi)
Vue.component('file-fodler-ul', filefolderUl)

Vue.use(VueDND)
Vue.use(Vuex)
Vue.use(BootstrapVue)
Vue.config.productionTip = false

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
Ajax.get('/AbpUserConfiguration/GetAll').then(data => {
    // console.log(JSON.stringify(data.data.result))
    new Vue({
        el: '#app',
        router,
        store,
        components: { App },
        template: '<App/>',
        created() {
            const currentUser = getUerFromLocalStorage()
            const token = getToken()
            this.$store.commit('setUser', currentUser)
            this.$store.commit('setToken', token)
            var decoded = jwtDecode(this.$store.getters.token.AccessToken)
            // console.log(JSON.stringify(this.$store.state.users.token))
            console.log(decoded)

            // console.log(window.abp.pageLoadTime)
            // console.log(window.abp.utils.getCookieValue('Abp.Localization.CultureName'))
            // console.log(window.abp.auth.getToken())
            // console.log(window.abp.multiTenancy.getTenantIdCookie())
        }
    })
})
