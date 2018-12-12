import axios from 'axios'
import store from '../store'

export const AxiosForm = axios.create({
  timeout: 5000,
  withCredentials: true,
  headers: {
    //'Content-Type': 'application/x-www-form-urlencoded'
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 设置axios拦截器 cors设置
AxiosForm.interceptors.request.use(
  config => {
    //添加token
    if (store.state.Users.currentUser.UserSign) {
      config.headers.Authorization = 'bearer ' + store.state.Users.currentUser.UserSign
    }
    return config
  }, function (error) {
    return Promise.reject(error)
  })
export default {
  install(Vue) {
    Object.defineProperty(Vue.prototype, '$httpform', { value: AxiosForm })
  }
}
