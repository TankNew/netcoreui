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
          <b-input-group size="sm" prepend="关键词" class="mb-3">
            <b-form-textarea
              v-model="companyInfo.seoKeyWords"
              :rows="6"
              size="sm"
              placeholder="多个关键词请用逗号隔开"
            ></b-form-textarea>
          </b-input-group>
          <b-input-group size="sm" prepend="网站LOGO" class="mb-3">
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
                  :max-size="0.2"
                  :disable-preview="true"
                  @size-exceeded="onSizeExceeded"
                  @file="onFile"
                  @load="onLoad"
                />
              </b-btn>
            </b-input-group-append>
          </b-input-group>
          <b-input-group size="sm" prepend="网站ICO" class="mb-3">
            <div class="info-img">
              <img :src="companyInfo.icon" />
            </div>
            <b-input-group-append>
              <b-btn size="sm" variant="primary">
                选择
                <vue-base64-file-upload
                  class="v1"
                  accept="image/x-icon"
                  image-class="v1-image"
                  input-class="v1-file"
                  :max-size="0.01"
                  :disable-preview="true"
                  @size-exceeded="onSizeExceeded"
                  @file="onFile"
                  @load="onLoadIcon"
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
                  :max-size="0.2"
                  :disable-preview="true"
                  @size-exceeded="onSizeExceeded"
                  @file="onFile"
                  @load="onLoadWX"
                />
              </b-btn>
            </b-input-group-append>
          </b-input-group>
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
          <p class="card-text">
            <i class="fas fa-info-circle text-primary mr-1"></i>
            简介
          </p>
          <tinymce
            id="detail"
            ref="tinymceNews"
            @refreshScroll="refreshScroll"
            @reloadScroll="reloadScroll"
            :initial="companyInfo.content"
            :editorWidth="editModeWidth"
            :scollMinTop="736"
            :scorllTopLength="scorllTopLength"
          ></tinymce>
        </b-card>

        <p class="m-3">
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
    computed: {
        editModeWidth() {
            return abp.page.width
        }
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
        onLoadIcon(dataUri) {
            this.companyInfo.icon = dataUri
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
                console.log(json)
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
.input-group-text {
    width: 100px;
    justify-content: center;
}
</style>
