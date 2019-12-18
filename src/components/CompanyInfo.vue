<template>
  <section class="container-fluid">
    <form @submit.stop.prevent="handleSubmit" autocomplete="off">
      <div class="contact-info">
        <b-card :title="contentTitle" class="mb-3 contact-info-card">
          <p class="card-text">
            <i class="far fa-address-card text-primary mr-1"></i>
            Company Info
          </p>
          <b-input-group size="sm" prepend="企业名称" class="mb-3">
            <b-form-input
              v-model="companyInfo.appName"
              name="企业名称"
              :state="!errors.has('企业名称') "
              v-validate="'required'"
            ></b-form-input>
          </b-input-group>
          <b-input-group
            size="sm"
            prepend="企业 LOGO"
            class="mb-3"
            :state="!errors.has('企业名称')"
          >
            <div class="info-img">
              <img :src="companyInfo.logo" />
            </div>
            <b-input-group-append>
              <b-btn size="sm" variant="primary">
                选择
                <vue-base64-file-upload
                  class="v1"
                  accept="image/png, image/jpeg"
                  image-class="v1-image"
                  input-class="v1-file"
                  :max-size="customImageMaxSize"
                  :disable-preview="true"
                  @size-exceeded="onSizeExceeded"
                  @file="onFile"
                  @load="onLoad"
                />
              </b-btn>
            </b-input-group-append>
          </b-input-group>
          <b-input-group size="sm" prepend="微信二维码" class="mb-3">
            <div class="info-img">
              <img :src="companyInfo.weixinBarCode" />
            </div>
            <b-input-group-append>
              <b-btn size="sm" variant="primary">
                选择
                <vue-base64-file-upload
                  class="v1"
                  accept="image/png, image/jpeg"
                  image-class="v1-image"
                  input-class="v1-file"
                  :max-size="customImageMaxSize"
                  :disable-preview="true"
                  @size-exceeded="onSizeExceeded"
                  @file="onFile"
                  @load="onLoadWX"
                />
              </b-btn>
            </b-input-group-append>
          </b-input-group>
          <b-form-group label="简介" label-for="detail">
            <div class="news-edit-editmode">
              <label>编辑模式:</label>
              <button
                v-for="(ew,index) in editorWidths"
                :key="index"
                type="button"
                :class="['btn',editModeWidth==ew?'btn-secondary':'btn-light']"
                @click="putEditModeWidth(ew)"
              >{{ew}}</button>
            </div>
            <tinymce
              id="detail"
              ref="tinymceNews"
              @refreshScroll="refreshScroll"
              @reloadScroll="reloadScroll"
              :initial="companyInfo.content"
              :editorWidth="editModeWidth"
              :scollMinTop="348"
              :scorllTopLength="scorllTopLength"
            ></tinymce>
          </b-form-group>
        </b-card>
        <b-card title="联系方式" class="contact-info-card">
          <p class="card-text">
            <i class="far fa-envelope text-primary mr-1"></i>
            Contact Info
          </p>
          <b-input-group size="sm" prepend="联系人" class="mb-3">
            <b-form-input
              v-model="companyInfo.contacter"
              v-validate="'title'"
              name="联系人"
              :state="hasError(companyInfo.contacter,'联系人')"
            ></b-form-input>
          </b-input-group>
          <b-input-group size="sm" prepend="Email" class="mb-3">
            <b-form-input
              v-model="companyInfo.email"
              v-validate="'email'"
              name="Email"
              :state="hasError(companyInfo.email,'Email')"
            ></b-form-input>
          </b-input-group>
          <b-input-group size="sm" prepend="地址" class="mb-3">
            <b-form-input
              v-model="companyInfo.appAddress"
              name="地址"
              :state="hasError(companyInfo.appAddress,'地址')"
            ></b-form-input>
          </b-input-group>
          <b-input-group size="sm" prepend="电话" class="mb-3">
            <b-form-input
              v-model="companyInfo.tel"
              name="电话"
              :state="hasError(companyInfo.tel,'电话')"
            ></b-form-input>
          </b-input-group>
          <b-input-group size="sm" prepend="传真" class="mb-3">
            <b-form-input
              v-model="companyInfo.fax"
              name="传真"
              :state="hasError(companyInfo.fax,'传真')"
            ></b-form-input>
          </b-input-group>
          <b-input-group size="sm" prepend="邮编" class="mb-3">
            <b-form-input
              v-model="companyInfo.zipCode"
              name="邮编"
              :state="hasError(companyInfo.zipCode,'邮编')"
            ></b-form-input>
          </b-input-group>
        </b-card>
        <p class="m-3 text-center">
          <button class="btn btn-primary py-2 px-5" type="submit">提交</button>
        </p>
      </div>
    </form>
  </section>
</template>
<script>
import swal from 'sweetalert'
import tinymce from '@/components/custom/tinymce'
import VueBase64FileUpload from 'vue-base64-file-upload'
export default {
    data() {
        return {
            companyInfo: {},
            customImageMaxSize: 0.2,
            editModeWidth: 900,
            editorWidths: [640, 800, 900, 1000, 1200]
        }
    },
    props: {
        contentTitle: String,
        scorllTopLength: Number
    },
    components: {
        VueBase64FileUpload,
        tinymce
    },
    methods: {
        //改变编辑器宽度
        putEditModeWidth(val) {
            var that = this
            this.$refs.tinymceNews.destroy()
            that.editModeWidth = val
            setTimeout(() => {
                this.$refs.tinymceNews.init()
            }, 20)
            //刷新滚动轴
            that.refreshScroll()
        },
        onFile(file) {},
        onLoad(dataUri) {
            this.companyInfo.logo = dataUri
        },
        onLoadWX(dataUri) {
            this.companyInfo.weixinBarCode = dataUri
        },
        onSizeExceeded(size) {
            swal({
                title: '请上传200K以内的图片',
                icon: 'error'
            })
        },
        hasError(val, name) {
            if (val) return val.length ? !this.errors.has(name) : null
            else return null
        },
        handleSubmit() {
            this.companyInfo.content = this.$refs.tinymceNews.getVal()
            this.$validator.validateAll().then(async result => {
                if (result) {
                    this.$http
                        .put('/api/services/app/CompanyInfo/Update', this.companyInfo)
                        .then(() => swal('操作成功!', '', 'success'))
                }
            })
        },
        //刷新滚动轴
        refreshScroll() {
            this.$emit('refreshScroll')
        },
        reloadScroll() {
            this.$emit('reloadScroll')
        },
        load() {
            this.$http.get('/api/services/app/CompanyInfo/GetOrCreate').then(res => {
                var json = res.data.result
                this.companyInfo = JSON.parse(JSON.stringify(json))
            })
        }
    },
    created() {
        this.load()
    },
    mounted() {
        // 开发调试
        this.$nextTick(() => {
            this.$refs.tinymceNews.init()
        })
    },
    beforeDestroy: function() {
        this.$refs.tinymceNews.destroy()
    }
}
</script>
<style lang="less" scoped>
.contact-info {
    max-width: 100%;
}
</style>
