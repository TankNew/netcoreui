<template>
    <section class="main">
        <!--滚动到顶端-->
        <div class="fixed-bottom topButton">
            <a href="javascript:void(0)" @click="topClick">
                <i class="far fa-arrow-alt-circle-up"></i>
            </a>
        </div>
        <!--左侧菜单设置-->
        <div :class="menuitemClasses">
            <span class="left-bar-shrink" @click="leftBarChange">
                <i class="fas fa-bars"></i>
            </span>
            <h5>
                <img src="@/assets/img/logo.png" />
            </h5>
            <div class="sidebar-header">
                <div class="user-pic">
                    <img
                        class="img-responsive img-rounded w-100"
                        :src="UserModel.UserHead"
                        alt
                    />
                </div>
                <div class="user-info">
                    <span class="user-name">
                        <strong>{{ UserModel.UserName }}</strong>
                    </span>
                    <div class="user-status">
                        <a href="javascript:void(0)">
                            <span
                                class="btn btn-success btn-sm"
                                style="padding:0 0.2rem;"
                            >{{ UserModel.UserRole }}</span>
                        </a>
                    </div>
                </div>
            </div>
            <hr class="border-primary" />
            <div class="sidebar-menu">
                <sidebar-menu
                    :menu="menu"
                    :path="path"
                    :isRoot="true"
                    :menuIndex="menuIndex"
                    @menuClick="menuClick"
                ></sidebar-menu>
            </div>
        </div>
        <!--主体内容设置-->
        <div class="content">
            <b-navbar
                toggleable="md"
                type="dark"
                variant="info"
                style="background-color:#6699CC !important;"
            >
                <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
                <b-navbar-brand tag="h1">
                    {{ appName }}
                    <span class="copy">&copy;</span>
                    {{ appVersion }}
                </b-navbar-brand>
                <b-collapse is-nav id="nav_collapse">
                    <!-- Right aligned nav items -->
                    <b-navbar-nav class="ml-auto">
                        <b-nav-item-dropdown right offset="25">
                            <template slot="button-content">
                                <i class="fab fa-creative-commons mr_10"></i>
                                {{this.L('Language')}}
                            </template>
                            <b-dropdown-item
                                v-for="(language, index) in languages"
                                :key="index"
                                @click="changeLanguage(language.name)"
                            >
                                <i :class="[language.icon, 'fas']"></i>
                                {{ language.displayName }}
                            </b-dropdown-item>
                        </b-nav-item-dropdown>
                        <b-nav-item-dropdown right offset="125">
                            <!-- Using button-content slot -->
                            <template slot="button-content">
                                <i class="fas fa-users-cog mr_10"></i>
                                {{this.L('Users')}}
                            </template>
                            <b-dropdown-item
                                href="javascript:void(0)"
                            >{{this.L('UserProfile')}}</b-dropdown-item>
                            <b-dropdown-item
                                href="javascript:void(0)"
                                @click="logout"
                            >{{ this.L('Logout') }}</b-dropdown-item>
                        </b-nav-item-dropdown>
                    </b-navbar-nav>
                </b-collapse>
            </b-navbar>

            <!--内页设置-->
            <section class="content-body">
                <!-- 地址栏 -->
                <b-breadcrumb :items="breadcrumb" />
                <section ref="scroll1" class="scroll-container">
                    <scroll
                        ref="content"
                        class="scroll"
                        :data="scrollData"
                        :autoScroll="false"
                        @scrollTop="scrollTop"
                    >
                        <router-view
                            :scorllTopLength="scorllTopLength"
                            @refreshScroll="refreshScroll"
                            @reloadScroll="reloadScroll"
                            @getMenu="getMenu"
                            :appName="appName"
                            :appVersion="appVersion"
                            :contentTitle="contentTitle"
                        ></router-view>
                    </scroll>
                </section>
            </section>
        </div>
        <!--底部-->
    </section>
</template>
<script>
import tools from 'tools'
import Ajax from '../utiltools/ajax'
import AppConsts from '../utiltools/appconst'
import scroll from './custom/scroll'
import jwtDecode from 'jwt-decode'
import { unsetToken } from '../utiltools/auth'
import sidebarMenu from './custom/sidebarMenu'
export default {
    name: 'layout',
    data() {
        return {
            UserModel: {},
            loadState: false, // 加载状态
            scorllTopLength: 0,
            path: '/',
            menu: {},
            menuIndex: '',
            contentTitle: '',
            isCollapsed: false,
            breadcrumb: [],
            scrollData: [],
            clientHeight: document.body.clientHeight
        }
    },
    watch: {
        $route(val) {
            var that = this
            //获取当前router完整路径
            that.path = val.fullPath
            that.breadcrumbFromat()
            that.pathToMenu(that.menu)
            that.reloadScroll()
        },
        // 监视窗口大小变化
        clientHeight(val) {
            this.refreshScroll()
        }
    },
    components: {
        scroll: scroll,
        sidebarMenu: sidebarMenu
    },
    computed: {
        appName() {
            return AppConsts.appName
        },
        appVersion() {
            return AppConsts.appVersion
        },
        menuitemClasses() {
            return ['leftBar', this.isCollapsed ? 'shrink' : '']
        },
        currentLanguage() {
            return abp.localization.currentLanguage
        },
        languages() {
            return abp.localization.languages.filter(val => {
                return !val.isDisabled
            })
        }
    },
    methods: {
        breadcrumbFromat() {
            this.breadcrumb = [
                {
                    text: 'Home',
                    to: { path: '/' }
                }
            ]
        },
        breadcrumbInsert(displayName, isActive = false) {
            this.breadcrumb.push({ text: displayName, active: isActive })
        },
        getFromUrl(menu) {
            var that = this
            menu.items.forEach((m, index) => {
                if (m.url && m.url.toLowerCase() === that.path.toLowerCase()) {
                    that.menuIndex = m.customData
                } else if (m.items && m.items.length > 0) {
                    that.getFromUrl(m)
                }
            })
        },
        //初加载同步菜单
        pathToMenu(menu) {
            var that = this
            menu.items.forEach((m, index) => {
                if (m.url && m.url.toLowerCase() === that.path.toLowerCase()) {
                    that.menuIndex = m.customData
                    that.contentTitle = m.displayName

                    that.breadcrumbInsert(m.displayName, true)
                } else if (m.items && m.items.length > 0) {
                    if (that.menuIndex.indexOf(m.customData) > -1) that.breadcrumbInsert(m.displayName)
                    that.pathToMenu(m)
                }
            })
        },
        //侧导航
        menuClick(item, customData) {
            if (!item.items.length > 0 || item.url) {
                this.$router.push({ path: item.url })
            } else this.menuIndex = customData
        },
        //隐藏侧导航
        leftBarChange() {
            this.isCollapsed = !this.isCollapsed
        },
        // 更改语言
        async changeLanguage(val) {
            await this.$store.dispatch({
                type: 'changeLanguage',
                data: { languageName: val }
            })
            abp.utils.setCookieValue(
                abp.localization.cookieName,
                val,
                new Date(new Date().getTime() + 5 * 365 * 86400000), //5 year
                abp.appPath
            )
            location.reload()
        },
        //安全退出
        logout() {
            unsetToken()
            location.replace('/login')
        },
        // 返回顶部
        topClick() {
            this.$refs.content.ScrollToTop()
        },
        refreshScroll() {
            this.$refs.content.refresh()
        },
        reloadScroll() {
            if (this.loadState) this.$refs.content.reload()
        },
        // 调整工具栏位置
        scrollTop(val) {
            this.scorllTopLength = val
        },
        async getMenu() {
            let that = this
            await that.$http.get('/api/services/app/Session/GetCurrentUserMenu').then(res => {
                that.menu = res.data.result
                that.path = that.$route.fullPath
                that.contentTitle = that.L(that.$route.meta.title)
                that.getFromUrl(that.menu)
                that.breadcrumbFromat()
                that.pathToMenu(that.menu)
            })
        },
        // 预加载
        async load() {
            await this.getMenu()
        }
    },
    async created() {
        let that = this
        let currentUser = that.$store.getters.currentUser
        that.UserModel.UserName = currentUser.unique_name
        that.UserModel.UserHead = '/static/imgs/128.png'
        that.UserModel.UserRole = currentUser.roles
        that.load()
    },
    mounted() {
        var that = this
        window.onresize = () => {
            return (() => {
                that.clientHeight = document.body.clientHeight
            })()
        }
        that.$nextTick(() => {
            that.loadState = true
            that.reloadScroll()
        })
    }
}
</script>
<style lang="less" scoped>
.breadcrumb,
.breadcrumb a,
.breadcrumb .active {
    font-size: 14px;
}

.topButton {
    left: auto;
    bottom: 50px;
    right: 50px;
    font-size: 50px;
    border: 4px solid rgba(0, 123, 255, 0.5);
    line-height: 1;
    border-radius: 50%;
    padding: 4px;
    opacity: 0.7;
}
</style>
