import axios from 'axios'
import appconst from './appconst'
import swal from 'sweetalert'
const ajax = axios.create({
  baseURL: appconst.remoteServiceBaseUrl,
  timeout: 30000,
  withCredentials: true
})

ajax.interceptors.request.use(
  config => {
    if (window.abp.auth.getToken()) {
      config.headers.common['Authorization'] = 'Bearer ' + window.abp.auth.getToken()
    }

    if (window.abp.auth.getRefreshToken()) {
      config.headers.common['RefreshToken'] = window.abp.auth.getRefreshToken()
    }

    config.headers.common['.AspNetCore.Culture'] = window.abp.utils.getCookieValue(
      '.AspNetCore.Culture'
    )

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
    } else if (
      !!error.response &&
      !!error.response.data.error &&
      !!error.response.data.error.message
    ) {
      swal({
        title: `${window.abp.localization.localize('Error')}:Code${error.response.data.error.status}`,
        text: error.response.data.error.message,
        icon: 'error'
      }).then(res => {
        window.abp.auth.clearToken()
        location.replace('/login')
      })
    } else if (!error.response) {
      swal({
        title: window.abp.localization.localize('UnknownError'),
        icon: 'error'
      })
    }
    console.error('Error', error)
    return Promise.reject(error)
  }
)
export default ajax
