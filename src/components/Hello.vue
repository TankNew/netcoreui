<template>
    <section class="container-fluid">
        <div class="jumbotron py-5">
            <h1>
                欢迎您使用{{ appName }}
                <span class="copy">&copy;</span>
                {{ appVersion }}
            </h1>
            <p class="small">为了您的网站安全，请不要泄露本程序到公网上，否则造成一切后果由您来承担</p>
            <hr class="my-4" />
            <dl>
                <dt>更新新特性:</dt>
                <dd>1.基于 领域驱动设计(DDD) 的现代框架.</dd>
                <dd>2.本地化支持,多语言选择.</dd>
                <dd>3.多租户支持（程序共享，数据隔离）.</dd>
                <dd>4.日志记录系统.</dd>
                <dd>5.文件管理系统.</dd>
                <dd>6.身份验证令牌与授权管理.</dd>
                <dd>7.增加管理员与权限自由分配.</dd>
                <dd>8.用户注册系统.</dd>
                <dd>9.消息即时通讯(即将开放).</dd>
            </dl>
            <hr class="my-4" />
            <h3>核心技术：</h3>
            <p class="tec">
                <img src="@/assets/img/webpack.png" />
                <img src="@/assets/img/vue.png" />
                <img src="@/assets/img/netcore.png" />
                <img src="@/assets/img/sqlserver.png" />
                <img src="@/assets/img/weixin.png" />
                <img src="@/assets/img/docker.png" />
            </p>
        </div>
        <div class="card text-center mb-3">
            <div class="card-header">更多服务</div>
            <div class="card-body ad">
                <div v-for="(item, index) in ads" :key="index">
                    <h5 class="card-title">{{ item.title }}</h5>
                    <p class="card-text">{{ item.info }}</p>
                    <a :href="item.link" class="btn btn-primary">去看看</a>
                </div>
            </div>
        </div>
    </section>
</template>
<script>
import AppConsts from '../utiltools/appconst'
export default {
    name: 'hello',
    data() {
        return {
            copy: '',
            ads: [
                {
                    title: '微信小程序企业标准版',
                    info: '最快速度定制企业微信小程序.',
                    link: 'http://www.ednet.cn'
                },
                {
                    title: '微信公众号对接',
                    info: '全面对接企业号、服务号、订阅号.',
                    link: 'http://www.ednet.cn'
                },
                { title: '企业网页客服', info: '免费定制，多客服，桌面客服端', link: 'http://www.ednet.cn' }
            ]
        }
    },
    computed: {},
    props: ['appVersion', 'appName'],
    methods: {},
    created() {
        var that = this
    },
    mounted() {
        var that = this
    }
}
</script>
<style lang="less" scoped>
.ad {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    > div {
        display: inline-block;
        width: 50%;
        padding: 0 20px;
        flex-shrink: 0;
        margin: 20px 0;
    }
}

.copy {
    font-size: 24px;
    vertical-align: top;
}

.tec {
    margin-top: 50px;
    img {
        padding: 4px;
        border: 2px solid #fff;
        border-radius: 4px;
        height: 48px;
    }
}

@media (min-width: 1200px) {
    .tec img {
        height: 64px;
    }

    .ad > div {
        width: 33%;
        flex-shrink: 0;
    }
}
</style>
