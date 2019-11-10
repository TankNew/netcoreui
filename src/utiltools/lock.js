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
    Ajax.post(url, postData)
        .then(function(response) {
            var json = response.data
            if (json.success === true) {
                let result = json.result
                let token = {
                    AccessToken: result.accessToken,
                    EncryptedAccessToken: result.encryptedAccessToken,
                    ExpireInSeconds: result.expireInSeconds,
                    RefreshToken: result.refreshToken
                }
                store.commit('setToken', token)
                store.commit('setUser', jwtDecode(token.AccessToken))
                setToken(token)
            } else console.error(json)
        })
        .then(() =>
            Ajax.get('/AbpUserConfiguration/GetAll').then(data => {
                window.abp = tools.extend(true, window.abp, data.data.result)
            })
        )
        .then(() => router.replace(Rurl))
}
const refreshToken = toPah => {
    let url = tools.tokenUrl + '/RefreshToken'

    Ajax.get(url)
        .then(function(response) {
            var json = response.data
            if (json.success === true) {
                let result = json.result
                let token = {
                    AccessToken: result.accessToken,
                    EncryptedAccessToken: result.encryptedAccessToken,
                    ExpireInSeconds: result.expireInSeconds,
                    RefreshToken: result.refreshToken
                }
                store.commit('setToken', token)
                store.commit('setUser', jwtDecode(token.AccessToken))
                setToken(token)
            } else console.error(json)
        })
        .then(() =>
            Ajax.get('/AbpUserConfiguration/GetAll').then(data => {
                window.abp = tools.extend(true, window.abp, data.data.result)
            })
        )
        .then(() => {
            if (toPah) router.push(toPah)
        })
}

const getBaseUrl = () => `${window.location.protocol}//${window.location.host}`

const logout = () => {
    unsetToken()
    router.replace('/')
}
export { userLogin, refreshToken, getBaseUrl, logout }
