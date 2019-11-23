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
                <p class="lead">自定义模块</p>
                <div class="w-50" style="min-width:640px;">
                    <b-form @submit="onSubmit" autocomplete="off">
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

                        <div v-if="!isUpdate">
                            <hr />
                            <b-button
                                variant="outline-info"
                                :class="module.catalogType==1?'active':''"
                                @click="module.catalogType=1"
                            >
                                <i class="fas fa-quote-left mr-1"></i>文字类
                            </b-button>
                            <b-button
                                variant="outline-info"
                                :class="module.catalogType==2?'active':''"
                                @click="module.catalogType=2"
                            >
                                <i class="fas fa-images mr-1"></i>图片类
                            </b-button>
                            <b-button
                                variant="outline-info"
                                :class="module.catalogType==3?'active':''"
                                @click="module.catalogType=3"
                            >
                                <i class="fas fa-luggage-cart mr-1"></i>产品类
                            </b-button>
                            <b-button variant="outline-info" disabled>
                                <i class="fas fa-pen-nib mr-1"></i>
                                自由编辑类
                            </b-button>
                        </div>
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
                    自定义模块
                    <button
                        type="button"
                        class="btn btn-primary btn-sm ml-2"
                        @click="add"
                    >
                        <i class="fas fa-plus mr-2"></i>新增
                    </button>
                </p>

                <div class="custom-module-list">
                    <b-card-group deck class="mb-3">
                        <b-card
                            v-for="(item,index) in customSections"
                            :key="index"
                            @click="edit(item)"
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
                                    @click.stop="edit(item)"
                                >编辑</button>
                                <button
                                    class="btn btn-sm btn-link"
                                    @click.stop="del(item,index)"
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
const basicPage = { name: '', catalogType: 1 }
export default {
    data() {
        return {
            module: {},
            editRow: {},
            editMode: false,
            isUpdate: false,
            isEditRowChange: false,
            //预设模块
            sections: [],
            //自定义模块
            customSections: []
        }
    },
    computed: {
        editModeTitle() {
            return this.isUpdate ? '编辑' : '新增'
        }
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
        getPageListBorder(item) {
            if (item.catalogGroup) {
                switch (item.catalogGroup.catalogType) {
                    case 1:
                        return `primary`
                    case 2:
                        return `success`
                    case 3:
                        return `info`
                }
            } else return 'primary'
        },

        getCatalogType(item) {
            if (item.catalogGroup) {
                switch (item.catalogGroup.catalogType) {
                    case 1:
                        return `<i class="fas fa-quote-left mr-1"></i>文字类`
                    case 2:
                        return `<i class="fas fa-images mr-1" ></i>图片类`
                    case 3:
                        return `<i class="fas fa-luggage-cart mr-1" ></i>产品类`
                }
            } else return null
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
                        this.customSections.push(json)
                    }
                })
            } else {
                await this.$http.put('/api/services/app/WebModule/Update', this.module).then(res => {
                    if (res.data.success) {
                        this.editRow.name = this.module.name
                    }
                })
            }
            this.$emit('getMenu')
            this.outEditMode()
        },

        add() {
            this.isUpdate = false
            this.module = JSON.parse(JSON.stringify(basicPage))
            this.editMode = !this.editMode
            this.$nextTick(() => {
                this.isEditRowChange = false
                this.onpopstate()
            })
        },
        edit(val) {
            this.isUpdate = true
            this.editRow = val
            this.module = JSON.parse(JSON.stringify(val))
            this.editMode = !this.editMode
            this.$nextTick(() => {
                this.isEditRowChange = false
                this.onpopstate()
            })
        },
        del(item, index) {
            swal({
                title: '确认吗?',
                text: '被删除数据可能无法恢复，请您再次确认!',
                icon: 'warning',
                buttons: ['取消', '确认'],
                dangerMode: true
            }).then(async confirm => {
                if (confirm) {
                    this.$http.delete('/api/services/app/WebModule/Delete', { params: { id: item.id } }).then(res => {
                        if (res.data.success) {
                            this.customSections.splice(index, 1)
                            this.$emit('getMenu')
                        }
                    })
                }
            })
        },
        load() {
            this.$http.get('/api/services/app/WebModule/GetAll', { params: { isLock: true } }).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.sections = json
                }
            })
            this.$http.get('/api/services/app/WebModule/GetAll', { params: { isLock: false } }).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.customSections = json
                }
            })
        },
        onpopstate() {
            if (window.history && window.history.pushState) {
                history.pushState(null, null, document.URL)
                window.addEventListener('popstate', this.closeViews, false)
                window.addEventListener('beforeunload', this.beforeunloadFn)
            }
        },
        afterpopstate() {
            window.removeEventListener('popstate', this.closeViews, false)
            window.removeEventListener('beforeunload', this.beforeunloadFn)
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
<style lang="less" scoped>
.custom-module-list {
    h4 {
        & > span {
            position: relative;
        }
        & .badge {
            position: absolute;
            right: -64px;
            top: 0;
        }
    }
    .card {
        max-width: calc(20% - 30px);
        margin-bottom: 10px;
        cursor: pointer;
        &:hover {
            background-color: #17a2b81a;
        }
    }
}
</style>
