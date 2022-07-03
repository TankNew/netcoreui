<template>
  <section class="container-fluid">
    <b-modal id="company-domian-modal" size="lg" ok-only title="网址二维码生成">
      <section class="company-domain">
        <div class="company-domain-panel" @click.stop>
          <div class="list">
            <p class="lead mb-3">域名列表</p>
            <dl>
              <dd v-for="(domain, index) in companyInfo.urls" :key="index">
                <a>{{ index + 1 }}.{{ domain }}</a>
                <b-button variant="outline-primary" @click.prevent.stop="generateQRCode(domain)"
                  >生成二维码</b-button
                >
              </dd>
            </dl>
          </div>
          <div v-show="showCode" class="detail">
            <h5>{{ coderDomain }}</h5>
            <div class="code">
              <img :src="'data:image/png;base64,' + qrCode" />
            </div>
          </div>
        </div>
      </section>
    </b-modal>
    <file :fileShow="fileShow" :fileCallBack="fileCallBack" @fileClose="fileClose"></file>
    <form @submit.stop.prevent="handleSubmit" autocomplete="off">
      <div class="contact-info">
        <b-card class="mb-3 contact-info-card">
          <p class="card-text">
            <i class="fas fa-chalkboard text-primary mr-1"></i>
            {{ contentTitle }}
            <b-button style="float: right" variant="primary" size="sm" @click="openDomainModal"
              >生成网址二维码</b-button
            >
          </p>
          <hr />

          <b-input-group size="sm" prepend="网站名称" class="mb-3">
            <b-form-input
              v-model="companyInfo.logoText"
              name="Logo文本"
              :state="!errors.has('Logo文本')"
            ></b-form-input>
          </b-input-group>
          <div class="info-images start">
            <b-input-group size="sm" prepend="网站ICO" class="mb-3">
              <div class="info-img">
                <img :src="companyInfo.icon" />
              </div>
              <b-input-group-append>
                <b-btn size="sm" variant="primary" @click="fileOpen(companyInfo, 'icon')">
                  选择
                </b-btn>
              </b-input-group-append>
            </b-input-group>
            <b-input-group size="sm" prepend="网站LOGO" class="mb-3">
              <div class="info-img">
                <img :src="companyInfo.logo" />
              </div>
              <b-input-group-append>
                <b-btn size="sm" variant="primary" @click="fileOpen(companyInfo, 'logo')">
                  选择
                </b-btn>
              </b-input-group-append>
            </b-input-group>

            <b-input-group size="sm" prepend="反色LOGO" class="mb-3">
              <div class="info-img">
                <img :src="companyInfo.reverseLogo" />
              </div>
              <b-input-group-append>
                <b-btn size="sm" variant="primary" @click="fileOpen(companyInfo, 'reverseLogo')">
                  选择
                </b-btn>
              </b-input-group-append>
            </b-input-group>

            <b-input-group size="sm" prepend="微信二维码" class="mb-3">
              <div class="info-img">
                <img :src="companyInfo.weixinBarCode" />
              </div>
              <b-input-group-append>
                <b-btn size="sm" variant="primary" @click="fileOpen(companyInfo, 'weixinBarCode')">
                  选择
                </b-btn>
              </b-input-group-append>
            </b-input-group>
            <b-input-group size="sm" prepend="底部广告" class="mb-3">
              <div class="info-img">
                <img :src="companyInfo.footerAdImage" />
              </div>
              <b-input-group-append>
                <b-btn size="sm" variant="primary" @click="fileOpen(companyInfo, 'footerAdImage')">
                  选择
                </b-btn>
              </b-input-group-append>
            </b-input-group>
            <b-input-group size="sm" prepend="底部背景" class="mb-3">
              <div class="info-img">
                <img :src="companyInfo.footerBackgroudImage" />
              </div>
              <b-input-group-append>
                <b-btn
                  size="sm"
                  variant="primary"
                  @click="fileOpen(companyInfo, 'footerBackgroudImage')"
                >
                  选择
                </b-btn>
              </b-input-group-append>
            </b-input-group>
          </div>
          <br />
          <p class="card-text">
            <i class="fas fa-search text-primary mr-1"></i>
            SEO设置
          </p>
          <hr />
          <b-input-group size="sm" prepend="SEO关键词" class="mb-3">
            <b-form-textarea
              v-model="companyInfo.seoKeyWords"
              :rows="3"
              size="sm"
              placeholder="多个关键词请用逗号隔开"
            ></b-form-textarea>
          </b-input-group>
          <b-input-group size="sm" prepend="SEO描述" class="mb-3">
            <b-form-textarea
              v-model="companyInfo.description"
              :rows="3"
              size="sm"
            ></b-form-textarea>
          </b-input-group>
          <br />
          <p class="card-text">
            <i class="far fa-address-card text-primary mr-1"></i>
            联系方式
          </p>
          <hr />
          <b-input-group size="sm" prepend="企业名称" class="mb-3">
            <b-form-input
              v-model="companyInfo.appName"
              name="企业名称"
              :state="!errors.has('企业名称')"
              v-validate="'required'"
            ></b-form-input>
          </b-input-group>
          <b-input-group size="sm" prepend="联系人" class="mb-3">
            <b-form-input
              v-model="companyInfo.contacter"
              v-validate="'title'"
              name="联系人"
              :state="hasError(companyInfo.contacter, '联系人')"
            ></b-form-input>
          </b-input-group>
          <b-input-group size="sm" prepend="Email" class="mb-3">
            <b-form-input
              v-model="companyInfo.email"
              v-validate="'email'"
              name="Email"
              :state="hasError(companyInfo.email, 'Email')"
            ></b-form-input>
          </b-input-group>
          <b-input-group size="sm" prepend="地址" class="mb-3">
            <b-form-input
              v-model="companyInfo.appAddress"
              name="地址"
              :state="hasError(companyInfo.appAddress, '地址')"
            ></b-form-input>
          </b-input-group>
          <b-input-group size="sm" prepend="电话" class="mb-3">
            <b-form-input
              v-model="companyInfo.tel"
              name="电话"
              :state="hasError(companyInfo.tel, '电话')"
            ></b-form-input>
          </b-input-group>
          <b-input-group size="sm" prepend="传真" class="mb-3">
            <b-form-input
              v-model="companyInfo.fax"
              name="传真"
              :state="hasError(companyInfo.fax, '传真')"
            ></b-form-input>
          </b-input-group>
          <b-input-group size="sm" prepend="邮编" class="mb-3">
            <b-form-input
              v-model="companyInfo.zipCode"
              name="邮编"
              :state="hasError(companyInfo.zipCode, '邮编')"
            ></b-form-input>
          </b-input-group>
          <br />
          <p class="card-text">
            <i class="fas fa-newspaper text-primary mr-1"></i>
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
import file from '@/components/custom/tankFiler'
import VueBase64FileUpload from 'vue-base64-file-upload'
export default {
  data() {
    return {
      fileShow: false,
      fileCallBack: function (x) {},
      companyInfo: {},
      editorWidths: [640, 800, 900, 1000, 1200],
      qrCode: '',
      showCode: false,
      coderDomain: ''
    }
  },
  props: {
    contentTitle: String,
    scorllTopLength: Number
  },
  components: {
    VueBase64FileUpload,
    file,
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
 
    fileOpen(target, propertyName) {
      this.fileShow = true
      this.fileCallBack = fileUrl => {
        target[propertyName] = fileUrl
      }
    },
    fileClose() {
      this.fileShow = false
    },

    hasError(val, name) {
      if (val) return val.length ? !this.errors.has(name) : null
      else return null
    },
    handleSubmit() {
      this.companyInfo.content = this.$refs.tinymceNews.getVal()
      this.$validator.validateAll().then(async result => {
        if (result) {
          this.$axios
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
    async generateQRCode(url) {
      this.coderDomain = 'https://' + url
      await this.$axios
        .get('/api/services/app/CompanyInfo/GetUrlQRCode', { params: { url: this.coderDomain } })
        .then(res => {
          this.qrCode = res.data.result
        })
      this.showCode = true
    },
    openDomainModal() {
      this.$root.$emit('bv::show::modal', 'company-domian-modal')
    },
    load() {
      this.$axios.get('/api/services/app/CompanyInfo/GetOrCreate').then(res => {
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
  beforeDestroy: function () {
    this.$refs.tinymceNews.destroy()
  }
}
</script> 
