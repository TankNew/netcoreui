<template>
    <div class="login-bg">
        <div class="login-panel">
            <Loading :isLoading="isLoading"></Loading>
            <img class="login-logo" src="@/assets/img/logo.png" v-if="!hasUser" />
            <hr v-if="!hasUser" />
            <form
                class="form-horizontal"
                @submit.prevent="login"
                autocomplete="off"
            >
                <div class="form-group center" v-if="hasUser">
                    <img :src="UserModel.UserHead" />
                    <h5>{{ UserModel.UserName }}</h5>
                </div>
                <div class="form-group" v-if="!hasUser">
                    <label for="inputEmail3" class="control-label">用户名</label>
                    <div>
                        <input
                            type="text"
                            :class="['form-control', errors.has('用户名') ? 'is-invalid' : '']"
                            id="inputEmail3"
                            name="用户名"
                            placeholder="用户名"
                            v-model="UserModel.UserName"
                            v-validate="'required|min:4'"
                        />
                    </div>
                </div>
                <div class="form-group">
                    <label for="inputPassword3" class="control-label">密 码</label>
                    <div>
                        <input
                            type="password"
                            :class="['form-control', errors.has('密码') ? 'is-invalid' : '']"
                            id="inputPassword3"
                            name="密码"
                            placeholder="密码"
                            v-model="UserModel.UserPass"
                            v-validate="'required|min:6'"
                        />
                    </div>
                </div>
                <div class="form-group text-right">
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" v-model="rememberPassword" /> Remember me
                        </label>
                    </div>
                </div>
                <div class="form-group text-center" v-if="hasUser">
                    <a href="javascript:void(0)" @click="logout">切换其他账户</a>
                </div>
                <hr />
                <div class="form-group">
                    <button type="submit" class="btn btn-success px-5 w-100">登陆</button>
                </div>
                <div class="text-center">
                    <dl>
                        <dd
                            class="d-inline mr-2"
                            v-for="(language, index) in languages"
                            :key="index"
                        >
                            <a
                                @click="changeLanguage(language.name)"
                                :class="[ 'btn',  'btn-outline-primary',  language.displayName == currentLanguage.displayName ? 'active' : '' ]"
                            >
                                <i :class="['fas', language.icon]" />
                                {{ language.displayName }}
                            </a>
                        </dd>
                    </dl>
                    <p>
                        <a
                            class="btn btn-outline-secondary"
                            @click="changeTenant"
                        >
                            <span>调试按钮</span>
                            <span
                                v-if="displayTenancyName"
                            >MultiTenancySide： {{ displayTenancyName }}</span>
                            <span v-else>MultiTenancySide：主机</span>
                        </a>
                    </p>
                </div>
            </form>
        </div>
    </div>
</template>
<script>
import { userLogin } from '../utiltools/lock'
import { unsetToken } from '../utiltools/auth'
import swal from 'sweetalert'
import Ajax from '../utiltools/ajax'
import Loading from './custom/loading'
export default {
    data() {
        return {
            isLoading: false,
            UserModel: {
                UserName: '',
                UserPass: '',
                UserHead: ''
            },
            hasUser: false,
            rememberPassword: false,
            changedTenancyName: '',
            displayTenancyName: ''
        }
    },
    components: {
        Loading: Loading
    },
    computed: {
        languages() {
            return abp.localization.languages.filter(val => {
                return !val.isDisabled
            })
        },
        currentLanguage() {
            return abp.localization.currentLanguage
        }
    },
    methods: {
        changeLanguage(languageName) {
            abp.utils.setCookieValue(
                abp.localization.cookieName,
                languageName,
                new Date(new Date().getTime() + 5 * 365 * 86400000), //5 year
                abp.appPath
            )
            location.reload()
        },
        async changeTenant() {
            if (!this.changedTenancyName) {
                this.displayTenancyName = 'Default'
                this.changedTenancyName = 'Default'
                let tenant = await this.$store.dispatch({
                    type: 'isTenantAvailable',
                    data: { tenancyName: this.changedTenancyName }
                })
                switch (tenant.state) {
                    case 1:
                        abp.multiTenancy.setTenantIdCookie(tenant.tenantId)
                        // location.reload()
                        break
                    case 2:
                        this.$Modal.error({ title: this.L('Error'), content: this.L('TenantIsNotActive') })
                        break
                    case 3:
                        this.$Modal.error({
                            title: this.L('Error'),
                            content: this.L('ThereIsNoTenantDefinedWithName{0}', undefined, this.changedTenancyName)
                        })
                        break
                }
            } else {
                this.displayTenancyName = ''
                this.changedTenancyName = ''
                abp.multiTenancy.setTenantIdCookie(undefined)
                // location.reload()
            }
        },
        logout() {
            unsetToken()
            this.hasUser = false
        },
        login() {
            var that = this
            var Rurl = that.$route.query.Rurl
            that.isLoading = true
            that.$validator
                .validateAll()
                .then(async result => {
                    that.isLoading = false
                    if (result) {
                        await userLogin({
                            userNameOrEmailAddress: that.UserModel.UserName,
                            password: that.UserModel.UserPass,
                            rememberClient: that.rememberPassword,
                            Rurl: Rurl
                        })
                        setTimeout(() => {
                            that.UserModel.UserPass = ''
                        }, 50)
                    }
                })
                .catch(failure => {
                    console.log(failure)
                })
        }
    },
    created() {
        if (abp.session.tenantId)
            Ajax.get('/api/services/app/Session/GetCurrentLoginInformations').then(res => {
                let session = res.data.result
                this.changedTenancyName = session.tenant.tenancyName
                this.displayTenancyName = session.tenant.name
                if (!session.user) this.logout()
            })
        if (this.$store.getters.isAuthenticated) {
            this.hasUser = true
            let currentUser = this.$store.getters.currentUser
            this.UserModel.UserName = currentUser.unique_name
            this.UserModel.UserHead = 'static/imgs/128.png'
        }
    },
    mounted() {}
}
</script>
<style scoped>
.form-control.is-invalid {
    box-shadow: 0 0 0.8rem 0.2rem rgba(220, 53, 69, 0.35);
}

hr {
    border: none;
    border-bottom: 1px solid #fff;
}

.error {
    margin-top: 10px;
    display: inline-block;
}

.control-label {
    font-size: 16px;
}

.login-logo {
    display: block;
    width: 120px;
    margin-bottom: 20px;
}

.login-panel {
    color: #fff;
    padding: 40px;
    width: 480px;
    max-height: 600px;
    position: fixed;
    background: rgba(0, 0, 0, 0.3);
    left: 50%;
    top: 40%;
    border-radius: 8px;
    z-index: 2;
    box-shadow: 0 0 5px 0 rgba(255, 255, 255, 0.7);
    -webkit-transform: translate(-50%, -50%);
    -moz-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    -o-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
}

.login-bg {
    height: 100%;
    background-color: #ffffff;
    background-image: url('../assets/img/overlay.png'), -moz-linear-gradient(60deg, rgba(233, 100, 31, 0.5) 5%, #409eff),
        url('../assets/img/bg.jpg');
    background-image: url('../assets/img/overlay.png'),
        -webkit-linear-gradient(60deg, rgba(233, 100, 31, 0.5) 5%, #409eff), url('../assets/img/bg.jpg');
    background-image: url('../assets/img/overlay.png'), -ms-linear-gradient(60deg, rgba(233, 100, 31, 0.5) 5%, #409eff),
        url('../assets/img/bg.jpg');
    background-image: url('../assets/img/overlay1.png'), linear-gradient(60deg, rgba(233, 100, 31, 0.5) 5%, #409eff),
        url('../assets/img/bg.jpg');
    background-repeat: repeat, no-repeat, no-repeat;
    background-size: 100px 100px, cover, cover;
    background-position: top left, center center, bottom center;
    background-attachment: fixed, fixed, fixed;
}
</style>
