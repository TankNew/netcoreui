import axios from 'axios'
import appconst from './appconst'
import store from '../store'
import swal from 'sweetalert'
import { getToken, getUerFromLocalStorage, unsetToken } from './auth'
const ajax = axios.create({
    baseURL: appconst.remoteServiceBaseUrl,
    timeout: 30000,
    withCredentials: true
})
ajax.interceptors.request.use(
    config => {
        /**使用Cookie的方式 */
        // if (window.abp.auth.getToken()) {
        //     config.headers.common['Authorization'] = 'Bearer ' + window.abp.auth.getToken()
        // }
        // config.headers.common['.AspNetCore.Culture'] = window.abp.utils.getCookieValue(abp.localization.cookieName)
        // config.headers.common['Abp.TenantId'] = window.abp.multiTenancy.getTenantIdCookie()

        /**使用localStorage的方式 */
        // 要即时获取，不能提前获取，否则不能更新数据
        store.commit('setToken', getToken())
        store.commit('setUser', getUerFromLocalStorage())
        if (store.getters.token) {
            config.headers.common['Authorization'] = 'Bearer ' + store.getters.token.AccessToken
            config.headers.common['RefreshToken'] = store.getters.token.RefreshToken
        }
        config.headers.common['.AspNetCore.Culture'] = window.abp.utils.getCookieValue(abp.localization.cookieName)
        config.headers.common['Abp.TenantId'] = window.abp.multiTenancy.getTenantIdCookie()

        return config
    },
    function(error) {
        return Promise.reject(error)
    }
)
ajax.interceptors.response.use(
    respon => {
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
        } else if (!!error.response && !!error.response.data.error && !!error.response.data.error.message) {
            swal({
                title: window.abp.localization.localize('LoginFailed'),
                text: error.response.data.error.message,
                icon: 'error'
            }).then(res => {
                unsetToken()
                location.replace('/login')
            })
        } else if (!error.response) {
            swal({
                title: window.abp.localization.localize('UnknownError'),
                icon: 'error'
            })
        }
        return Promise.reject(error)
    }
)
export default ajax
