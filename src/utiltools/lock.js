import tools from './tools'
import { setToken, unsetToken } from './auth'
import Ajax from './ajax'
import swal from 'sweetalert'
import router from '../router/router.config'
import store from '../store'

const userLogin = ({ userNameOrEmailAddress, password, rememberClient, Rurl = '/home' }) => {
    // let url = tools.tokenUrl + '/Authenticate'

    var postData = {
        userNameOrEmailAddress: userNameOrEmailAddress,
        password: password,
        rememberClient: rememberClient
    }

    Ajax.post('api/TokenAuth/Authenticate', postData)
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
                setToken(token)
                // router.replace(Rurl)
            } else console.error(json)
        })
        .catch(function(error) {
            if (error.response)
                swal({
                    title: 'Error:' + error.response.data.error.code + '.' + error.response.data.error.message,
                    icon: 'error'
                })
            else if (error.request) {
                console.log(error.request)
            } else {
                console.log('Error', error.message)
            }
            console.log(error.config)
        })
}

const refreshToken = () => {
    let url = tools.tokenUrl + '/RefreshToken'
    Ajax.post(url, {
        refresh_token: store.getters.token.refreshToken
    })
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
                setToken(token)
                store.commit('setToken', token)
            } else console.error(json)
        })
        .catch(function(error) {
            if (error.response.data)
                swal({
                    title: 'Error:' + error.response.data.error.code + '.' + error.response.data.error.message,
                    icon: 'error'
                })
            else console.log(error.config)
        })
}

const getBaseUrl = () => `${window.location.protocol}//${window.location.host}`

const logout = () => {
    unsetToken()
    router.replace('/')
}
export { userLogin, refreshToken, getBaseUrl, logout }
