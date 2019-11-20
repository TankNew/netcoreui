import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/components/Layout'
import Login from '@/components/Login'
import News from '@/components/News'
import Setting from '@/components/Setting'
import Charts from '@/components/Charts'
import Announce from '@/components/Announce'
import Banner from '@/components/Banner'
import CompanyInfo from '@/components/CompanyInfo'
import PageConfig from '@/components/PageConfig'
import Modules from '@/components/Modules'
import store from '../store'
import Ajax from '../utiltools/ajax'
import tools from '../utiltools/tools'
import { setToken, getToken, getUerFromLocalStorage } from '../utiltools/auth'
import jwtDecode from 'jwt-decode'
import swal from 'sweetalert'

Vue.use(Router)

export const router = new Router({
    mode: 'history',
    routes: [
        {
            path: '/home',
            redirect: '/home/hello',
            name: 'Layout',
            component: Layout,
            meta: { auth: true },
            children: [
                {
                    path: 'organization',
                    meta: { title: 'Organization', permission: 'Pages.Content' },
                    name: 'organization',
                    component: () => import('@/components/Organization')
                },
                {
                    path: 'hello',
                    name: 'hello',
                    meta: { title: 'HomePage', permission: 'Pages.Content' },
                    component: () => import('@/components/Hello')
                },
                {
                    path: 'hr',
                    name: 'hr',
                    meta: { title: 'Hr', permission: 'Pages.Content' },
                    component: () => import('@/components/Hr')
                },
                {
                    path: 'news',
                    name: 'news',
                    meta: { title: 'News', permission: 'Pages.Content' },
                    component: News
                },
                {
                    path: 'announce',
                    name: 'announce',
                    meta: { title: 'Announce', permission: 'Pages.Content' },
                    component: Announce
                },
                {
                    path: 'charts',
                    name: 'charts',
                    meta: { title: 'Charts', permission: 'Pages.Content' },
                    component: Charts
                },
                {
                    path: 'setting',
                    name: 'setting',
                    meta: { title: 'Setting', permission: 'Pages.Content' },
                    component: Setting
                },
                {
                    path: 'modules',
                    name: 'modules',
                    meta: { title: 'Modules', permission: 'Pages.Content' },
                    component: Modules
                },
                {
                    path: 'pageconfig',
                    name: 'pageconfig',
                    meta: { title: 'PageConfig', permission: 'Pages.Content' },
                    component: PageConfig
                },
                {
                    path: 'banner',
                    name: 'banner',
                    meta: { title: 'Banner', permission: 'Pages.Content' },
                    component: Banner
                },
                {
                    path: 'companyinfo',
                    name: 'companyinfo',
                    meta: { title: 'CompanyInfo', permission: 'Pages.Content' },
                    component: CompanyInfo
                }
            ]
        },
        {
            path: '/',
            redirect: '/home/hello'
        },
        {
            path: '/login',
            name: 'login',
            component: Login
        }
    ]
})

router.beforeEach(async (to, from, next) => {
    store.commit('setToken', getToken())
    store.commit('setUser', getUerFromLocalStorage())
    if (to.matched.some(m => m.meta.auth)) {
        if (!store.getters.hastoken) next({ path: '/login', query: { Rurl: to.fullPath } })
        else if (store.getters.isTokenExpired) {
            await Ajax.get(tools.tokenUrl + '/RefreshToken').then(function(response) {
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
                } else next({ path: '/login', query: { Rurl: to.fullPath } })
            })
        }

        if (window.abp.auth.hasPermission(to.meta.permission)) {
            next()
        } else
            swal({
                title: window.abp.localization.localize('LoginFailed'),
                icon: 'error'
            })
    } else next()
})
