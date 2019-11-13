// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import store from './store'
import App from './App'
import router from './router/router.config'
import VueDND from 'awe-dnd'
import { setToken, getToken, getUerFromLocalStorage } from './utiltools/auth'
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
if (!abp.utils.getCookieValue(abp.localization.cookieName)) {
    let language = navigator.language
    // if (language == 'zh-CN') language = 'zh-Hans'
    abp.utils.setCookieValue(
        abp.localization.cookieName,
        language,
        new Date(new Date().getTime() + 5 * 365 * 86400000),
        abp.appPath
    )
}

if (!window.localStorage) {
    alert('This browser do not supports localStorage. Please change browser to ie 9.0 at least .')
}
store.commit('setToken', getToken())
store.commit('setUser', getUerFromLocalStorage())
let mainLoad = async () => {
    if (!!store.getters.hastoken && store.getters.isTokenExpired)
        await Ajax.get(tools.tokenUrl + '/RefreshToken').then(function(response) {
            var json = response.data
            if (json.success === true) {
                let result = json.result
                let token = {
                    AccessToken: result.accessToken,
                    EncryptedAccessToken: result.encryptedAccessToken,
                    ExpireInSeconds: result.expireInSeconds,
                    RefreshToken: result.refreshToken
                }
                store.commit('setToken', token)
                store.commit('setUser', jwtDecode(token.AccessToken))
                setToken(token)
            } else next({ path: '/login', query: { Rurl: to.fullPath } })
        })
    router.beforeEach((to, from, next) => {
        store.commit('setToken', getToken())
        store.commit('setUser', getUerFromLocalStorage())
        if (to.matched.some(m => m.meta.auth)) {
            if (!store.getters.hastoken) next({ path: '/login', query: { Rurl: to.fullPath } })
            else if (!store.getters.isTokenExpired) next()
            else
                Ajax.get(tools.tokenUrl + '/RefreshToken')
                    .then(function(response) {
                        var json = response.data
                        if (json.success === true) {
                            let result = json.result
                            let token = {
                                AccessToken: result.accessToken,
                                EncryptedAccessToken: result.encryptedAccessToken,
                                ExpireInSeconds: result.expireInSeconds,
                                RefreshToken: result.refreshToken
                            }
                            store.commit('setToken', token)
                            store.commit('setUser', jwtDecode(token.AccessToken))
                            setToken(token)
                        } else next({ path: '/login', query: { Rurl: to.fullPath } })
                    })
                    .then(() => next())
        } else next()
    })
    await Ajax.get('/api/AntiForgery/GetToken')
    await Ajax.get('/AbpUserConfiguration/GetAll').then(data => {
        window.abp = tools.extend(true, window.abp, data.data.result)
        new Vue({
            el: '#app',
            router,
            store,
            components: { App },
            template: '<App/>',
            created() {}
        })
    })
}

mainLoad()
