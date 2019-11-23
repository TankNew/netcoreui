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
                    @change="change"
                />
            </section>
        </div>
        <section v-else>
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
                <div class="col-9 border-right">
                    <b-carousel
                        v-if="banners&&banners.length>0"
                        style="text-shadow: 1px 1px 2px #333;"
                        controls
                        indicators
                        background="#ababab"
                        :interval="0"
                        :img-width="currentPage.width"
                        :img-height="currentPage.height"
                        v-model="slide"
                        @sliding-start="onSlideStart"
                        @sliding-end="onSlideEnd"
                    >
                        <!-- Slides with img slot -->
                        <!-- Note the classes .d-block and .img-fluid to prevent browser default image alignment -->
                        <b-carousel-slide
                            v-for="(item, index) in banners"
                            :key="index"
                        >
                            <img
                                slot="img"
                                class="d-block img-fluid w-100"
                                :src="item.img"
                                alt="image slot"
                            />
                            <h2>{{item.title}}</h2>
                            <p>{{item.text}}</p>
                        </b-carousel-slide>
                    </b-carousel>
                </div>
                <div class="col-3 banner-tools py-3">
                    <p class="lead py-2 border-bottom">
                        <i class="fas fa-wrench mr-1 text-info"></i>设定
                        <small class="float-right">《{{currentPage.name}}》</small>
                    </p>

                    <div>
                        <b-form-group
                            horizontal
                            label="宽度:"
                            label-class="text-sm-right"
                            label-size="sm"
                            label-for="nestedStreet"
                        >
                            <b-input-group append="px">
                                <b-form-input
                                    id="nestedStreet"
                                    v-model="currentPage.width"
                                    size="sm"
                                ></b-form-input>
                            </b-input-group>
                        </b-form-group>
                        <b-form-group
                            horizontal
                            label="高度:"
                            label-class="text-sm-right"
                            label-size="sm"
                            append="px"
                            label-for="nestedCity"
                        >
                            <b-input-group append="px">
                                <b-form-input
                                    id="nestedCity"
                                    v-model="currentPage.height"
                                    size="sm"
                                ></b-form-input>
                            </b-input-group>
                        </b-form-group>
                    </div>
                    <hr class="border-light" />
                    <b-button-toolbar
                        aria-label="Toolbar with button groups and dropdown menu"
                        class="my-3"
                        style="justify-content:center;"
                    >
                        <b-button-group class="mx-1 mb-1" size="sm">
                            <b-btn>新增</b-btn>
                            <b-btn>删除</b-btn>
                        </b-button-group>
                        <b-input-group
                            size="sm"
                            class="w-25 mx-1 mb-1"
                            style="min-width:100px;"
                        >
                            <b-form-select
                                v-model="slide"
                                v-if="banners&&banners.length>0"
                            >
                                <option
                                    v-for="(item,index) in banners"
                                    :key="index"
                                    :value="index"
                                >第{{index+1}}张</option>
                            </b-form-select>
                        </b-input-group>
                        <b-button-group class="mx-1 mb-1" size="sm">
                            <b-btn>保存</b-btn>
                            <b-btn>取消</b-btn>
                        </b-button-group>
                    </b-button-toolbar>
                    <div>
                        <b-form-group
                            horizontal
                            label="图片:"
                            label-class="text-sm-right"
                            label-size="sm"
                            label-for="pic"
                        >
                            <b-input-group>
                                <b-form-input
                                    id="pic"
                                    placeholder="imgUrl"
                                    size="sm"
                                ></b-form-input>
                                <b-input-group-append>
                                    <b-btn size="sm" variant="primary">选择</b-btn>
                                </b-input-group-append>
                            </b-input-group>
                        </b-form-group>

                        <b-form-group
                            horizontal
                            label="主标题:"
                            label-class="text-sm-right"
                            label-size="sm"
                            label-for="nestedState"
                        >
                            <b-form-input
                                id="nestedState"
                                v-model="currentBanner.title"
                                size="sm"
                            ></b-form-input>
                        </b-form-group>
                        <b-form-group
                            horizontal
                            label="附加文字:"
                            label-class="text-sm-right"
                            label-size="sm"
                            label-for="nestedCountry"
                        >
                            <b-form-textarea
                                id="nestedCountry"
                                v-model="currentBanner.text"
                                :rows="3"
                                size="sm"
                                :max-rows="6"
                            ></b-form-textarea>
                        </b-form-group>
                        <b-form-group
                            horizontal
                            label="水平位置:"
                            label-class="text-sm-right"
                            label-size="sm"
                            class="mb-0"
                        >
                            <b-form-radio-group
                                size="sm"
                                :options="['左侧', '居中', '右侧']"
                                v-model="currentBanner.column"
                            />
                        </b-form-group>
                        <b-form-group
                            horizontal
                            label="垂直位置:"
                            label-class="text-sm-right"
                            label-size="sm"
                            class="mb-0"
                        >
                            <b-form-radio-group
                                size="sm"
                                :options="['顶部', '居中', '底部']"
                                v-model="currentBanner.row"
                            />
                        </b-form-group>
                    </div>
                </div>
            </div>
        </section>
    </section>
</template>
<script>
import swal from 'sweetalert'
import nestedBanner from './custom/nestedBanner'
export default {
    data() {
        return {
            editMode: false,
            isUpdate: false,
            isEditRowChange: false,
            pages: [],
            banners: [],
            currentPage: {},
            currentBanner: {},
            slide: 0,
            sliding: false
        }
    },
    props: ['contentTitle'],
    components: {
        nestedBanner
    },
    computed: {
        editModeTitle() {
            return this.isUpdate ? '编辑' : '新增'
        }
    },
    watch: {
        slide(val) {
            this.currentBanner = this.banners.length > 0 ? this.banners[val] : {}
        }
    },
    methods: {
        add(index, item) {
            this.editMode = true
            this.isUpdate = false
            this.currentPage = JSON.parse(JSON.stringify(item))
            this.$nextTick(() => {
                this.isEditRowChange = false
                this.onpopstate()
            })
        },
        edit(index, item) {
            this.editMode = true
            this.isUpdate = true
            this.currentPage = JSON.parse(JSON.stringify(item))
            this.$nextTick(() => {
                this.isEditRowChange = false
                this.onpopstate()
            })
        },
        del(index, item) {
            console.log(index)
            console.log(item)
        },
        change(index, item) {
            console.log(index)
            console.log(item)
        },
        bindCurrentPage(item) {
            this.currentPage = item
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
                window.addEventListener('beforeunload', e => this.beforeunloadFn(e))
            }
        },
        afterpopstate() {
            window.removeEventListener('popstate', this.closeViews, false)
            window.removeEventListener('beforeunload', e => this.beforeunloadFn(e))
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
            this.isUpdate = false
            this.isEditRowChange = false
            this.currentPage = {}
            this.currentBanner = {}
            this.afterpopstate()
        }
    },
    created() {
        var that = this
        console.log(abp.banner)
        this.loadNavbar()
    },
    mounted() {
        // 开发调试
        this.$nextTick(() => {
            this.$emit('reloadScroll')
        })
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
.banner-tools {
    background-color: #374459;
    color: #fff;
    & > h5 {
        text-align: center;
        font-size: 80%;
        background-color: rgba(255, 255, 255, 0.3);
        padding: 5px 0;
        color: #007bff;
    }
}
.banner-choose {
    list-style: none;
    display: inline-block;
    padding: 0;
    margin: 0;
    text-align: center;
    li {
        list-style: none;
        display: inline-block;
        height: 40px;
        width: 100px;
        border: 1px solid #e9ecef;
        line-height: 38px;
        margin: 5px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        &:hover,
        &.active {
            background-color: #007bff;
            color: #fff;
        }
    }
}
</style>
