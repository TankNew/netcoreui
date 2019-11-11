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
if (!abp.utils.getCookieValue('Abp.Localization.CultureName')) {
    let language = navigator.language
    // if (language == 'zh-CN') language = 'zh-Hans'
    abp.utils.setCookieValue(
        'Abp.Localization.CultureName',
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
// 设置一个防伪令牌
Ajax.get('/api/AntiForgery/GetToken')
    .then(() => {
        if (!!store.getters.hastoken && store.getters.isTokenExpired)
            Ajax.get(tools.tokenUrl + '/RefreshToken').then(function(response) {
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
    })
    .then(() =>
        Ajax.get('/AbpUserConfiguration/GetAll').then(data => {
            window.abp = tools.extend(true, window.abp, data.data.result)
            router.beforeEach((to, from, next) => {
                store.commit('setToken', getToken())
                store.commit('setUser', getUerFromLocalStorage())
                if (to.matched.some(m => m.meta.auth)) {
                    if (!store.getters.hastoken) next({ path: '/login', query: { Rurl: to.fullPath } })
                    else if (!store.getters.isTokenExpired) next()
                    else {
                        // 未登录则跳转到登陆界面，query:{ Rurl: to.fullPath}表示把当前路由信息传递过去方便登录后跳转回来；
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
                            .catch(() => next({ path: '/login', query: { Rurl: to.fullPath } }))
                    }
                } else {
                    next()
                }
            })
            new Vue({
                el: '#app',
                router,
                store,
                components: { App },
                template: '<App/>',
                created() {
                    Ajax.post('/api/services/app/Account/IsTenantAvailable', { tenancyName: 'Default' }).then(res => {
                        let tenant = res.data.result
                        switch (tenant.state) {
                            case 1:
                                abp.multiTenancy.setTenantIdCookie(tenant.tenantId)
                                // location.reload()
                                return
                            case 2:
                                console.log(this.L('Error'))
                                console.log(this.L('TenantIsNotActive'))
                                break
                            case 3:
                                console.log(this.L('Error'))
                                console.log(this.L('ThereIsNoTenantDefinedWithName{0}', undefined, 'Default'))
                                break
                        }
                    })
                }
            })
        })
    )
