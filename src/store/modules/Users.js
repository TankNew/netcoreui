import tools from 'tools'
import router from '../../router/router.config'
import swal from 'sweetalert'
import axios from 'axios'
import { AxiosForm } from '../../services/AxiosForm'
export default {
  state: {
    currentUser: {
      get IsLocal() {
        return localStorage.getItem('IsLocal') === 'true'
      },
      get ExpiresIn() {
        return localStorage.getItem('ExpiresIn')
      },
      get UserSign() {
        return localStorage.getItem('UserSign')
      }
    }
  },
  mutations: {
    setUser(state, { UserSign, ExpiresIn, IsLocal, Rurl }) {
      localStorage.setItem('UserSign', UserSign)
      localStorage.setItem('ExpiresIn', ExpiresIn)
      localStorage.setItem('IsLocal', IsLocal)

      if (Rurl === null || Rurl === undefined) {
        router.push({ path: '/home/hello' })
      } else {
        router.push({ path: Rurl })
      }
    },
    updateUser(state, { UserSign, ExpiresIn, IsLocal }) {
      localStorage.setItem('UserSign', UserSign)
      localStorage.setItem('ExpiresIn', ExpiresIn)
      localStorage.setItem('IsLocal', IsLocal)
    },
    logout() {
      let url = tools.tokenUrl
      axios.post(url + '/logout')
      localStorage.removeItem('ExpiresIn')
      localStorage.removeItem('UserSign')
      localStorage.removeItem('IsLocal')
      router.push({ path: '/login' })
    }
  },
  actions: {
    userLogin(context, { UserName, UserPass, IsLocal, Rurl }) {
      let url = tools.tokenUrl

      var postdata = {
        grant_type: 'password',
        islocal: IsLocal,
        username: UserName,
        password: UserPass
      }
      AxiosForm.post(url, JSON.stringify(postdata)).then(function (response) {
        var json = response.data
        context.commit('setUser', { 'UserSign': json.access_token, 'ExpiresIn': json.expires_in, 'IsLocal': IsLocal, 'Rurl': Rurl })
      }).catch(function (error) {
        if (error.response) {
          swal({
            title: 'Error:' + error.response.status + '.' + error.response.data,
            icon: 'error'
          })
        } else if (error.request) {
          console.log(error.request)
        } else {
          console.log('Error', error.message)
        }
        console.log(error.config)
      })
    },
    //在这里尝试用refresh token刷新用户token，如果refresh_token已经过期，则不跳转，不弹出错误
    tokenLogin(context, { IsLocal }) {
      let url = tools.tokenUrl
      var postdata = {
        grant_type: 'refresh_token',
        islocal: IsLocal,
        username: '',
        password: ''
      }
      AxiosForm.post(url, JSON.stringify(postdata)).then(function (response) {
        var json = response.data
        context.commit('updateUser', { 'UserSign': json.access_token, 'ExpiresIn': json.expires_in, 'IsLocal': IsLocal })
      }).catch(function (error) {
        if (error.response) {
          if (error.response.status === 400) {
            swal({
              title: '您的登陆授权已经过期，请重新登陆',
              icon: 'error'
            }).then(() => {
              router.replace({ path: '/login' })
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
  }
}
