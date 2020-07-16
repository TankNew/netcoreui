import Vue from 'vue'
import Router from 'vue-router'
import jwtDecode from 'jwt-decode'
import swal from 'sweetalert'
import store from '../store'
import Ajax from '../utiltools/ajax'
import tools from '../utiltools/tools'
import { setToken, getToken, getUerFromLocalStorage } from '../utiltools/auth'

Vue.use(Router)

export const router = new Router({
    mode: 'history',
    routes: [
        {
            path: '/Administration',
            name: 'Administration',
            component: () => import('@/components/Layout'),
            meta: { auth: true },
            children: [
                {
                    path: 'Administration',
                    name: 'AdministrationList',
                    redirect: '/Administration/Users'
                },
                {
                    path: 'Users',
                    name: 'Users',
                    meta: { title: 'Users', permission: 'Pages.Users' },
                    component: () => import('@/components/Users')
                },
                {
                    path: 'Roles',
                    name: 'Roles',
                    meta: { title: 'Roles', permission: 'Pages.Roles' },
                    component: () => import('@/components/Roles')
                },
                {
                    path: 'Template',
                    name: 'Template',
                    meta: { title: 'Template', permission: 'Pages.Tenants' },
                    component: () => import('@/components/Template')
                },
                {
                    path: 'Theme',
                    name: 'Theme',
                    meta: { title: 'Theme', permission: 'Pages.Tenants' },
                    component: () => import('@/components/Theme')
                },
                {
                    path: 'Tenants',
                    name: 'Tenants',
                    meta: { title: 'Tenants', permission: 'Pages.Tenants' },
                    component: () => import('@/components/Tenants')
                }
            ]
        },
        {
            path: '/home',
            meta: { auth: true },
            name: 'Layout',
            redirect: '/home/hello',
            component: () => import('@/components/Layout'),
            children: [
                {
                    path: 'hello',
                    name: 'hello',
                    meta: { title: 'Hello' },
                    component: () => import('@/components/Hello')
                },

                {
                    path: 'honor',
                    name: 'honor',
                    meta: { title: 'Honor', permission: 'Pages.Content' },
                    component: () => import('@/components/Honor')
                },
                {
                    path: 'partner',
                    name: 'partner',
                    meta: { title: 'Partner', permission: 'Pages.Content' },
                    component: () => import('@/components/Partner')
                },
                {
                    path: 'organization',
                    meta: { title: 'Organization', permission: 'Pages.Content' },
                    name: 'organization',
                    component: () => import('@/components/Organization')
                },

                {
                    path: 'homepage',
                    name: 'homepage',
                    meta: { title: 'HomePage', permission: 'Pages.Content' },
                    component: () => import('@/components/HomePage')
                },
                {
                    path: 'hr',
                    name: 'hr',
                    meta: { title: 'Hr', permission: 'Pages.Content' },
                    component: () => import('@/components/Hr')
                },
                {
                    path: 'news/:id',
                    name: 'news',
                    meta: { title: 'News', permission: 'Pages.Content' },
                    component: () => import('@/components/News')
                },
                {
                    path: 'page/:id',
                    name: 'page',
                    meta: { title: 'Page', permission: 'Pages.Content' },
                    component: () => import('@/components/Page')
                },
                {
                    path: 'announce',
                    name: 'announce',
                    meta: { title: 'Announce', permission: 'Pages.Content' },
                    component: () => import('@/components/Announce')
                },
                {
                    path: 'charts',
                    name: 'charts',
                    meta: { title: 'Charts', permission: 'Pages.Content' },
                    component: () => import('@/components/Charts')
                },
                {
                    path: 'setting',
                    name: 'setting',
                    meta: { title: 'Setting', permission: 'Pages.Roles' },
                    component: () => import('@/components/Setting')
                },
                {
                    path: 'language',
                    name: 'language',
                    meta: { title: 'Language', permission: 'Pages.Roles' },
                    component: () => import('@/components/Language')
                },
                {
                    path: 'modules',
                    name: 'modules',
                    meta: { title: 'Modules', permission: 'Pages.Content' },
                    component: () => import('@/components/Modules')
                },
                {
                    path: 'navbar',
                    name: 'navbar',
                    meta: { title: 'Navbar', permission: 'Pages.Content' },
                    component: () => import('@/components/Navbar')
                },
                {
                    path: 'banner',
                    name: 'banner',
                    meta: { title: 'Banner', permission: 'Pages.Content' },
                    component: () => import('@/components/Banner')
                },
                {
                    path: 'companyinfo',
                    name: 'companyinfo',
                    meta: { title: 'CompanyInfo', permission: 'Pages.Content' },
                    component: () => import('@/components/CompanyInfo')
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
            component: () => import('@/components/Login')
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

        if ((!!to.meta.permission && window.abp.auth.hasPermission(to.meta.permission)) || !to.meta.permission) {
            next()
        } else {
            swal({
                title: `权限不足`,
                icon: 'error'
            })
        }
    } else next()
})
