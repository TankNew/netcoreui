<template>
    <section class="container-fluid">
        <p class="lead">
            <i class="far fa-copy text-primary mr-1"></i>
            {{contentTitle}}
        </p>
        <!--自定义模块新增/修改-->
        <section v-if="editMode" class="mr-3">
            <section>
                <div class="alert alert-success" role="alert">
                    <i class="far fa-bell mx-1"></i>
                    您当前正处于{{editModeTitle}}模式
                    <button
                        type="button"
                        class="btn btn-secondary btn-sm mx-1 float-right"
                        @click="outEditMode"
                    >退出{{editModeTitle}}模式</button>
                </div>
                <p class="lead">{{getPageEditTitle(module)}}</p>
                <div class="w-50" style="min-width:640px;">
                    <b-form @submit.stop.prevent="onSubmit" autocomplete="off">
                        <div v-if="!isUpdate">
                            <b-button
                                v-if="!isPage"
                                variant="outline-info"
                                :class="module.type===2&&module.catalogType==1?'active':''"
                                @click="module.catalogType=1;module.type=2"
                            >
                                <i class="fas fa-quote-left mr-1"></i>文字类
                            </b-button>
                            <b-button
                                v-if="!isPage"
                                variant="outline-info"
                                :class="module.type===2&&module.catalogType==2?'active':''"
                                @click="module.catalogType=2;module.type=2"
                            >
                                <i class="fas fa-images mr-1"></i>图片类
                            </b-button>
                            <b-button
                                v-if="!isPage"
                                variant="outline-info"
                                :class="module.type===2&&module.catalogType==3?'active':''"
                                @click="module.catalogType=3;module.type=2"
                            >
                                <i class="fas fa-luggage-cart mr-1"></i>产品类
                            </b-button>
                            <b-button
                                v-if="isPage"
                                variant="outline-info"
                                :class="module.type==3?'active':''"
                                @click="module.type=3"
                            >
                                <i class="fas fa-pen-nib mr-1"></i>
                                自由编辑类
                            </b-button>
                            <hr />
                        </div>
                        <b-form-group
                            id="exampleInputGroup1"
                            label="标识名称:"
                            label-for="exampleInput1"
                            description="设置一个便于您识别的标识名称，该名称不会显示在任何前端页面中."
                        >
                            <b-form-input
                                id="exampleInput1"
                                type="text"
                                v-model="module.name"
                                placeholder="输入一个标识名称"
                                required
                            ></b-form-input>
                        </b-form-group>

                        <b-input-group size="sm" prepend="封面" class="mb-3">
                            <div class="info-img">
                                <img :src="module.cover" />
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
                                        @load="onLoadCover"
                                    />
                                </b-btn>
                            </b-input-group-append>
                        </b-input-group>
                        <b-form-group
                            label="简介:"
                            label-for="p-content"
                            description="简单的文字描述，不允许换行以及链接."
                        >
                            <b-form-textarea
                                id="p-content"
                                v-model="module.info"
                                placeholder="模块简介"
                                rows="5"
                                max-rows="10"
                            ></b-form-textarea>
                        </b-form-group>
                        <hr />
                        <b-button type="submit" variant="primary">确认</b-button>
                    </b-form>
                </div>
            </section>
        </section>
        <!--模块总览-->
        <section v-else>
            <b-alert show dismissible class="small">
                <b>Info:</b>预设模块无法删除或者更改，自定义模块会随着版本更新增加种类.
            </b-alert>
            <section>
                <p class="lead mb-3">预设模块</p>
                <div class="mb-3">
                    <button
                        class="btn btn-outline-info mr-3 py-4 px-5"
                        v-for="(item,index) in sections"
                        :key="index"
                    >{{item.name}}</button>
                </div>
            </section>

            <hr />

            <section>
                <p class="lead mb-3">
                    列表模块
                    <button
                        type="button"
                        class="btn btn-primary btn-sm ml-2"
                        @click="add(false)"
                    >
                        <i class="fas fa-plus mr-2"></i>新增
                    </button>
                </p>

                <div class="custom-module-list">
                    <b-card-group deck class="mb-3">
                        <b-card
                            v-for="(item,index) in customSections"
                            :key="index"
                            @click="edit(item,false)"
                            align="center"
                        >
                            <h4
                                class="card-text font-weight-bold color-Purple mt-2"
                            >
                                <span>
                                    {{item.name}}
                                    <b-badge
                                        class="font-weight-light font_10"
                                        pill
                                        v-html="getCatalogType(item)"
                                        :variant="getPageListBorder(item)"
                                    ></b-badge>
                                </span>
                            </h4>

                            <h6 v-html="'创建时间：'+formatTime(item.creationTime)"></h6>
                            <div>
                                <button
                                    class="btn btn-sm btn-link"
                                    @click.stop="edit(item,false)"
                                >编辑</button>
                                <button
                                    class="btn btn-sm btn-link"
                                    @click.stop="del(item,index,false)"
                                >移除</button>
                            </div>
                        </b-card>
                    </b-card-group>
                </div>
            </section>

            <hr />

            <section>
                <p class="lead mb-3">
                    自由编辑模块
                    <button
                        type="button"
                        class="btn btn-primary btn-sm ml-2"
                        @click="add(true)"
                    >
                        <i class="fas fa-plus mr-2"></i>新增
                    </button>
                </p>

                <div class="custom-module-list">
                    <b-card-group deck class="mb-3">
                        <b-card
                            v-for="(item,index) in pageSections"
                            :key="index"
                            @click="edit(item,true)"
                            align="center"
                        >
                            <h4
                                class="card-text font-weight-bold color-Purple mt-2"
                            >
                                <span>
                                    {{item.name}}
                                    <b-badge
                                        class="font-weight-light font_10"
                                        pill
                                        v-html="getCatalogType(item)"
                                        :variant="getPageListBorder(item)"
                                    ></b-badge>
                                </span>
                            </h4>

                            <h6 v-html="'创建时间：'+formatTime(item.creationTime)"></h6>
                            <div>
                                <button
                                    class="btn btn-sm btn-link"
                                    @click.stop="edit(item,true)"
                                >编辑</button>
                                <button
                                    class="btn btn-sm btn-link"
                                    @click.stop="del(item,index,true)"
                                >移除</button>
                            </div>
                        </b-card>
                    </b-card-group>
                </div>
            </section>
        </section>
    </section>
</template>
<script>
import swal from 'sweetalert'
import tools from '../utiltools/tools'
import VueBase64FileUpload from 'vue-base64-file-upload'

export default {
    data() {
        return {
            customImageMaxSize: 0.5,
            module: {},
            editRow: {},
            editMode: false,
            isUpdate: false,
            isPage: true,
            isEditRowChange: false,
            //预设模块
            sections: [],
            //自定义模块
            customSections: [],
            pageSections: []
        }
    },
    computed: {
        editModeTitle() {
            return this.isUpdate ? '编辑' : '新增'
        }
    },
    components: {
        VueBase64FileUpload
    },
    props: ['contentTitle'],

    watch: {
        module: {
            handler(newVal) {
                this.isEditRowChange = true
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        onFile(file) {},
        onLoadCover(dataUri) {
            this.module.cover = dataUri
        },
        onSizeExceeded(size) {
            swal({
                title: '请上传500K以内的图片',
                icon: 'error'
            })
        },
        getPageEditTitle(item) {
            if (item.type === 2 && item.catalogGroup) {
                switch (item.catalogGroup.catalogType) {
                    case 1:
                        return `文字类`
                    case 2:
                        return `图片类`
                    case 3:
                        return `产品类`
                }
            } else return '自由编辑类'
        },
        getPageListBorder(item) {
            if (item.type === 2 && item.catalogGroup) {
                switch (item.catalogGroup.catalogType) {
                    case 1:
                        return `primary`
                    case 2:
                        return `success`
                    case 3:
                        return `info`
                }
            } else return 'warning'
        },

        getCatalogType(item) {
            if (item.type === 2 && item.catalogGroup) {
                switch (item.catalogGroup.catalogType) {
                    case 1:
                        return `<i class="fas fa-quote-left mr-1"></i>文字类`
                    case 2:
                        return `<i class="fas fa-images mr-1" ></i>图片类`
                    case 3:
                        return `<i class="fas fa-luggage-cart mr-1" ></i>产品类`
                }
            } else return `自由编辑类`
        },
        formatTime(val) {
            return tools.date(val)
        },
        outEditMode() {
            this.editMode = false
            this.module = {}
            this.editRow = {}
            this.isUpdate = false
            this.isEditRowChange = false
            this.afterpopstate()
        },
        async onSubmit(evt) {
            evt.preventDefault()
            if (!this.isUpdate) {
                await this.$http.post('/api/services/app/WebModule/Create', this.module).then(res => {
                    if (res.data.success) {
                        let json = res.data.result
                        if (this.isPage) this.pageSections.push(json)
                        else this.customSections.push(json)
                    }
                })
            } else {
                await this.$http.put('/api/services/app/WebModule/Update', this.module).then(res => {
                    if (res.data.success) {
                        this.editRow.name = this.module.name
                        this.editRow.cover = this.module.cover
                        this.editRow.info = this.module.info
                    }
                })
            }
            this.$emit('getMenu')
            this.outEditMode()
        },

        add(isPage) {
            let basicPage = { name: '', type: 3, catalogType: null, cover: '', info: '' }
            if (!isPage) {
                basicPage.type = 2
                basicPage.catalogType = 1
            }
            this.isPage = isPage
            this.isUpdate = false
            this.module = JSON.parse(JSON.stringify(basicPage))
            this.editMode = !this.editMode
            this.$nextTick(() => {
                this.isEditRowChange = false
                this.onpopstate()
            })
        },
        edit(val, isPage) {
            this.isPage = isPage
            this.isUpdate = true
            this.editRow = val
            this.module = JSON.parse(JSON.stringify(val))
            this.editMode = !this.editMode
            this.$nextTick(() => {
                this.isEditRowChange = false
                this.onpopstate()
            })
        },
        del(item, index, isPage) {
            swal({
                title: '确认吗?',
                text: '被删除数据可能无法恢复，请您再次确认!',
                icon: 'warning',
                buttons: ['取消', '确认'],
                dangerMode: true
            }).then(async confirm => {
                if (confirm) {
                    var params = { params: { type: 2, id: item.id } }
                    if (isPage) params.params.type = 3

                    this.$http.delete('/api/services/app/WebModule/Delete').then(res => {
                        if (res.data.success) {
                            this.customSections.splice(index, 1)
                            this.$emit('getMenu')
                        }
                    })
                }
            })
        },
        load() {
            this.$http.get('/api/services/app/WebModule/GetAll', { params: { type: 1 } }).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.sections = json
                }
            })
            this.$http.get('/api/services/app/WebModule/GetAll', { params: { type: 2 } }).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.customSections = json
                    this.customSections.forEach(x => {
                        x.cover = x.catalogGroup.cover
                        x.info = x.catalogGroup.info
                    })
                }
            })

            this.$http.get('/api/services/app/WebModule/GetAll', { params: { type: 3 } }).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.pageSections = json
                    this.pageSections.forEach(x => {
                        x.cover = x.page.cover
                        x.info = x.page.info
                    })
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
        }
    },
    created() {
        this.load()
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
