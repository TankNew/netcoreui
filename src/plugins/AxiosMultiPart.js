import axios from 'axios'
import store from '../store'
import tools from 'tools'
import Vue from 'vue'

export const AxiosMulti = axios.create({
    withCredentials: true,
    headers: {
        'Content-Type': 'multipart/form-data'
    }
})
window.isRefresh = false

/*被挂起的请求数组*/
let refreshSubscribers = []

/*push所有请求到数组中*/
function subscribeTokenRefresh(cb) {
    refreshSubscribers.push(cb)
}

/*刷新请求（refreshSubscribers数组中的请求得到新的token之后会自执行，用新的token去请求数据）*/
function onRrefreshed(token) {
    refreshSubscribers.map(cb => cb(token))
}

// 设置axios拦截器 cors设置
AxiosMulti.interceptors.request.use(
    config => {
        //添加token
        if (store.getters.token.AccessToken) {
            config.headers.Authorization = 'bearer ' + store.getters.token.AccessToken
            var s = (store.state.Users.currentUser.ExpiresIn - tools.myTime.CurTime()) / 60
            if (s < 5) {
                if (!window.isRefresh) {
                    console.log('refresh token....................')
                    window.isRefresh = true
                    let url = tools.tokenUrl
                    var postdata = {
                        grant_type: 'refresh_token',
                        islocal: store.state.Users.currentUser.IsLocal,
                        username: '',
                        password: ''
                    }
                    var _config = {
                        timeout: 5000,
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json;charset=UTF-8'
                        }
                    }
                    axios
                        .post(url, JSON.stringify(postdata), _config)
                        .then(response => {
                            window.isRefresh = false
                            var json = response.data
                            store.commit('updateUser', {
                                UserSign: json.access_token,
                                ExpiresIn: json.expires_in,
                                IsLocal: store.state.Users.currentUser.IsLocal
                            })
                            /*执行数组里的函数,重新发起被挂起的请求*/
                            onRrefreshed(json.access_token)
                            /*执行onRefreshed函数后清空数组中保存的请求*/
                            refreshSubscribers = []
                        })
                        .catch(function(error) {
                            if (error.response) {
                                if (error.response.status === 400) {
                                    swal({
                                        title: '您的登陆授权已经过期，请重新登陆',
                                        icon: 'error'
                                    }).then(() => {
                                        window.location.href = '/login'
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
                    subscribeTokenRefresh(token => {
                        config.headers.Authorization = 'Bearer ' + token
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

AxiosMulti.interceptors.response.use(
    res => {
        //对响应数据做些事
        return res
    },
    error => {
        if (error.response) {
            if (error.response.status === 401) {
                // 401 说明 token 验证失败
                // 可以直接跳转到登录页面，重新登录获取 token
                window.location.href = '/login'
                return Promise.reject(error)
            } else if (error.response.status === 500) {
                // 服务器错误
                // do something
                return Promise.reject(error)
            }
        }
        // 返回 response 里的错误信息
        return Promise.reject(error)
    }
)

const AxiosMultiProperty = {
    install(Vue) {
        Object.defineProperty(Vue.prototype, '$httpmulti', { value: AxiosMulti })
    }
}

Vue.use(AxiosMultiProperty)
