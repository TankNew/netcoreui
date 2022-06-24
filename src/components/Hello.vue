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
      <div>
        <dl>
          <dt>更新新特性:</dt>
          <dd>1.增加人才招聘模块.</dd>
          <dd>2.增加用户与角色模块.</dd>
          <dd>3.增加用户自定义扩展属性.</dd>
          <dd>4.提升系统运行速度.</dd>
        </dl>
      </div>
      <hr class="my-4" />
      <h3>核心技术：</h3>
      <p class="tec">
        <img src="@/assets/img/webpack.png" />
        <img src="@/assets/img/Vue.png" />
        <img src="@/assets/img/NetCore.png" />
        <img src="@/assets/img/SqlServer.png" />
        <img src="@/assets/img/weixin.png" />
        <img src="@/assets/img/docker.png" />
      </p>
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
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: row;
  flex-wrap: wrap;
  > div {
    padding: 0 0.5rem;
    width: calc(50% - 1rem);
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
  .ad {
    > div {
      width: calc(33% - 1rem);
    }
  }
}
</style>
