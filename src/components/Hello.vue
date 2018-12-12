<template>
  <section class="container-fluid">
    <div class="jumbotron">
      <h1 class="display-4">欢迎您使用{{copy}}<span class="copy">&copy; </span>网站控制台V5.0版</h1>
      <p class="small">为了您的网站安全，请不要泄露本程序到公网上，否则造成一切后果由您来承担</p>
      <hr class="my-4">
      <dl>
        <dt>更新新特性:</dt>
        <dd>1.系统核心全面升级到<code>asp.net core 2.1</code>.</dd>
        <dd>2.新版控制台采用前后端分离构建，前端采用单页应用模式.</dd>
        <dd>3.全新的身份认证系统，提升安全性.</dd>
      </dl>
      <hr class="my-4">
      <h3>核心技术：</h3>
      <p class="tec">
        <img src="@/assets/img/webpack.png">
        <img src="@/assets/img/vue.png">
        <img src="@/assets/img/netcore.png">
        <img src="@/assets/img/sqlserver.png">
        <img src="@/assets/img/weixin.png">
      </p>
    </div>
    <div class="card text-center mb-3">
      <div class="card-header">
        产品精选
      </div>
      <div class="card-body ad">
        <div v-for="(item,index) in ads" :key="index">
          <h5 class="card-title">{{item.title}}</h5>
          <p class="card-text">{{item.info}}</p>
          <a :href="item.link" class="btn btn-primary">去看看</a>
        </div>
      </div>
    </div>
  </section>

</template>
<script>
  export default {
    name: 'hello',
    data() {
      return {
        copy: '',
        ads: [
          { title: '微信小程序企业标准版', info: '最快速度定制企业微信小程序，最低500元起.', link: 'www.ednet.cn' },
          { title: '企业网页客服', info: '免费定制，多客服，桌面客服端', link: 'www.ednet.cn' },
          { title: '微信公众号对接', info: '全面对接企业号、服务号、订阅号，最低500元起.', link: 'www.ednet.cn' }
        ]
      }
    },
    methods: {
    },
    created() {
      this.copy = this.$store.state.Counter.title
    },
    mounted() {
      var that = this
    }
  }
</script>
<style scoped>

  .ad { display: flex; justify-content: center; flex-wrap: wrap; }

    .ad > div { display: inline-block; width: 50%; padding: 0 20px; flex-shrink: 0; margin: 20px 0; }

  .copy { font-size: 24px; vertical-align: top; }

  .tec { margin-top: 50px; }

    .tec img { padding: 4px; border: 2px solid #fff; border-radius: 4px; height: 48px; }

  @media (min-width: 1200px) {
    .tec img { height: 64px; }

    .ad > div { width: 33%; flex-shrink: 0; }
  }
</style>
