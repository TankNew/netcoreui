import Vue from 'vue'
import axios from 'axios'
import store from '../store'
import appconst from '../utiltools/appconst'

const Axios = axios.create({
  baseURL: appconst.remoteServiceBaseUrl,
  timeout: 30000,
  withCredentials: true //必须添加，否则服务器无法设置COOKIE
})
window.isRefresh = false

/*被挂起的请求数组*/
let refreshSubscribers = []

/*push所有请求到数组中*/
function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb)
}

/*刷新请求（refreshSubscribers数组中的请求得到新的token之后会自执行，用新的token去请求数据）*/
function onRrefreshed(accessToken, refreshToken) {
  refreshSubscribers.map(cb => cb(accessToken, refreshToken))
}

// 设置axios拦截器 cors设置
Axios.interceptors.request.use(
  config => {
    store.commit('readToken')

    config.headers.common[window.abp.localization.cookieName] = window.abp.utils.getCookieValue(
      abp.localization.cookieName
    )
    config.headers.common[
      window.abp.multiTenancy.tenantIdCookieName
    ] = window.abp.multiTenancy.getTenantIdCookie()

    if (store.getters.token)
      config.headers.common['Authorization'] = 'Bearer ' + store.getters.token
    if (store.getters.refreshToken)
      config.headers.common['RefreshToken'] = store.getters.refreshToken

    // 如果无access_token 或者 由客户端提前过期，并且存在刷新token
    if ((!store.getters.token || store.getters.isTokenExpired) && store.getters.refreshToken) {
      if (!window.isRefresh) {
        window.isRefresh = true

        // 这里不能做异步处理，否则会导致无法执行挂起的请求
        store
          .dispatch('refreshToken')
          .then(response => {
            window.isRefresh = false
            var json = response.data

            if (json.success === true) {
              store.commit('setToken', json.result)
              /*执行数组里的函数,重新发起被挂起的请求*/
              onRrefreshed(store.getters.token, store.getters.refreshToken)
              /*执行onRefreshed函数后清空数组中保存的请求*/
              refreshSubscribers = []
            } else console.error(json)
          })
          .catch(() => {
            window.isRefresh = false
          })
      }

      let retry = new Promise((resolve, reject) => {
        /*(token) => {...}这个函数就是回调函数*/
        subscribeTokenRefresh((accessToken, refreshToken) => {
          config.headers.common['Authorization'] = 'Bearer ' + accessToken
          config.headers.common['RefreshToken'] = refreshToken
          /*将请求挂起*/
          resolve(config)
        })
      })
      return retry
    }

    return config
  },
  err => {
    return Promise.reject(err)
  }
)

Axios.interceptors.response.use(
  respon => {
    //对响应数据做些事
    return respon
  },
  error => {
    if (
      !!error.response &&
      !!error.response.data.error &&
      !!error.response.data.error.message &&
      error.response.data.error.details
    ) {
      swal({
        title: error.response.data.error.message,
        text: error.response.data.error.details,
        icon: 'error'
      })
      console.error(error.response)
    } else if (
      !!error.response &&
      !!error.response.data.error &&
      !!error.response.data.error.message
    ) {
      swal({
        title: `${window.abp.localization.localize('Error')}:Code${error.response.status}`,
        text: error.response.data.error.message,
        icon: 'error'
      })
      console.error(error.response)
    } else if (!error.response) {
      // Something happened in setting up the request that triggered an Error
      swal({
        title: `${window.abp.localization.localize('UnknownError')}`,
        icon: 'error'
      })
    }
    console.error('Error', error)
    return Promise.reject(error)
  }
)
const AxiosProperty = {
  install(Vue) {
    Object.defineProperty(Vue.prototype, '$axios', { value: Axios })
  }
}
Vue.use(AxiosProperty)

export default Axios
