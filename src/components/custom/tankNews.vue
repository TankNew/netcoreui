<template>
    <section>
        <section v-show="editMode" style="height:100%; position:relative;">
            <b-modal
                ref="attachModal"
                size="lg"
                scrollable
                :ok-title="'确认'"
                :cancel-title="'取消'"
                :title="modalName"
                @ok="modalOk"
                @hidden="modalReset"
            >
                <section>
                    <file
                        :fileShow="attachShow"
                        :fileCallBack="attachCallBack"
                        @fileClose="attachClose"
                    ></file>
                    <div class="mb-3 center">
                        <div class="news-cover" @click="attachOpen">
                            <img :src="getPicture()" />
                        </div>
                    </div>
                    <b-form
                        @submit.stop.prevent="submitPicture"
                        autocomplete="off"
                        data-vv-scope="form-picture"
                    >
                        <b-form-group
                            label="图片地址:"
                            label-for="p-url"
                            description="选取图片库自动生成链接，或者手动填写外链."
                        >
                            <b-form-input
                                id="p-url"
                                type="text"
                                v-model="currentPicture.picUrl"
                                name="图片地址"
                                :state="!errors.has('form-picture.图片地址') "
                                v-validate="'required'"
                                placeholder="图片地址"
                            ></b-form-input>
                        </b-form-group>
                        <b-form-group
                            label="标题:"
                            label-for="p-title"
                            description="请填写5-30个字的标题."
                        >
                            <b-form-input
                                id="p-title"
                                type="text"
                                v-model="currentPicture.picTitle"
                                name="图片标题"
                                placeholder="图片标题"
                            ></b-form-input>
                        </b-form-group>
                        <b-form-group
                            label="描述:"
                            label-for="p-content"
                            description="简单的文字描述，不允许换行以及链接."
                        >
                            <b-form-textarea
                                id="p-content"
                                size="lg"
                                v-model="currentPicture.picContent"
                                placeholder="文字描述"
                            ></b-form-textarea>
                        </b-form-group>
                    </b-form>
                </section>
            </b-modal>
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
                    <img :src="getCover()" @click="coverOpen" />
                </div>
            </div>
            <b-form
                @submit="onSubmit"
                @reset="onReset"
                autocomplete="off"
                v-if="formShow"
                data-vv-scope="form-update"
            >
                <b-form-group
                    id="InputGroup1"
                    label="标题:"
                    label-for="title"
                    description="请填写5-30个字的标题."
                >
                    <b-form-input
                        id="title"
                        type="text"
                        v-model="form.title"
                        name="标题"
                        :state="!errors.has('form-update.标题') "
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
                    <section class="news-content">
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
                    <draggable
                        tag="ul"
                        :disabled="dragging"
                        :list="form.pictureWithInfos"
                        :animation="200"
                        :group="{ name: `pictureWithInfosDrag`}"
                        :ghost-class="'ghost'"
                    >
                        <li
                            v-for="(f,i) in form.pictureWithInfos"
                            :key="i"
                            @click="editPicture(f,i)"
                        >
                            <img :src="f.picUrl" />
                            <i
                                class="fas fa-times"
                                @click.stop="attachDelete(i)"
                            ></i>
                        </li>
                        <li class="add" @click="addPicture">
                            <i class="fas fa-plus mr-1"></i>添加图片
                        </li>
                    </draggable>
                </div>

                <hr />
                <b-button type="submit" variant="primary">确认</b-button>
                <b-button type="reset" variant="light">重置</b-button>
            </b-form>
        </section>
        <section v-show="!editMode">
            <div>
                <b-alert show dismissible>
                    <b>Info:</b> 拖动条目即可排序（稍后上线）。选择快捷工具‘单页显示条目’可改变显示的条目总数。
                </b-alert>
            </div>
            <label>
                <i class="fas fa-wrench mx-2 text-info"></i>快捷工具
            </label>
            <dl class="news-group-bar" v-if="hasGroup">
                <dd style="width:100%">
                    <b-input-group prepend="子分类管理" size="sm">
                        <b-form-input
                            v-if="isSubGroupUpdating"
                            v-model="subGroupUpdating.displayName"
                            name="子分类名称"
                            :state="!errors.has('form-subGroup.子分类名称') "
                            v-validate="'required'"
                            data-vv-scope="form-subGroup"
                        ></b-form-input>
                        <b-form-select
                            v-else
                            v-model="subGroupIndex"
                            :options="subGroups"
                        >
                            <option slot="first" :value="null">-- 选择子分类 --</option>
                        </b-form-select>
                        <b-input-group-append>
                            <b-button
                                v-if="!isSubGroupUpdating"
                                class="px-5"
                                variant="info"
                                @click="modifySubGroup"
                            >修改</b-button>
                            <b-button
                                v-else
                                class="px-5"
                                variant="success"
                                @click="updateSubGroup"
                            >更新</b-button>
                            <b-button
                                class="px-5"
                                variant="dark"
                                @click="delSubGroup"
                            >删除</b-button>
                        </b-input-group-append>
                    </b-input-group>
                </dd>
                <dd>
                    <b-input-group size="sm">
                        <b-form-input v-model="newSubGroup.displayName"></b-form-input>
                        <b-input-group-append>
                            <b-button
                                variant="primary"
                                @click="addSubGroup"
                            >添加子分类</b-button>
                        </b-input-group-append>
                    </b-input-group>
                </dd>
            </dl>
            <!-- User Interface controls -->
            <dl class="news-bar">
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
                    <b-input-group size="sm" append="单页条目">
                        <b-form-select
                            size="sm"
                            :options="pageOptions"
                            v-model="perPage"
                        />
                    </b-input-group>
                </dd>
            </dl>

            <div class="mb-3 ml-4" v-if="enableAddButton">
                <button
                    type="button"
                    class="btn btn-primary btn-sm px-5"
                    @click="_new"
                >
                    <i class="fas fa-plus mr-1"></i>新增
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
                                variant="light"
                            >预览</b-button>
                            <b-button
                                size="sm"
                                @click.stop="_edit(row.item, row.index, $event.target)"
                                class="mr-1"
                                variant="info"
                            >编辑</b-button>
                            <b-button
                                size="sm"
                                @click.stop="_delete(row.item, row.index, $event.target)"
                                variant="dark"
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
import draggable from 'vuedraggable'

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
            fileCallBack: function(x) {
                console.log(x)
            },

            /*图片组设置*/
            modalName: '',
            dragging: false,
            currentPictureIsUpdate: false, //新增或者更新
            currentPicture: {}, //当前编辑的图片
            currentPictureIndex: 0, //当前编辑图片的INDEX
            attachShow: false, // 打开/关闭文件管理器
            attachCallBack: function(x) {
                console.log(x)
            },
            /**分组设置 */
            isSubGroupUpdating: false,
            subGroupUpdating: {},
            subGroupIndex: null,
            newSubGroup: {},
            subGroups: [],
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
        hasAttach: {
            type: Boolean,
            default: true
        },
        hasCover: {
            type: Boolean,
            default: true
        },
        hasGroup: {
            type: Boolean,
            default: true
        },
        dataGroup: Number,
        dataType: Number,
        dataGroupListUrl: String,
        dataGroupSortUrl: String,
        dataGroupCreateUrl: String,
        dataGroupUpdateUrl: String,
        dataGroupDeleteUrl: String,
        scorllTopLength: Number
    },
    components: {
        //'editor': Editor,
        file: file,
        scroll: scroll,
        tinymce: tinymce,
        draggable: draggable
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
        enableAddButton() {
            return this.subGroups.length === 0
        },
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

            return fields
        }
    },
    methods: {
        addPicture() {
            this.currentPictureIsUpdate = false
            this.currentPicture = {
                picUrl: '',
                picTitle: '',
                picContent: ''
            }
            this.modalName = ` 添加图片：`
            this.$refs.attachModal.show()
        },
        editPicture(item, index) {
            this.currentPictureIsUpdate = true
            this.currentPicture = JSON.parse(JSON.stringify(item))
            this.currentPictureIndex = index
            this.modalName = ` 编辑图片`
            this.$refs.attachModal.show()
        },
        modalReset() {
            this.currentPictureIsUpdate = false
            this.currentPicture = {}
            this.modalName = null
        },
        modalOk(e) {
            e.preventDefault()
            this.submitPicture()
        },
        async submitPicture() {
            if (await this.validate('form-picture')) {
                if (!this.currentPictureIsUpdate) {
                    this.form.pictureWithInfos.push(JSON.parse(JSON.stringify(this.currentPicture)))
                } else {
                    this.form.pictureWithInfos[this.currentPictureIndex] = JSON.parse(
                        JSON.stringify(this.currentPicture)
                    )
                }
                this.$refs.attachModal.hide()
            } else
                swal({
                    title: '请填写必要的选项!',
                    icon: 'warning'
                })
        },
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
            if (this.hasGroup) params.params.catalogGroupId = this.dataGroup
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
            if (this.enableAddButton) {
                this.isUpdate = false
                this.editRow = {}
                this.form = JSON.parse(JSON.stringify(baseFrom))
                this.form.pictureWithInfos = []
                this.editMode = true
            }
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
        /**封面管理 */
        coverOpen() {
            this.fileShow = true
            this.fileCallBack = this.coverSet
        },
        coverSet(fileUrl) {
            this.form.cover = fileUrl
            this.form.miniCover = fileUrl
            console.log(fileUrl)
        },
        getCover() {
            if (this.form.cover !== null && this.form.cover !== '' && this.form.cover !== undefined) {
                return this.form.cover
            } else return `/static/imgs/addCover.jpg`
        },
        fileClose() {
            this.fileShow = false
        },
        /**附件管理 */
        getPicture() {
            if (
                this.currentPicture.picUrl !== null &&
                this.currentPicture.picUrl !== '' &&
                this.currentPicture.picUrl !== undefined
            ) {
                return this.currentPicture.picUrl
            } else return `/static/imgs/addPicture.jpg`
        },
        attachOpen() {
            this.attachShow = true
            this.attachCallBack = this.attachSet
        },
        attachSet(fileUrl) {
            // var fileType = fileUrl.substring(fileUrl.lastIndexOf('.') + 1, fileUrl.length).toLowerCase()
            // var decodeFileUrl = decodeURIComponent(fileUrl)
            // var fileName = decodeFileUrl.substring(decodeFileUrl.lastIndexOf('/') + 1, decodeFileUrl.lastIndexOf('.'))
            this.currentPicture.picUrl = fileUrl
        },
        attachDelete(index) {
            swal({
                title: '确认吗?',
                text: '被删除数据可能无法恢复，请您再次确认!',
                icon: 'warning',
                buttons: ['取消', '确认'],
                dangerMode: true
            }).then(async confirm => {
                if (confirm) {
                    this.form.pictureWithInfos.splice(index, 1)
                }
            })
        },
        attachClose() {
            this.attachShow = false
        },
        /**附件管理 over*/
        outEditMode() {
            this.editMode = false
            this.isUpdate = false
            this.form = {}
            this.editRow = {}
        },
        async validate(scope) {
            let res
            await this.$validator.validateAll(scope).then(async result => {
                res = result
            })
            return res
        },
        async onSubmit(evt) {
            evt.preventDefault()
            if (await this.validate('form-update')) {
                this.form.content = this.$refs.tinymceNews.getVal()
                this.editRow = JSON.parse(JSON.stringify(this.form))
                this.editRow.catalogGroupId = this.dataGroup

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
        },
        getSubGroups() {
            this.subGroups = []
            this.$http.get(this.dataGroupListUrl, { params: { id: this.dataGroup } }).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    json.forEach(element => {
                        this.subGroups.push({ text: element.displayName, value: element.id })
                    })
                }
            })
        },
        addSubGroup() {
            this.newSubGroup.parentId = this.dataGroup
            this.newSubGroup.catalogType = this.dataType
            if (
                this.newSubGroup.displayName !== null &&
                this.newSubGroup.displayName !== '' &&
                this.newSubGroup.displayName !== undefined
            )
                this.$http.post(this.dataGroupCreateUrl, this.newSubGroup).then(res => {
                    if (res.data.success) {
                        let element = res.data.result
                        this.subGroups.push({ text: element.displayName, value: element.id })
                        this.$emit('getMenu')
                        this.newSubGroup = {}
                    }
                })
            else
                swal({
                    title: '请填写必要的选项!',
                    icon: 'warning'
                })
        },
        modifySubGroup() {
            if (this.subGroupIndex != null) {
                this.subGroups.forEach(x => {
                    if (x.value === this.subGroupIndex) {
                        this.subGroupUpdating.displayName = x.text
                        this.subGroupUpdating.id = x.value
                        this.isSubGroupUpdating = true
                    }
                })
            } else
                swal({
                    title: '请填写必要的选项!',
                    icon: 'warning'
                })
        },
        async updateSubGroup() {
            if (await this.validate('form-subGroup')) {
                this.$http.put(this.dataGroupUpdateUrl, this.subGroupUpdating).then(res => {
                    if (res.data.success) {
                        this.$emit('getMenu')
                        this.getSubGroups()
                        this.isSubGroupUpdating = false
                    }
                })
            } else
                swal({
                    title: '请填写必要的选项!',
                    icon: 'warning'
                })
        },
        delSubGroup() {
            if (this.subGroupIndex != null) {
                swal({
                    title: '确认吗?',
                    text: '被删除数据可能无法恢复，请您再次确认!',
                    icon: 'warning',
                    buttons: ['取消', '确认'],
                    dangerMode: true
                }).then(async confirm => {
                    if (confirm) {
                        this.$http.delete(this.dataGroupDeleteUrl, { params: { id: this.subGroupIndex } }).then(res => {
                            if (res.data.success) {
                                this.$emit('getMenu')
                                this.getSubGroups()
                                this.subGroupIndex = null
                            }
                        })
                    }
                })
            } else
                swal({
                    title: '请填写必要的选项!',
                    icon: 'warning'
                })
        }
    },
    created() {
        var that = this
        // 增加预置的标签
        abp.custom.news_marks.forEach(i => this.marks.push(i))
        this.form = JSON.parse(JSON.stringify(baseFrom))
        this.getSubGroups()
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
