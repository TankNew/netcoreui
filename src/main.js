// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
//使BootStrap-vue支持到IE11
import 'babel-polyfill'
import PortalVue from 'portal-vue'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import store from './store'
import App from './App'
import { router } from './router/router.config'
import './utiltools/abp'
import './utiltools/abpbase'
import appconst from './utiltools/appconst'
import Ajax from './utiltools/ajax'
import tools from './utiltools/tools'

import './plugins/AxiosPlugin'
import './plugins/vee-validate'

import './assets/Layout.less'
import 'famfamfam-flags/dist/sprite/famfamfam-flags.css'
import DisableAutocomplete from 'vue-disable-autocomplete'

Vue.use(DisableAutocomplete)
Vue.use(Vuex)
Vue.use(PortalVue)
Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)
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
  alert(
    'This browser do not supports localStorage. Please change browser to ie 9.0 at least .'
  )
}

store.commit('readToken')
;(async () => {
  /* 保留main刷新token的原因： 是为了下面获取 abp.auth.grantedPermissions*/
  if (!store.getters.token || store.getters.isTokenExpired) {
    if (!store.getters.refreshToken) router.push({ path: '/login' })
    // 如果refresh的action失败，ajax应该将页面重定向到/login
    else
      await store.dispatch('refreshToken').then(function(response) {
        var json = response.data
        if (json.success === true) {
          store.commit('setToken', json.result)
        } else router.push({ path: '/login' })
      })
  }

  await Ajax.get('/AbpUserConfiguration/GetAll').then(data => {
    window.abp = tools.extend(true, window.abp, data.data.result)
    window.abp.localization.defaultSourceName =
      appconst.localization.defaultLocalizationSourceName
    window.abp.banner = {
      HomePageWidth: abp.setting.getInt('App.Banner.HomePageWidth'),
      HomePageHeight: abp.setting.getInt('App.Banner.HomePageHeight'),
      Width: abp.setting.getInt('App.Banner.Width'),
      Height: abp.setting.getInt('App.Banner.Height'),
      Interval: abp.setting.getInt('App.Banner.Interval')
    }
    window.abp.page = {
      width: abp.setting.getInt('App.Page.Width')
    }
    window.abp.catalogItem = {
      width: abp.setting.getInt('App.CatalogItem.Width')
    }
    window.abp.localization.languageDefineByBrower = abp.setting.getBoolean(
      'Abp.Localization.LanguageDefineByBrower'
    )

    console.log(abp)
    new Vue({
      el: '#app',
      router,
      store,
      components: { App },
      template: '<App/>',
      created() {}
    })
  })
})()
