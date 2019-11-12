import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/components/Layout'
import Hello from '@/components/Hello'
import Login from '@/components/Login'
import News from '@/components/News'
import Setting from '@/components/Setting'
import Charts from '@/components/Charts'
import Announce from '@/components/Announce'
import Banner from '@/components/Banner'
import CompanyInfo from '@/components/CompanyInfo'
import PageConfig from '@/components/PageConfig'
import Modules from '@/components/Modules'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/home',
            name: 'Layout',
            component: Layout,
            meta: { auth: true },
            children: [
                {
                    path: 'hello',
                    name: 'hello',
                    component: Hello
                },
                {
                    path: 'news',
                    name: 'news',
                    component: News
                },
                {
                    path: 'announce',
                    name: 'announce',
                    component: Announce
                },
                {
                    path: 'charts',
                    name: 'charts',
                    component: Charts
                },
                {
                    path: 'setting',
                    name: 'setting',
                    component: Setting
                },
                {
                    path: 'modules',
                    name: 'modules',
                    component: Modules
                },
                {
                    path: 'pageconfig',
                    name: 'pageconfig',
                    component: PageConfig
                },
                {
                    path: 'banner',
                    name: 'banner',
                    component: Banner
                },
                {
                    path: 'companyinfo',
                    name: 'companyinfo',
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
