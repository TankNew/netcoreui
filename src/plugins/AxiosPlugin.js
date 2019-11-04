import axios from 'axios'
import store from '../store'
import tools from 'tools'
import Vue from 'vue'
import Ajax from '../utiltools/ajax'
import appconst from '../utiltools/appconst'
import { setToken, getToken, getUerFromLocalStorage } from '../utiltools/auth'

export const Axios = axios.create({
    baseURL: appconst.remoteServiceBaseUrl,
    timeout: 5000
})
window.isRefresh = false

/*被挂起的请求数组*/
let refreshSubscribers = []

/*push所有请求到数组中*/
function subscribeTokenRefresh(cb) {
    refreshSubscribers.push(cb)
}

/*刷新请求（refreshSubscribers数组中的请求得到新的token之后会自执行，用新的token去请求数据）*/
function onRrefreshed(token, refreshToken) {
    refreshSubscribers.map(cb => cb(token, refreshToken))
}

// 设置axios拦截器 cors设置
Axios.interceptors.request.use(
    config => {
        //添加token
        if (store.getters.hastoken) {
            config.headers.common['Authorization'] = 'Bearer ' + store.getters.token.AccessToken
            config.headers.common['RefreshToken'] = store.getters.token.RefreshToken
            // config.headers.common['.AspNetCore.Culture'] = window.abp.utils.getCookieValue(
            //     'Abp.Localization.CultureName'
            // )
            // config.headers.common['Abp.TenantId'] = window.abp.multiTenancy.getTenantIdCookie()
            let s = (store.getters.currentUser.exp - tools.myTime.CurTime()) / 60
            console.log(s)
            if (s < 5) {
                if (!window.isRefresh) {
                    console.log('refresh token....................')
                    window.isRefresh = true

                    Ajax.get('/api/TokenAuth/RefreshToken')
                        .then(response => {
                            window.isRefresh = false
                            var json = response.data
                            if (json.success === true) {
                                let result = json.result
                                let token = {
                                    AccessToken: result.accessToken,
                                    EncryptedAccessToken: result.encryptedAccessToken,
                                    ExpireInSeconds: result.expireInSeconds,
                                    RefreshToken: result.refreshToken
                                }
                                setToken(token)
                                store.commit('setUser', getUerFromLocalStorage())
                                store.commit('setToken', getToken())
                                /*执行数组里的函数,重新发起被挂起的请求*/
                                onRrefreshed(token.AccessToken, token.RefreshToken)
                                /*执行onRefreshed函数后清空数组中保存的请求*/
                                refreshSubscribers = []
                            } else console.error(json)
                        })
                        .catch(function(error) {
                            if (error.response) {
                                if (error.response.status === 400) {
                                    swal({
                                        title: '您的登陆授权已经过期，请重新登陆',
                                        icon: 'error'
                                    }).then(() => {
                                        window.location.href = '#/login'
                                    })
                                }
                            } else if (error.request) {
                                console.log(error.request)
                            } else {
                                console.log('Error', error.message)
                            }
                            console.log(error.config)
                        })
                }
                let retry = new Promise((resolve, reject) => {
                    /*(token) => {...}这个函数就是回调函数*/
                    subscribeTokenRefresh((token, refreshToken) => {
                        config.headers.common['Authorization'] = 'Bearer ' + token.AccessToken
                        config.headers.common['RefreshToken'] = refreshToken
                        /*将请求挂起*/
                        resolve(config)
                    })
                })
                return retry
            }
        }
        return config
    },
    err => {
        return Promise.reject(err)
    }
)

Axios.interceptors.response.use(
    res => {
        //对响应数据做些事
        return res
    },
    error => {
        if (error.response) {
            console.log(error.response.data.error)
            swal({
                title: `远程服务器连接出错：${error.response.status}`,
                icon: 'error'
            })
            if (error.response.status === 401) {
                // 401 说明 token 验证失败
                // 可以直接跳转到登录页面，重新登录获取 token
            } else if (error.response.status === 500) {
                // 服务器错误
                // do something
            }
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request)
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message)
        }
        // console.log(error.config)
        // 返回 response 里的错误信息
        return Promise.reject(error)
    }
)
const AxiosProperty = {
    install(Vue) {
        Object.defineProperty(Vue.prototype, '$http', { value: Axios })
    }
}
Vue.use(AxiosProperty)
