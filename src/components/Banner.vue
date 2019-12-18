<template>
  <section class="container-fluid">
    <p class="lead">
      <i class="far fa-images text-primary mr-1"></i>
      {{contentTitle}}
    </p>
    <div v-if="!editMode">
      <div class="mr-3">
        <b-alert show dismissible>
          <b>Info:</b> 每个模块节点默认继承root节点的海报，您当然也可以自定义每个模块节点海报，只要您将鼠标移动到这个节点选择功能按钮。
        </b-alert>
      </div>
      <section class="tankBannerTree">
        <nested-banner
          :dragging="true"
          :children="pages"
          :parentId="0"
          @add="add"
          @del="del"
          @edit="edit"
        />
      </section>
    </div>
    <section v-else>
      <file
        :fileShow="fileShow"
        :fileCallBack="fileCallBack"
        @fileClose="fileClose"
      ></file>
      <div class="alert alert-success" role="alert">
        <i class="far fa-bell mx-1"></i>
        您当前正处于{{editModeTitle}}模式
        <button
          type="button"
          class="btn btn-secondary btn-sm mx-1 float-right"
          @click="outEditMode"
        >退出{{editModeTitle}}模式</button>
      </div>
      <div class="row">
        <div class="col-8">
          <b-carousel
            id="myCarousel"
            ref="myCarousel"
            style="text-shadow: 1px 1px 2px #333;"
            controls
            indicators
            background="#ababab"
            :interval="0"
            :img-width="currentPageSize.Width"
            :img-height="currentPageSize.Height"
            v-model="slide"
            @sliding-start="onSlideStart"
            @sliding-end="onSlideEnd"
          >
            <b-carousel-slide
              v-if="currentBanner.imgUrl"
              v-for="(item, index) in currentPage.bannerImgs"
              :key="index"
              :img-src="getImgUrl(item.imgUrl)"
            >
              <div :class="currentFontPosition">
                <h2 class>{{item.title}}</h2>
                <p class>{{item.subTitle}}</p>
              </div>
            </b-carousel-slide>
            <b-carousel-slide v-else img-blank img-alt="Blank image">
              <div :class="currentFontPosition">
                <h2>添加海报</h2>
                <p>请从右侧工具面板添加新的海报。</p>
              </div>
            </b-carousel-slide>
          </b-carousel>
        </div>
        <div class="col-4 banner-tools py-3">
          <p class="lead py-2 border-bottom">
            <i class="fas fa-wrench mr-1 text-info"></i>
            <small>《{{currentPage.displayName}}》</small>
          </p>
          <b-form @submit.prevent="onSubmit" autocomplete="off">
            <b-form-group>
              <b-input-group>
                <b-input-group-prepend>
                  <b-button size="sm" variant="outline-info">建议宽度</b-button>
                </b-input-group-prepend>
                <b-form-input
                  id="nestedStreet"
                  v-model="currentPageSize.Width"
                  size="sm"
                  disabled
                ></b-form-input>
                <b-input-group-append>
                  <b-btn size="sm" variant="outline-info">PX</b-btn>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
            <b-form-group>
              <b-input-group>
                <b-input-group-prepend>
                  <b-button size="sm" variant="outline-info">建议高度</b-button>
                </b-input-group-prepend>

                <b-form-input
                  id="nestedCity"
                  v-model="currentPageSize.Height"
                  size="sm"
                  disabled
                ></b-form-input>
                <b-input-group-append>
                  <b-btn size="sm" variant="outline-info">PX</b-btn>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
            <hr class="border-light" />
            <b-form-group>
              <b-input-group>
                <b-input-group-prepend>
                  <b-button size="sm" variant="outline-info">图片</b-button>
                </b-input-group-prepend>
                <b-form-input
                  placeholder="imgUrl"
                  size="sm"
                  name="图片"
                  v-model="currentBanner.imgUrl"
                  :state="!errors.has('图片') "
                  v-validate="'required'"
                ></b-form-input>
                <b-input-group-append>
                  <b-btn size="sm" variant="primary" @click="attachOpen">选择</b-btn>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
            <b-form-group>
              <b-input-group>
                <b-input-group-prepend>
                  <b-button size="sm" variant="outline-info">标题</b-button>
                </b-input-group-prepend>
                <b-form-input
                  id="nestedState"
                  v-model="currentBanner.title"
                  size="sm"
                  placeholder="可选"
                ></b-form-input>
              </b-input-group>
            </b-form-group>
            <b-form-group>
              <b-input-group>
                <b-input-group-prepend>
                  <b-button size="sm" variant="outline-info">副标题</b-button>
                </b-input-group-prepend>
                <b-form-textarea
                  v-model="currentBanner.subTitle"
                  :rows="3"
                  size="sm"
                  :max-rows="6"
                  placeholder="可选"
                ></b-form-textarea>
              </b-input-group>
            </b-form-group>
            <hr class="border-light" />
            <b-form-group>
              <b-input-group>
                <b-input-group-prepend>
                  <b-button size="sm" variant="outline-info">水平</b-button>
                </b-input-group-prepend>
                <b-form-radio-group
                  size="sm"
                  :options="['left', 'center', 'right']"
                  v-model="currentBanner.titleAlign"
                  class="ml-3"
                />
              </b-input-group>
            </b-form-group>
            <b-form-group>
              <b-input-group>
                <b-input-group-prepend>
                  <b-button size="sm" variant="outline-info">垂直</b-button>
                </b-input-group-prepend>
                <b-form-radio-group
                  size="sm"
                  :options="['top', 'middle', 'bottom']"
                  v-model="currentBanner.titleVertical"
                  class="ml-3"
                />
              </b-input-group>
            </b-form-group>
            <hr class="border-light" />
            <b-button-toolbar
              aria-label="Toolbar with button groups and dropdown menu"
              class="my-3"
              style="justify-content:center;"
            >
              <b-button-group class="mx-1 mb-1" size="sm">
                <b-btn variant="success" @click="newImgToPage">新增</b-btn>
                <b-btn variant="warning" @click="deleteImgFromPage">删除</b-btn>
              </b-button-group>
              <b-input-group size="sm" class="w-25 mx-1 mb-1">
                <b-form-select v-model="slide">
                  <option
                    v-for="(item,index) in currentPage.bannerImgs"
                    :key="index"
                    :value="index"
                  >第{{index+1}}张</option>
                </b-form-select>
              </b-input-group>
              <b-button-group class="mx-1 mb-1" size="sm">
                <b-btn variant="primary" @click="saveImgToPage">保存</b-btn>
              </b-button-group>
            </b-button-toolbar>
          </b-form>
        </div>
      </div>
    </section>
  </section>
</template>
<script>
import file from '@/components/custom/tankFiler'
import swal from 'sweetalert'
import AppConsts from '../utiltools/appconst'
import nestedBanner from './custom/nestedBanner'
export default {
    data() {
        return {
            editMode: false,
            isUpdate: false,
            isEditRowChange: false,
            pages: [],
            currentPage: {},
            currentBanner: {},
            slide: 0,
            sliding: false,
            fileShow: false,
            //文件管理器回调函数
            fileCallBack: function(x) {}
        }
    },
    props: ['contentTitle'],
    components: {
        file,
        nestedBanner
    },
    computed: {
        isHomePage() {
            return this.currentPage.parentId == null
        },

        editModeTitle() {
            return this.isUpdate ? '编辑' : '新增'
        },
        currentPageSize() {
            if (this.currentPage.parentId == null)
                return {
                    Width: abp.banner.HomePageWidth,
                    Height: abp.banner.HomePageHeight,
                    Interval: abp.banner.Interval
                }
            else
                return {
                    Width: abp.banner.Width,
                    Height: abp.banner.Height,
                    Interval: abp.banner.Interval
                }
        },
        currentFontPosition() {
            return `banner-font ${this.currentBanner.titleAlign} ${this.currentBanner.titleVertical}`
        }
    },
    watch: {
        slide(val) {
            this.currentBanner =
                this.currentPage.bannerImgs && this.currentPage.bannerImgs.length > 0
                    ? this.currentPage.bannerImgs[val]
                    : {}
        }
    },
    methods: {
        async validateImg() {
            let res
            await this.$validator.validateAll().then(async result => {
                res = result
            })
            return res
        },
        fileClose() {
            this.fileShow = false
        },
        //附件选择
        attachOpen() {
            this.fileShow = true
            this.fileCallBack = this.attachSet
        },
        attachSet(fileUrl) {
            var decodeFileUrl = decodeURIComponent(fileUrl)
            var fileName = decodeFileUrl.substring(
                decodeFileUrl.indexOf(AppConsts.remoteServiceBaseUrl) + AppConsts.remoteServiceBaseUrl.length,
                decodeFileUrl.length
            )
            this.currentBanner.imgUrl = fileName
        },
        async newImgToPage() {
            if (
                (await this.validateImg()) ||
                !this.currentPage.bannerImgs ||
                this.currentPage.bannerImgs.length === 0
            ) {
                this.currentBanner = {}
                this.currentBanner.imgUrl = ''
                this.currentBanner.titleAlign = 'center'
                this.currentBanner.titleVertical = 'bottom'
                if (this.currentPage.bannerImgs.length > 0) {
                    this.currentPage.bannerImgs.splice(this.slide + 1, 0, this.currentBanner)
                    this.$nextTick(() => (this.slide += 1))
                } else this.currentPage.bannerImgs.push(this.currentBanner)
            } else {
                swal({
                    title: '请填写必要的选项!',
                    text: '图片不能为空!',
                    icon: 'warning'
                })
            }
        },
        deleteImgFromPage() {
            swal({
                title: '确认吗?',
                text: '被删除数据可能无法恢复，请您再次确认!',
                icon: 'warning',
                buttons: ['取消', '确认'],
                dangerMode: true
            }).then(async confirm => {
                if (confirm) {
                    let index = this.currentPage.bannerImgs.indexOf(this.currentBanner)
                    let oldLength = this.currentPage.bannerImgs.length
                    let oldslide = this.slide
                    if (index > -1) this.currentPage.bannerImgs.splice(index, 1)
                    if (this.currentPage.bannerImgs.length === 0) {
                        this.newImgToPage()
                        this.$nextTick(() => (this.slide = 0))
                    } else if (this.slide === oldLength - 1) {
                        this.$nextTick(() => (this.slide -= 1))
                    } else {
                        this.$nextTick(() => (this.slide = oldslide))
                    }
                }
            })
        },
        async saveImgToPage() {
            if (await this.validateImg()) {
                this.$http.post('/api/services/app/Navbar/BindBannerImgToNavbar', this.currentPage).then(res => {
                    if (res.data.success) {
                        let json = res.data.result
                        this.currentPage = json
                        swal('操作成功!', '', 'success')
                    }
                })
            } else {
                swal({
                    title: '请填写必要的选项!',
                    text: '图片不能为空!',
                    icon: 'warning'
                })
            }
        },
        getImgUrl(val) {
            if (val) return AppConsts.remoteServiceBaseUrl + val
            else return null
        },
        add(index, item) {
            this.editMode = true
            this.isUpdate = false
            this.currentPage = JSON.parse(JSON.stringify(item))
            this.newImgToPage()
            this.$nextTick(() => {
                this.isEditRowChange = false
                this.onpopstate()
            })
        },
        edit(index, item) {
            this.editMode = true
            this.isUpdate = true
            this.currentPage = JSON.parse(JSON.stringify(item))
            this.currentBanner = this.currentPage.bannerImgs.length > 0 ? this.currentPage.bannerImgs[0] : {}
            this.$nextTick(() => {
                this.isEditRowChange = false
                this.onpopstate()
            })
        },
        del(index, item) {
            swal({
                title: '确认吗?',
                text: '被删除数据可能无法恢复，请您再次确认!',
                icon: 'warning',
                buttons: ['取消', '确认'],
                dangerMode: true
            }).then(async confirm => {
                if (confirm) {
                    item.bannerImgs = []
                    this.$http.post('/api/services/app/Navbar/BindBannerImgToNavbar', item).then(res => {
                        if (res.data.success) {
                            let json = res.data.result
                            this.loadNavbar()
                        }
                    })
                }
            })
        },
        async onSubmit(evt) {
            this.outEditMode()
        },
        onSlideStart(slide) {
            this.sliding = true
        },
        onSlideEnd(slide) {
            this.sliding = false
        },
        loadNavbar() {
            this.$http.get('/api/services/app/Navbar/GetAll', { params: { Id: null } }).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.pages = json
                }
            })
        },
        onpopstate() {
            if (window.history && window.history.pushState) {
                history.pushState(null, null, document.URL)
                window.addEventListener('popstate', this.closeViews, false)
                window.addEventListener('beforeunload', this.beforeunloadFn, false)
            }
        },
        afterpopstate() {
            window.removeEventListener('popstate', this.closeViews, false)
            window.removeEventListener('beforeunload', this.beforeunloadFn, false)
        },
        beforeunloadFn(e) {
            e.returnValue = ``
        },
        closeViews() {
            if (this.editMode) {
                if (this.isEditRowChange)
                    swal({
                        title: '确认吗?',
                        text: '您输入的内容尚未保存，确定离开此页面吗？',
                        icon: 'warning',
                        buttons: ['取消', '确认'],
                        dangerMode: true
                    }).then(async confirm => {
                        if (confirm) this.outEditMode()
                        else history.pushState(null, null, document.URL)
                    })
                else this.outEditMode()
            } else history.back()
        },
        outEditMode() {
            this.editMode = false
            this.slide = 0
            this.isUpdate = false
            this.isEditRowChange = false
            this.currentPage = {}
            this.currentBanner = {}
            this.loadNavbar()
            this.afterpopstate()
        }
    },
    created() {
        var that = this
        this.loadNavbar()
    },
    destroyed() {
        this.afterpopstate()
    }
}
</script>
<style lang="less" scoped>
.row {
    margin-right: 15px;
}
</style>
