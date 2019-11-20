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
                <ul>
                    <li
                        :class="[
                            item.items.length > 0 ? 'sidebar-dropdown' : 'sidebar-link',
                            menuIndex == index || path == item.url ? 'active' : ''
                        ]"
                        v-for="(item, index) in menu.items"
                        :key="index"
                    >
                        <a
                            href="javascript:void(0)"
                            :class="[menuIndex == index || path == item.url ? 'active' : '']"
                            @click="menuClick(item, index)"
                        >
                            <i :class="item.icon"></i>
                            <span>{{ item.displayName }}</span>
                            <span
                                v-if="item.isnew"
                                class="badge badge-success"
                            >New</span>
                            <span
                                v-if="item.ispage"
                                class="badge badge-warning"
                            >P</span>
                        </a>
                        <div
                            class="sidebar-submenu"
                            v-if="item.items.length > 0"
                        >
                            <ul>
                                <li
                                    v-for="(sub, subindex) in item.items"
                                    :key="subindex"
                                >
                                    <a
                                        href="javascript:void(0)"
                                        :class="path == sub.url ? 'active' : ''"
                                        @click="menuClick(sub, subindex)"
                                    >{{ sub.displayName }}</a>
                                </li>
                            </ul>
                        </div>
                    </li>
                </ul>
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
                            @refreshScroll="refreshScroll"
                            @reloadScroll="reloadScroll"
                            @L="L"
                            :scorllTopLength="scorllTopLength"
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
export default {
    name: 'layout',
    data() {
        return {
            loadState: false, // 加载状态
            scorllTopLength: 0,
            path: '/',
            pathname: '',
            UserModel: {
                UserName: null,
                UserHead: null,
                UserRole: null
            },
            menu: '',
            contentTitle: '',
            menuIndex: -1,
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
            that.contentTitle = that.L(val.meta.title)
            that.path = val.fullPath
            that.pathToMenu()
            that.reloadScroll()
        },
        // 监视窗口大小变化
        clientHeight(val) {
            this.refreshScroll()
        }
    },
    components: {
        scroll: scroll
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
        breadcrumbInsert(parent, val) {
            var that = this
            that.breadcrumb = [
                {
                    text: '根目录',
                    to: { path: '/' }
                }
            ]
            if (parent) {
                that.breadcrumb.push({ text: parent })
                that.breadcrumb.push({ text: val, active: true })
            } else that.breadcrumb.push({ text: val })
        },
        //初加载同步菜单
        pathToMenu() {
            var that = this
            that.menu.items.forEach((m, index) => {
                if (m.url && m.url.toLowerCase() === that.path.toLowerCase()) {
                    that.menuIndex = index
                    that.breadcrumbInsert(null, m.displayName)
                } else if (m.items) {
                    m.items.forEach(s => {
                        if (s.url && s.url.toLowerCase() === that.path.toLowerCase()) {
                            that.menuIndex = index
                            that.breadcrumbInsert(m.displayName, s.displayName)
                        }
                    })
                }
            })
        },
        //侧导航
        menuClick(item, index) {
            if (!item.items.length > 0) {
                this.$router.push({ path: item.url })
            } else this.menuIndex = index
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
        // 预加载
        async load() {
            let that = this
            await that.$http.get('/api/services/app/Session/GetCurrentUserMenu').then(res => {
                that.menu = res.data.result
                that.path = that.$route.fullPath
                that.contentTitle = that.L(that.$route.meta.title)
                that.pathToMenu()
            })
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
    },
    beforeDestory() {
        that.loadState = false
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
