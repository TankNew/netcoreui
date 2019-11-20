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
                    <b-input-group size="sm" prepend="企业 LOGO" class="mb-3" :state="!errors.has('企业名称')">
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
                        <b-form-input v-model="companyInfo.tel" name="电话" :state="hasError(companyInfo.tel,'电话')"></b-form-input>
                    </b-input-group>
                    <b-input-group size="sm" prepend="传真" class="mb-3">
                        <b-form-input v-model="companyInfo.fax" name="传真" :state="hasError(companyInfo.fax,'传真')"></b-form-input>
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
import VueBase64FileUpload from 'vue-base64-file-upload'
export default {
    data() {
        return {
            companyInfo: {},
            customImageMaxSize: 0.2
        }
    },
    props: ['contentTitle'],
    components: {
        VueBase64FileUpload
    },
    methods: {
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
            this.$validator.validateAll().then(async result => {
                if (result) {
                    this.$http.put('/api/services/app/CompanyInfo/Update', this.companyInfo)
                }
            })
        }
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
<style lang="less" scoped>
.contact-info {
    max-width: 1000px;
}
.info-img {
    padding: 0 0.25em;
    background-color: #fff;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
    height: 64px;
}
.info-img > img {
    max-height: 64px;
}
</style>
