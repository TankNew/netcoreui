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
import Contact from '@/components/Contact'
import Pages from '@/components/Pages'
import CustomPage from '@/components/CustomPage'


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
          name: 'hello',
        {
          name: 'news',
        {
          name: 'announce',
        {
          name: 'charts',
        {
          name: 'setting',
        {
          name: 'custompage',
        {
          name: 'pages',
        {
          name: 'banner',
        {
          name: 'contact',
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