import jwtDecode from 'jwt-decode'
import Cookie from 'js-cookie'
import tools from 'tools'
import appconst from './appconst'

const getQueryParams = () => {
    const params = {}
    window.location.href.replace(/([^(?|#)=&]+)(=([^&]*))?/g, ($0, $1, $2, $3) => {
        params[$1] = $3
    })
    return params
}

export const extractInfoFromHash = () => {
    // if (process.SERVER_BUILD) return
    // eslint-disable-next-line camelcase
    const { id_token, state } = getQueryParams()
    return {
        token: id_token,
        secret: state
    }
}
// 预备更新后使用
export const setSecret = secret => window.localStorage.setItem('secret', secret)

export const checkSecret = secret => window.localStorage.secret === secret

export const getToken = () => {
    const token = window.localStorage.token
    return tools.isJsonString(token) ? JSON.parse(token) : undefined
}

export const setToken = token => {
    // if (process.SERVER_BUILD) return
    window.localStorage.setItem('token', JSON.stringify(token))
    window.localStorage.setItem('currentUser', JSON.stringify(jwtDecode(token.AccessToken)))

    //设置到COOKIE
    var tokenExpireDate = new Date(new Date().getTime() + 1000 * token.expireInSeconds)
    window.abp.auth.setToken(token.AccessToken, tokenExpireDate)
    window.abp.utils.setCookieValue(
        appconst.authorization.encrptedAuthTokenName,
        token.EncryptedAccessToken,
        tokenExpireDate,
        window.abp.appPath
    )
    // Cookie.set('jwt', token.AccessToken)
}

export const unsetToken = () => {
    // if (process.SERVER_BUILD) return
    window.localStorage.removeItem('token')
    window.localStorage.removeItem('currentUser')
    window.localStorage.removeItem('secret')

    //清除cookie
    window.abp.auth.clearToken()
    window.abp.utils.deleteCookie(appconst.authorization.encrptedAuthTokenName, window.abp.appPath)
    // Cookie.remove('jwt')
    window.localStorage.setItem('logout', Date.now())
}

export const getUerFromLocalStorage = () => {
    const json = window.localStorage.currentUser
    return tools.isJsonString(json) ? JSON.parse(json) : undefined
}

export const getUserFromCookie = req => {
    if (!req.headers.cookie) return
    const jwtCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith('jwt='))
    if (!jwtCookie) return
    const jwt = jwtCookie.split('=')[1]
    let json = jwtDecode(jwt)
    return tools.isJsonString(json) ? JSON.parse(json) : undefined
}
