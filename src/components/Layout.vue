<template>
    <section class="main">
        <!--左侧菜单设置-->
        <div :class="['leftBar', this.isCollapsed ? 'shrink' : '']">
            <span class="left-bar-shrink" @click="leftBarChange">
                <i class="fas fa-bars"></i>
            </span>
            <h5 class="app-name">
                {{ appName }}
                <span class="small copy">&copy;</span>
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
                    <span class="user-name p-1">
                        <strong>{{ UserModel.UserName }}</strong>
                    </span>
                    <span
                        class="btn btn-outline-success p-0"
                    >{{ UserModel.UserRole }}</span>
                </div>
            </div>
            <hr class="border-light mx-3" />
            <section class="scroll-sidebar-container">
                <scroll
                    ref="scrollSidebar"
                    class="scroll"
                    @scrollTop="leftScrollTop"
                >
                    <div class="sidebar-menu">
                        <sidebar-menu
                            :menu="menu"
                            :path="path"
                            :isRoot="true"
                            :menuIndex="menuIndex"
                            @menuClick="menuClick"
                        ></sidebar-menu>
                        <div class="clear"></div>
                    </div>
                </scroll>
            </section>
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
                <b-navbar-brand tag="h1">{{tenantTitle}}</b-navbar-brand>
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
                                @click="editUserProfile"
                            >{{this.L('ChangePassword')}}</b-dropdown-item>
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
                    <scroll ref="content" class="scroll" @scrollTop="scrollTop">
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

        <b-modal
            id="modalChangePassword"
            :title="modalTitle"
            :ok-title="'确认'"
            :cancel-title="'取消'"
            @ok="modalOk"
            @shown="modalInfoShow"
            @hidden="modalInfoHide"
        >
            <section>
                <b-form
                    @submit.stop.prevent="changePassword"
                    autocomplete="off"
                    data-vv-scope="form-changePassword"
                >
                    <b-form-group
                        label="原密码:"
                        label-for="p-currentPassword"
                        description="原密码."
                    >
                        <b-form-input
                            ref="focusThis"
                            id="p-currentPassword"
                            type="password"
                            v-model="currentPassword"
                            name="原密码"
                            :state="!errors.has('form-changePassword.原密码') "
                            v-validate="'required'"
                            placeholder="原密码"
                        ></b-form-input>
                    </b-form-group>
                    <b-form-group
                        label="新密码"
                        label-for="p-newPassword"
                        description="新密码."
                    >
                        <b-form-input
                            id="p-newPassword"
                            type="password"
                            v-model="newPassword"
                            name="新密码"
                            :state="!errors.has('form-changePassword.新密码') "
                            v-validate="'required'"
                            placeholder="新密码"
                        ></b-form-input>
                    </b-form-group>
                </b-form>
            </section>
        </b-modal>
        <!--滚动到顶端-->
        <div class="fixed-bottom topButton">
            <a href="javascript:void(0)" @click="topClick">
                <i class="far fa-arrow-alt-circle-up"></i>
            </a>
        </div>
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
            currentPassword: null,
            newPassword: null,
            loadState: false, // 加载状态
            scorllTopLength: 0,
            path: '/',
            menu: {},
            menuIndex: '',
            contentTitle: '',
            isCollapsed: false,
            breadcrumb: [],
            clientHeight: document.body.clientHeight,
            tenant: undefined
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
        modalTitle() {
            return '更改密码'
        },
        appName() {
            return AppConsts.appName
        },
        appVersion() {
            return AppConsts.appVersion
        },
        tenantTitle() {
            if (this.tenant) return `${this.tenant.name} / ${this.tenant.tenancyName}`
            else if (this.tenant === null) return `当前处于主机模式`
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
            this.menuIndex = customData
            if (!item.items.length > 0 || item.url) {
                this.$router.push({ path: item.url })
            }
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

        // 更改密码
        editUserProfile() {
            this.$root.$emit('bv::show::modal', 'modalChangePassword')
        },
        modalInfoHide() {
            this.currentPassword = null
            this.newPassword = null
        },

        modalInfoShow(e) {
            this.$refs.focusThis.focus()
        },
        modalOk(e) {
            e.preventDefault()
            this.changePassword()
        },
        async changePassword() {
            if (await this.validate('form-changePassword')) {
                await this.$store.dispatch({
                    type: 'changePassword',
                    data: {
                        currentPassword: this.currentPassword,
                        newPassword: this.newPassword
                    }
                })
                this.modalInfoHide()
                location.reload()
            } else {
                swal({
                    title: '请填写必要的选项!',
                    icon: 'warning'
                })
            }
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
            this.$refs.scrollSidebar.refresh()
        },
        reloadScroll() {
            if (this.loadState) {
                this.$refs.content.reload()
                this.$refs.scrollSidebar.refresh()
            }
        },
        // 调整工具栏位置
        scrollTop(val) {
            this.scorllTopLength = val
        },
        leftScrollTop(val) {
            //  val是左侧当前滚动距离顶部的值
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
        async getSessionInfo() {
            await this.$http.get('/api/services/app/Session/GetCurrentLoginInformations').then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    window.abp.session.application = json.application
                    window.abp.session.tenant = json.tenant
                    window.abp.session.user = json.user
                    this.tenant = json.tenant
                }
            })
        },
        async validate(scope) {
            let res
            await this.$validator.validateAll(scope).then(async result => {
                res = result
            })
            return res
        },
        // 预加载
        async load() {
            await this.getMenu()
            await this.getSessionInfo()
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
