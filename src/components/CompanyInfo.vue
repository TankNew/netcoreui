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
            <b-form-input v-model="companyInfo.appName"></b-form-input>
          </b-input-group>
          <b-input-group size="sm" prepend="企业 LOGO" class="mb-3">
            <div class="info-img">
              <img :src="companyInfo.logo" />
            </div>
            <b-input-group-append>
              <b-btn size="sm" variant="primary">选择</b-btn>
            </b-input-group-append>
          </b-input-group>
          <b-input-group size="sm" prepend="微信二维码" class="mb-3">
            <div class="info-img">
              <img :src="companyInfo.weixinBarCode" />
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
            <b-form-input v-model="companyInfo.appAddress"></b-form-input>
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
            <b-form-input v-model="companyInfo.zipCode"></b-form-input>
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
            companyInfo: {}
        }
    },
    methods: {
        handleSubmit() {},
        submit() {},
        reset() {}
    },
    created() {
        var that = this
        that.$http.get('/api/services/app/CompanyInfo/GetOrCreate').then(res => {
            var json = res.data.result
            that.companyInfo = JSON.parse(JSON.stringify(json))
        })
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
