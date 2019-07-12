<template>
  <section class="container-fluid">
    <form @submit.stop.prevent="handleSubmit">
      <div class="contact-info">
        <b-card title="基本资料" class="mb-3 contact-info-card">
          <p class="card-text">
            <i class="far fa-address-card text-primary mr-1"></i>
            Company Info
          </p>
          <b-input-group size="sm" prepend="企业名称" class="mb-3">
            <b-form-input v-model="companyInfo.name"></b-form-input>
          </b-input-group>
          <b-input-group size="sm" prepend="企业类型" class="mb-3">
            <b-form-input v-model="companyInfo.qualification"></b-form-input>
          </b-input-group>
          <b-input-group size="sm" prepend="企业 LOGO" class="mb-3">
            <div class="info-img">
              <img :src="companyInfo.logo">
            </div>
            <b-input-group-append>
              <b-btn size="sm" variant="primary">选择</b-btn>
            </b-input-group-append>
          </b-input-group>
          <b-input-group size="sm" prepend="微信二维码" class="mb-3">
            <div class="info-img">
              <img :src="companyInfo.weixinqr">
            </div>
            <b-input-group-append>
              <b-btn size="sm" variant="primary">选择</b-btn>
            </b-input-group-append>
          </b-input-group>
          <b-input-group size="sm" prepend="网站二维码" class="mb-3">
            <div class="info-img">
              <img :src="companyInfo.webqr">
            </div>
            <b-input-group-append>
              <b-btn size="sm" variant="primary">选择</b-btn>
            </b-input-group-append>
          </b-input-group>
          <b-link class="card-link">提交</b-link>
          <b-link class="card-link">重置</b-link>
        </b-card>
        <b-card title="联系方式" class="contact-info-card">
          <p class="card-text">
            <i class="far fa-envelope text-primary mr-1"></i>
            Contact Info
          </p>
          <b-input-group size="sm" prepend="地址" class="mb-3">
            <b-form-input v-model="companyInfo.address"></b-form-input>
          </b-input-group>
          <b-input-group size="sm" prepend="电话" class="mb-3">
            <b-form-input v-model="companyInfo.tel"></b-form-input>
          </b-input-group>
          <b-input-group size="sm" prepend="传真" class="mb-3">
            <b-form-input v-model="companyInfo.fax"></b-form-input>
          </b-input-group>
          <b-input-group size="sm" prepend="邮箱" class="mb-3">
            <b-form-input v-model="companyInfo.email"></b-form-input>
          </b-input-group>
          <b-input-group size="sm" prepend="邮编" class="mb-3">
            <b-form-input v-model="companyInfo.zipcode"></b-form-input>
          </b-input-group>
          <b-link class="card-link">提交</b-link>
          <b-link class="card-link">重置</b-link>
        </b-card>
      </div>
    </form>
  </section>
</template>
<script>
export default {
  data() {
    return {
      companyInfo: {
        name: '天津市理研维他食品有限公司',
        qualification: '食品配料加工制作',
        logo: 'static/imgs/64.png',
        weixinqr: 'static/imgs/64.png',
        webqr: 'static/imgs/64.png',
        address: '天津市和平区',
        tel: '022-64656465',
        fax: '022-12131213',
        email: 'abc@google.com',
        zipcode: '300000'
      }
    }
  },
  methods: {
    handleSubmit() {},
    submit() {},
    reset() {}
  },
  mounted() {
    var that = this
    // 开发调试
    that.$nextTick(() => {
      that.$emit('reloadScroll')
    })
  }
}
</script>
<style scoped>
.contact-info {
  max-width: 1000px;
}
.info-img {
  padding: 0 0.25em;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
}
.info-img > img {
  max-width: 64px;
}
</style>
