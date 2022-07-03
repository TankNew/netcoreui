import Vue from 'vue'
import Router from 'vue-router'
import swal from 'sweetalert'
import store from '../store'

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
  store.commit('readToken')
  if (to.matched.some(m => m.meta.auth)) {
    if (!store.getters.token || store.getters.isTokenExpired) {
      if (!store.getters.refreshToken) next({ path: '/login', query: { Rurl: to.fullPath } })
      // 如果refresh的action失败，ajax应该将页面重定向到/login
      else
        await store.dispatch('refreshToken').then(function(response) {
          var json = response.data
          if (json.success === true) {
            store.commit('setToken', json.result)
          } else next({ path: '/login', query: { Rurl: to.fullPath } })
        })
    }
    if (
      (!!to.meta.permission && window.abp.auth.isGranted(to.meta.permission)) ||
      !to.meta.permission
    )
      next()
    else {
      swal({
        title: `授权失败`,
        icon: 'error'
      }).then(() => next({ path: '/login', query: { Rurl: to.fullPath } }))
    }
  } else next()
})
