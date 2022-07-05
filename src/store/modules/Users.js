import tools from '../../utiltools/tools'
import ajax from '../../utiltools/ajax'
import appconst from '../../utiltools/appconst'
import Axios from '../../plugins/AxiosPlugin'
import jwtDecode from 'jwt-decode'

export default {
  state: {
    token: null,
    refreshToken: null,
    currentUser: null
  },
  mutations: {
    setToken(state, val) {
      state.token = val.accessToken || null
      window.abp.auth.setToken(
        val.accessToken,
        new Date(new Date().getTime() + 1000 * val.expireInSeconds)
      )

      state.refreshToken = val.refreshToken || null
      window.abp.auth.setRefreshToken(
        val.refreshToken,
        new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 14)
      )

      if (state.token) {
        state.currentUser = jwtDecode(val.accessToken)
        window.localStorage.setItem(
          'currentUser',
          JSON.stringify(state.currentUser)
        )
      }
    },

    readToken(state) {
      if (window.abp.auth.getToken()) {
        state.token = window.abp.auth.getToken()
      }

      if (window.abp.auth.getRefreshToken()) {
        state.refreshToken = window.abp.auth.getRefreshToken()
      }

      const json = window.localStorage.currentUser
      state.currentUser = tools.isJsonString(json)
        ? JSON.parse(json)
        : undefined
    },

    unsetToken(state) {
      state.token = null
      state.refreshToken = null
      state.currentUser = null

      window.abp.auth.clearToken()
      window.abp.auth.clearRefreshToken()
      window.abp.utils.deleteCookie(
        appconst.authorization.encrptedAuthTokenName,
        window.abp.appPath
      )

      window.localStorage.removeItem('currentUser')
    }
  },
  getters: {
    isAuthenticated(state) {
      //用两个!!就可以将变量转化为对应布尔值
      //，如果明确设置了o中flag的值（非 null/undefined/0""/等值），自然test就会取跟o.flag一样的值；如果没有设置，test就会默认为false，而不是 null或undefined。
      return !!state.currentUser
    },
    currentUser(state) {
      return state.currentUser
    },
    token(state) {
      return state.token
    },
    refreshToken(state) {
      return state.refreshToken
    },
    isTokenExpired(state) {
      if (state.currentUser) {
        console.log((state.currentUser.exp - tools.myTime.CurTime()) / 60)
      }
      return (
        !!state.currentUser &&
        (state.currentUser.exp - tools.myTime.CurTime()) / 60 < 1
      )
    }
  },
  actions: {
    async isTenantAvailable(context, payload) {
      let res = await ajax.post(
        '/api/services/app/Account/IsTenantAvailable',
        payload.data
      )
      return res.data.result
    },
    async changePassword(context, payload) {
      let res = await Axios.post(
        '/api/services/app/User/ChangePassword',
        payload.data
      )
      return res.data.result
    },
    async changeLanguage(context, payload) {
      let res = await Axios.post(
        '/api/services/app/User/ChangeLanguage',
        payload.data
      )
      return res.data.result
    },
    async userLogin(
      context,
      { userNameOrEmailAddress, password, rememberClient, Rurl = '/home' }
    ) {
      var postData = {
        userNameOrEmailAddress: userNameOrEmailAddress,
        password: password,
        clientId: appconst.clientId,
        clientSecret: appconst.clientSecret,
        rememberClient: rememberClient
      }

      let url = tools.tokenUrl + '/Authenticate'
      await ajax.post(url, postData).then(function(response) {
        var json = response.data
        if (json.success === true) {
          context.commit('setToken', json.result)
          location.replace(Rurl)
        } else {
          confirm.localization(url)
          console.error(json)
        }
      })
    },
    async refreshToken(context) {
      let url =
        tools.tokenUrl +
        `/RefreshToken?clientId=${appconst.clientId}&clientSecret=${
          appconst.clientSecret
        }`

      let response = await ajax.post(url)
      return response
    },
    logout(context) {
      context.commit('unsetToken')
    }
  }
}
