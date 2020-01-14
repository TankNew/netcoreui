import tools from './tools'
import { setToken, unsetToken, getToken, getUerFromLocalStorage } from './auth'
import Ajax from './ajax'
import { router } from '../router/router.config'
import store from '../store'
import jwtDecode from 'jwt-decode'
import appconst from './appconst'

const userLogin = async ({ userNameOrEmailAddress, password, rememberClient, Rurl = '/home' }) => {
    var postData = {
        userNameOrEmailAddress: userNameOrEmailAddress,
        password: password,
        rememberClient: rememberClient
    }

    let url = tools.tokenUrl + '/Authenticate'
    await Ajax.post(url, postData).then(function(response) {
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
            // store.dispatch({
            //     type: 'changeLanguage',
            //     data: { languageName: abp.utils.getCookieValue(abp.localization.cookieName) }
            // })
            setToken(token)
            location.replace(Rurl)
        } else {
            confirm.localization(url)
            console.error(json)
        }
    })
}
const refreshToken = toPah => {
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
            store.commit('setToken', token)
            store.commit('setUser', jwtDecode(token.AccessToken))
            setToken(token)
            if (toPah) router.push(toPah)
        } else console.error(json)
    })
}

const getBaseUrl = () => `${window.location.protocol}//${window.location.host}`

const logout = () => {
    unsetToken()
    router.replace('/')
}
export { userLogin, refreshToken, getBaseUrl, logout }
