<template>
    <div class="login-bg">
        <div class="login-panel">
            <Loading :isLoading="isLoading"></Loading>
            <img class="login-logo" src="@/assets/img/logo.png" v-if="!hasUser" />
            <hr v-if="!hasUser" />
            <form class="form-horizontal" @submit.prevent="login" autocomplete="off">
                <div class="form-group center" v-if="hasUser">
                    <img :src="UserModel.UserHead" />
                    <h5>{{UserModel.UserName}}</h5>
                </div>
                <div class="form-group" v-if="!hasUser">
                    <label for="inputEmail3" class="control-label">用户名</label>
                    <div>
                        <input
                            type="text"
                            :class="['form-control',errors.has('用户名')?'is-invalid':'']"
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
                            :class="['form-control',errors.has('密码')?'is-invalid':'']"
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
                    <a href="javascript:void(0)" @click="changeUser">切换其他账户</a>
                </div>
                <hr />
                <div class="form-group text-right">
                    <button type="submit" class="btn btn-success px-5">登陆</button>
                </div>
            </form>
        </div>
    </div>
</template>
<script>
import { userLogin } from '../utiltools/lock'
import swal from 'sweetalert'
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
            rememberPassword: false
        }
    },
    components: {
        Loading: Loading
    },
    methods: {
        changeUser() {
            //注销本地用户
            this.$store.commit('logout')
            this.hasUser = false
        },
        login() {
            var that = this
            var Rurl = that.$route.query.Rurl
            that.isLoading = true
            that.$validator
                .validateAll()
                .then(result => {
                    that.isLoading = false
                    if (result) {
                        userLogin({
                            userNameOrEmailAddress: that.UserModel.UserName,
                            password: that.UserModel.UserPass,
                            rememberClient: that.rememberPassword,
                            Rurl: Rurl
                        })
                        setTimeout(() => {
                            that.UserModel.UserPass = ''
                        }, 50)
                    } else
                        swal({
                            title: '用户名不存在或者密码错误',
                            icon: 'error'
                        })
                })
                .catch(failure => {
                    console.log(failure)
                })
        }
    },
    mounted: function() {
        if (this.$store.getters.isAuthenticated) {
            this.hasUser = true
            let currentUser = this.$store.getters.currentUser
            this.UserModel.UserName = currentUser.unique_name
            this.UserModel.UserHead = 'static/imgs/128.png'
        }
    }
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
