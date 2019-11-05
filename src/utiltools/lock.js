import tools from './tools'
import { setToken, unsetToken, getToken, getUerFromLocalStorage } from './auth'
import Ajax from './ajax'
import router from '../router/router.config'
import store from '../store'
import jwtDecode from 'jwt-decode'
import appconst from './appconst'

const userLogin = ({ userNameOrEmailAddress, password, rememberClient, Rurl = '/home' }) => {
    var postData = {
        userNameOrEmailAddress: userNameOrEmailAddress,
        password: password,
        rememberClient: rememberClient
    }

    let url = tools.tokenUrl + '/Authenticate'
    Ajax.post(url, postData).then(function(response) {
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
            store.commit('setUser', jwtDecode(token.AccessToken))
            store.commit('setToken', token)
            router.replace(Rurl)
        } else console.error(json)
    })
}

const refreshToken = () => {
    let url = tools.tokenUrl + '/RefreshToken'

    Ajax.get(url).then(function(response) {
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
            store.commit('setUser', jwtDecode(token.AccessToken))
            store.commit('setToken', token)
            Ajax.get('/api/AntiForgery/GetToken')
        } else console.error(json)
    })
}

const getBaseUrl = () => `${window.location.protocol}//${window.location.host}`

const logout = () => {
    unsetToken()
    router.replace('/')
}
export { userLogin, refreshToken, getBaseUrl, logout }
