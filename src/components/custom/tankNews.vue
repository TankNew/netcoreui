<template>
    <section>
        <section v-show="editMode" style="height:100%; position:relative;">
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
            <div class="mb-3 center">
                <b-button-group>
                    <b-button
                        class="px-5"
                        :variant="form.isTop?'primary':'light'"
                        @click="form.isTop=!form.isTop"
                    >置顶</b-button>
                    <b-button
                        class="px-5"
                        :variant="form.isHot?'warning':'light'"
                        @click="form.isHot=!form.isHot"
                    >热门</b-button>
                </b-button-group>
            </div>
            <div class="mb-3 center" v-if="hasCover">
                <div class="news-cover">
                    <img src="@/assets/img/230x160.jpg" />
                </div>
            </div>
            <b-form
                @submit="onSubmit"
                @reset="onReset"
                autocomplete="off"
                v-if="formShow"
            >
                <b-form-group
                    id="InputGroup1"
                    label="标题:"
                    label-for="title"
                    description="请填写5-30个字的标题."
                >
                    <b-form-input
                        id="title"
                        ref="focusThis"
                        type="text"
                        v-model="form.title"
                        name="标题"
                        :state="!errors.has('标题') "
                        v-validate="'required'"
                        placeholder="标题"
                    ></b-form-input>
                </b-form-group>

                <b-form-group
                    id="InputGroup3"
                    label="标签"
                    label-for="mark"
                    description="可选标签"
                >
                    <b-form-select
                        id="Input3"
                        :options="marks"
                        v-model="form.mark"
                    >
                        <option slot="first" :value="null">无</option>
                    </b-form-select>
                </b-form-group>

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
                <b-form-group label="正文" label-for="detail">
                    <!--正文-->
                    <section style="background-color:#f5f7f9; padding:20px;">
                        <tinymce
                            ref="tinymceNews"
                            @refreshScroll="refreshScroll"
                            @reloadScroll="reloadScroll"
                            :editorTop="70"
                            :editorWidth="editModeWidth"
                            :scollMinTop="386"
                            :scorllTopLength="scorllTopLength"
                        ></tinymce>
                    </section>
                </b-form-group>
                <div v-if="hasAttach" class="news-img-with-info">
                    <ul>
                        <li v-for="(f,i) in form.pictureWithInfos" :key="i">
                            <i class="fas fa-plus"></i>
                        </li>
                        <li>
                            <i class="fas fa-plus mr-1"></i>添加图片
                        </li>
                    </ul>
                </div>
                <b-form-group v-if="hasAttach">
                    <b-button
                        variant="primary"
                        size="sm"
                        @click="attachOpen"
                    >打开文件管理器</b-button>
                    <ol class="attach">
                        <li v-for="(f,i) in form.pictureWithInfos" :key="i">
                            <a :href="f.url">
                                <i class="fas fa-file mr-1"></i>
                                {{f.name}}
                            </a>
                            <i
                                @click="attachDelete(i)"
                                class="far fa-times-circle text-danger"
                            ></i>
                        </li>
                    </ol>
                </b-form-group>
                <hr />
                <b-button type="submit" variant="primary">确认</b-button>
                <b-button type="reset" variant="light">重置</b-button>
            </b-form>
        </section>
        <section v-show="!editMode">
            <div class="mr-3">
                <b-alert show dismissible>
                    <b>Info:</b> 拖动条目即可排序（稍后上线）。选择快捷工具‘单页显示条目’可改变显示的条目总数。
                </b-alert>
            </div>
            <!-- User Interface controls -->
            <dl class="mb-3 flex-column news-bar">
                <dt>
                    <i class="fas fa-wrench mr-1 text-info"></i>快捷工具
                </dt>
                <dd>
                    <b-input-group size="sm">
                        <b-form-input
                            v-model="keyWord"
                            placeholder="关键词"
                            @keyup.enter.prevent="search(keyWord)"
                        />
                        <b-input-group-append>
                            <b-btn @click="search(keyWord)">查找</b-btn>
                        </b-input-group-append>
                    </b-input-group>
                </dd>
                <dd>
                    <b-input-group size="sm">
                        <b-form-select v-model="sortBy" :options="sortOptions">
                            <option slot="first" :value="null">-- 排序依据 --</option>
                        </b-form-select>
                        <b-form-select
                            size="sm"
                            :disabled="!sortBy"
                            v-model="sortDesc"
                            slot="append"
                        >
                            <option :value="false">正序</option>
                            <option :value="true">倒序</option>
                        </b-form-select>
                    </b-input-group>
                </dd>
                <dd>
                    <b-form-group
                        horizontal
                        label="单页显示条目"
                        class="mb-0"
                        :label-cols="4"
                    >
                        <b-form-select
                            size="sm"
                            :options="pageOptions"
                            v-model="perPage"
                        />
                    </b-form-group>
                </dd>
            </dl>
            <div class="mb-3 ml-4">
                <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    @click="_new"
                >
                    <i class="fas fa-plus mr-2"></i>新增
                </button>
            </div>
            <!-- Main table element -->
            <div class="news-table">
                <section style="min-height: 300px;">
                    <b-table
                        id="my-table"
                        show-empty
                        stacked="md"
                        primary-key="id"
                        :head-variant="'bTable'"
                        :hover="true"
                        :busy.sync="isBusy"
                        :bordered="true"
                        :items="myProvider"
                        :fields="fields"
                        :current-page="currentPage"
                        :per-page="perPage"
                        :filter="filter"
                        :sort-by.sync="sortBy"
                        :sort-desc.sync="sortDesc"
                        :sort-direction="sortDirection"
                        @filtered="onFiltered"
                    >
                        <template v-slot:cell(mark)="row">{{row.value}}</template>
                        <template v-slot:cell(isTop)="row">
                            <button
                                type="button"
                                @click.stop="_putTop(row.item)"
                                :class="['btn','btn-sm',row.value?'btn-primary':'btn-light']"
                            >{{row.value?'取消':"置顶"}}</button>
                        </template>
                        <template v-slot:cell(number)="row">
                            <span class="news-number">{{parseInt(row.value)}}</span>
                        </template>
                        <!-- <template v-slot:cell(number)="row">
                            <span
                                class="news-number"
                                @click.stop="isChangeTopNum=!isChangeTopNum"
                                v-if="!isChangeTopNum"
                            >{{row.value}}</span>
                            <input
                                class="form-control form-control-sm"
                                v-else
                                type="number"
                                v-model="row.value"
                                @keyup.enter.prevent="isChangeTopNum=!isChangeTopNum"
                            />
                        </template>-->
                        <template v-slot:cell(title)="row">{{row.value}}</template>
                        <template
                            v-slot:cell(creationTime)="row"
                        >{{formatTime(row.value)}}</template>
                        <template
                            slot="isfile"
                            slot-scope="row"
                        >{{row.value?'是':'否'}}</template>
                        <template v-slot:cell(actions)="row">
                            <!-- We use @click.stop here to prevent a 'row-clicked' event from also happening -->
                            <b-button
                                size="sm"
                                @click.stop="rowClicked(row.item, row.index, $event.target)"
                                class="mr-1"
                            >预览</b-button>
                            <b-button
                                size="sm"
                                @click.stop="_edit(row.item, row.index, $event.target)"
                                class="mr-1"
                            >编辑</b-button>
                            <b-button
                                size="sm"
                                @click.stop="_delete(row.item, row.index, $event.target)"
                                variant="light"
                            >删除</b-button>
                        </template>
                    </b-table>
                </section>

                <b-pagination
                    pills
                    align="center"
                    :total-rows="totalRows"
                    :per-page="perPage"
                    v-model="currentPage"
                    @change="pageChange"
                    class="my-0"
                />

                <!-- Info modal -->
                <b-modal
                    id="modalInfo"
                    @hide="resetModal"
                    :title="modalInfo.title"
                    ok-only
                    @shown="focusMyElement"
                    size="lg"
                >
                    <section class="scroll-container">
                        <scroll
                            ref="content"
                            class="scroll"
                            :autoScroll="false"
                        >
                            <div ref="focusThis" v-html="modalInfo.content"></div>
                        </scroll>
                    </section>
                </b-modal>
            </div>
        </section>
    </section>
</template>
<script>
import file from '@/components/custom/tankFiler'
import tinymce from '@/components/custom/tinymce'
import swal from 'sweetalert'
//import Editor from '@tinymce/tinymce-vue'
import scroll from './scroll'
import tools from '../../utiltools/tools'
const baseFrom = {
    title: '',
    content: '',
    isTop: false,
    isHot: false,
    mark: null,
    pictureWithInfos: []
}
export default {
    name: 'tankNews',
    data() {
        return {
            marks: [],
            modalInfo: {},
            // isChangeTopNum: false, // 可编辑顺序号

            /**编辑模式设置 */
            isUpdate: false,
            editMode: false,
            editModeWidth: 800,
            editorWidths: [640, 800, 900, 1000, 1200],
            editRow: {},
            form: {},
            formShow: true,
            //无用设置tinymce
            editorInit: {
                selector: 'editor',
                inline: true
            },
            fileShow: false,
            //文件管理器回调函数
            fileCallBack: function(x) {
                console.log(x)
            },

            /* table设置 start*/
            isBusy: false,
            currentPage: 1,
            perPage: 10,
            totalRows: 1,
            pageOptions: [5, 10, 20, 50, 100],
            sortBy: null,
            sortDesc: true,
            sortDirection: 'desc',
            keyWord: null,
            filter: null
        }
    },
    props: {
        dataUrl: {
            required: true,
            type: String
        },
        sortUrl: {
            required: true,
            type: String
        },
        updateUrl: {
            required: true,
            type: String
        },
        createUrl: {
            required: true,
            type: String
        },
        deleteUrl: {
            required: true,
            type: String
        },
        dataType: {
            type: Number,
            default: 0
        },
        dataGroup: {
            type: Object,
            default: null
        },
        hasAttach: {
            type: Boolean,
            default: true
        },
        hasCover: {
            type: Boolean,
            default: true
        },
        scorllTopLength: Number
    },
    components: {
        //'editor': Editor,
        file: file,
        scroll: scroll,
        tinymce: tinymce
    },
    watch: {
        //监测是否出于编辑状态
        editMode(val) {
            var that = this
            if (val === true) {
                this.formShow = true
                that.$nextTick(() => {
                    this.$refs.tinymceNews._initScroll()
                    this.$refs.tinymceNews.setVal(this.form.content)
                })
            } else {
                this.$refs.tinymceNews.destroy()
                this.formShow = false
            }

            //刷新滚动轴
            that.refreshScroll()
        },
        perPage() {
            this.refreshScroll()
        }
    },
    computed: {
        editModeTitle() {
            return this.isUpdate ? '编辑' : '新增'
        },
        editModeCss() {
            return 'width:' + this.editModeWidth + 'px'
        },
        sortOptions() {
            // Create an options list from our fields
            return this.fields
                .filter(f => f.sortable)
                .map(f => {
                    return { text: f.label, value: f.key }
                })
        },
        fields() {
            let fields = [
                {
                    key: 'isTop',
                    label: '置顶',
                    class: 'text-center w10'
                },
                {
                    key: 'number',
                    label: '顺序号',
                    sortable: true,
                    sortDirection: 'desc',
                    class: 'text-center w10'
                },
                { key: 'mark', label: '标签', class: 'text-center' },
                { key: 'title', label: '标题', sortable: true, sortDirection: 'desc' },
                {
                    key: 'creationTime',
                    label: '发布时间',
                    sortable: true,
                    class: 'text-center'
                },
                { key: 'actions', label: '操作', class: 'text-center w25' }
            ]

            // 包含图片组
            let attachField = { key: 'isfile', label: '图片组', class: 'text-center' }
            if (this.hasAttach) fields.splice(fields.length - 2, 0, attachField)
            return fields
        }
    },
    methods: {
        search(val) {
            this.filter = val
        },
        formatTime(val) {
            return tools.date(val)
        },
        pageChange(val) {
            this.currentPage = val
        },
        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },
        myProvider(ctx) {
            // Here we don't set isBusy prop, so busy state will be
            // handled by table itself
            // this.isBusy = true
            let params = {
                params: {
                    Keyword: ctx.filter,
                    IsActive: true,
                    SkipCount: (ctx.currentPage - 1) * ctx.perPage,
                    MaxResultCount: ctx.perPage
                }
            }
            let promise = this.$http.get(this.dataUrl, params)
            return promise
                .then(res => {
                    if (res.data.success) {
                        let json = res.data.result
                        let items = json.items
                        items.forEach(i => (i._showDetails = false))
                        //_rowVariant用来定义行颜色
                        // items.forEach(i => { if (i.isTop) i._rowVariant = 'success' })
                        this.totalRows = json.totalCount
                        return items
                    }
                })
                .catch(() => {
                    // Here we could override the busy state, setting isBusy to false
                    // this.isBusy = false
                    // Returning an empty array, allows table to correctly handle
                    // internal busy state in case of error
                    return []
                })
        },
        //查看
        rowClicked(item, index, event) {
            var that = this
            this.modalInfo = JSON.parse(JSON.stringify(item))
            this.$root.$emit('bv::show::modal', 'modalInfo')
            that.$nextTick(() => {
                setTimeout(() => {
                    that.$refs.content.refresh()
                }, 20)
            })
        },
        //重置查看
        resetModal() {
            this.modalInfo = {}
        },
        //modal打开时焦点设置
        focusMyElement(e) {
            this.$refs.focusThis.focus()
        },
        //刷新滚动轴
        refreshScroll() {
            this.$emit('refreshScroll')
        },
        reloadScroll() {
            this.$emit('reloadScroll')
        },
        // 置顶
        _putTop(item) {
            item.isTop = !item.isTop
        },
        //编辑
        _edit(item, index, button) {
            this.isUpdate = true
            this.editRow = item
            this.form = JSON.parse(JSON.stringify(item))
            this.editMode = true
        },
        //新增
        _new() {
            this.isUpdate = false
            this.editRow = {}
            this.form = JSON.parse(JSON.stringify(baseFrom))
            this.editMode = true
        },
        _delete(item, index, button) {
            swal({
                title: '确认吗?',
                text: '被删除数据可能无法恢复，请您再次确认!',
                icon: 'warning',
                buttons: ['取消', '确认'],
                dangerMode: true
            }).then(async confirm => {
                if (confirm) {
                    this.$http.delete(this.deleteUrl, { params: { id: item.id } }).then(res => {
                        if (res.data.success) {
                            this.$root.$emit('bv::refresh::table', 'my-table')
                        }
                    })
                }
            })
        },

        //改变编辑器宽度
        putEditModeWidth(val) {
            var that = this
            this.$refs.tinymceNews.destroy()
            that.editModeWidth = val
            setTimeout(() => {
                this.$refs.tinymceNews._initScroll()
            }, 20)
            //刷新滚动轴
            that.refreshScroll()
        },
        /**附件管理 */
        attachOpen() {
            this.fileShow = true
            this.fileCallBack = this.attachSet
        },
        attachSet(fileUrl) {
            var fileType = fileUrl.substring(fileUrl.lastIndexOf('.') + 1, fileUrl.length).toLowerCase()
            var decodeFileUrl = decodeURIComponent(fileUrl)
            var fileName = decodeFileUrl.substring(decodeFileUrl.lastIndexOf('/') + 1, decodeFileUrl.lastIndexOf('.'))
            var json = { name: fileName + '.' + fileType, url: fileUrl }
            console.log(this.form.pictureWithInfos)
            console.log(json)
            this.form.pictureWithInfos.push(json)
        },
        attachDelete(index) {
            this.form.pictureWithInfos.splice(index, 1)
        },
        fileClose() {
            this.fileShow = false
        },
        outEditMode() {
            this.editMode = false
            this.isUpdate = false
            this.form = {}
            this.editRow = {}
        },
        async validate() {
            let res
            await this.$validator.validateAll().then(async result => {
                res = result
            })
            return res
        },
        /**附件管理 over*/
        async onSubmit(evt) {
            evt.preventDefault()
            if (await this.validate()) {
                this.form.content = this.$refs.tinymceNews.getVal()
                this.editRow = JSON.parse(JSON.stringify(this.form))
                console.log(this.editRow)

                if (!this.isUpdate) {
                    await this.$http.post(this.createUrl, this.editRow).then(res => {
                        if (res.data.success) {
                            let json = res.data.result
                            this.$root.$emit('bv::refresh::table', 'my-table')
                        }
                    })
                } else {
                    await this.$http.put(this.updateUrl, this.editRow).then(res => {
                        if (res.data.success) {
                            this.$root.$emit('bv::refresh::table', 'my-table')
                        }
                    })
                }
                this.outEditMode()
            } else {
                swal({
                    title: '请填写必要的选项!',
                    icon: 'warning'
                })
            }
        },
        //重置
        onReset(evt) {
            evt.preventDefault()
            /* Reset our form values */
            this.form = JSON.parse(JSON.stringify(this.editRow))
            /* 重置或者清除浏览器的验证状态 */
            this.$refs.tinymceNews.destroy()
            this.formShow = false
            this.$nextTick(() => {
                this.formShow = true
                setTimeout(() => {
                    this.$refs.tinymceNews._initScroll()
                }, 20)
            })
        }
    },
    created() {
        var that = this
        // 增加预置的标签
        abp.custom.news_marks.forEach(i => this.marks.push(i))
        this.form = JSON.parse(JSON.stringify(baseFrom))
    },
    mounted: function() {
        var that = this
        // 开发调试
        that.$nextTick(() => {
            that.$emit('reloadScroll')
        })
    },
    beforeDestroy: function() {
        if (this.editMode) this.$refs.tinymceNews.destroy()
    }
}
</script>
<style lang="less" scoped>
.attach-btn {
    display: inline-block;
    vertical-align: middle;
    padding: 0 20px;
}
.attach {
    display: inline-block;
    overflow: hidden;
    vertical-align: middle;
    margin: 0;
    padding-left: 20px;
    & > li {
        margin: 10px;
        padding-bottom: 5px;
        border-bottom: 1px solid #ccc;
        display: inline-block;
        i {
            margin-left: 5px;
            font-size: 18px;
            cursor: pointer;
        }
    }
}
.news-edit-editmode {
    margin-bottom: 20px;
    padding: 10px;
    background-color: #e9ecef;
}
.news-number {
    cursor: pointer;
    display: inline-block;
    width: 32px;
    height: 32px;
    line-height: 32px;
    border-radius: 50%;
    color: #fff;
    background-color: #6699ff;
    &:hover {
        color: #fff;
        background-color: #3366ff;
    }
}
</style>
