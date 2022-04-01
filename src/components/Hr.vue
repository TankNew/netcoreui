<template>
    <section class="container-fluid">
        <p class="lead">
            <i class="far fa-copy text-primary mr-1"></i>
            {{contentTitle}}
        </p>
        <!-- <b-jumbotron header="稍后上线" lead="Ednet.CMS 5.2版将包含这个功能">
            <p>期待您的任何建议与建议！</p>
            <b-button variant="primary" href="http://www.ednet.cn">前往官网</b-button>
        </b-jumbotron> -->
        <section v-show="editMode">
            <div class="alert alert-success" role="alert">
                <i class="far fa-bell mx-1"></i>
                您当前正处于{{editModeTitle}}模式
                <button
                    type="button"
                    class="btn btn-secondary btn-sm mx-1 float-right"
                    @click="outEditMode"
                >退出{{editModeTitle}}模式</button>
            </div>
            <div class="mb-3 center isTop isHot">
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
            <b-form
                v-if="formShow"
                @submit.stop.prevent="onSubmit"
                @reset="onReset"
                autocomplete="off"
                data-vv-scope="form-update">

                <div class="mb-3 center" v-if="hasCover">
                    <div class="news-cover">
                    <img :src="getCover()" @click="coverOpen" />
                    </div>
                </div>
                <file v-if="hasCover"
                    :fileShow="fileShow"
                    :fileCallBack="fileCallBack"
                    @fileClose="fileClose"
                ></file>
                <b-input-group
                    size="sm"
                    prepend="图标"
                    class="mb-3 mx-auto info-img-container">
                    <div class="info-img">
                        <img :src="form.icon" />
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
                <b-form-group label="职位名称:" label-for="p-name">
                    <b-form-input
                        ref="focusThis"
                        id="p-name"
                        type="text"
                        v-model="form.name"
                        name="职位名称"
                        placeholder="职位名称"
                        :state="!errors.has('form-update.职位名称') "
                        v-validate="'required'"
                    ></b-form-input>
                </b-form-group>
                <b-form-group label="工作年限(年):" label-for="p-workYears">
                    <b-form-input
                        ref="focusThis"
                        id="p-workYears"
                        type="number"
                        v-model="form.workYears"
                        name="工作年限"
                        placeholder="工作年限"
                        min="0"
                    ></b-form-input>
                </b-form-group>
                <b-form-group id="InputGroup3" label="类型" label-for="mark">
                    <b-form-select id="mark" :options="marks" v-model="form.workNature"
                        value-field='id'
                        text-field='name'>
                        <!-- <option slot="first" :value="null">无</option> -->
                    </b-form-select>
                </b-form-group>
                <b-form-group label="工作地点:" label-for="p-workLocation">
                    <b-form-input
                        ref="focusThis"
                        id="p-workLocation"
                        type="text"
                        v-model="form.workLocation"
                        name="工作地点"
                        placeholder="工作地点"
                        :state="!errors.has('form-update.企业全称') "
                    ></b-form-input>
                </b-form-group>
                <b-form-group label="工作描述:" label-for="p-description">
                    <b-form-input
                        ref="focusThis"
                        id="p-description"
                        type="text"
                        v-model="form.description"
                        name="工作描述"
                        placeholder="工作描述"
                        :state="!errors.has('form-update.工作描述')"
                        v-validate="'required'"
                    ></b-form-input>
                </b-form-group>

                <b-form-group label="是否注明需求:" label-for="p-hasRequireMent">
                    <b-form-checkbox
                        id="p-hasRequireMent"
                        switch
                        @change="form.hasRequireMent=!form.hasRequireMent"
                        v-model="form.hasRequireMent"
                    >启用</b-form-checkbox>
                </b-form-group>
                <b-form-group label="正文" label-for="detail" v-show="form.hasRequireMent">
                    <tinymce
                        id="detail"
                        ref="tinymceNews"
                        @refreshScroll="refreshScroll"
                        @reloadScroll="reloadScroll"
                        :initial="form.requireMent"
                        :editorWidth="editModeWidth"
                        :scollMinTop="452"
                        :scorllTopLength="scorllTopLength"
                    ></tinymce>
                </b-form-group>
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
                        <b-form-select size="sm" :options="pageOptions" v-model="perPage" />
                    </b-input-group>
                </dd>
            </dl>
            <div class="mb-3 ml-4">
                <button type="button" class="btn btn-primary btn-sm px-5" @click="_new">
                    <i class="fas fa-plus mr-1"></i>新增
                </button>
            </div>
            <div class="news-table">
                <section style="min-height: 300px;">
                    <b-table-simple hover responsive bordered>
                        <colgroup>
                            <col style="width:60px;" />
                            <col style="width:120px;" />
                            <col />
                            <col style="width:70px;" />
                            <col style="width:120px;" />
                        </colgroup>
                        <b-thead head-variant="light">
                            <b-tr>
                                <b-th class="text-center">置顶</b-th>
                                <b-th class="text-center">序列号</b-th>
                                <b-th class="text-center">图标</b-th>
                                <b-th class="text-center">职位名称</b-th>
                                <b-th class="text-center">工作性质</b-th>
                                <b-th class="text-center">工作年限(年)</b-th>
                                <b-th class="text-center">发布时间</b-th>
                                <b-th class="text-center">操作</b-th>
                            </b-tr>
                        </b-thead>
                        <b-tbody v-if="isBusy">
                            <b-tr>
                                <b-td colspan="5">
                                <div class="text-center text-info my-2">
                                    <b-spinner class="align-middle"></b-spinner>
                                    <strong>Loading...</strong>
                                </div>
                                </b-td>
                            </b-tr>
                        </b-tbody>
                        <draggable
                            v-else
                            tag="b-tbody"
                            :disabled="dragging"
                            :list="items"
                            :animation="200"
                            :group="{ name: `news`}"
                            :ghost-class="'ghost'"
                            :move="onMove"
                            @change="handleChange">
                            <b-tr v-for="(item,index) in items" :key="index">
                                <b-th class="text-center"
                                    style="width: 8%;">
                                    <button
                                        type="button"
                                        @click.stop="_putTop(item)"
                                        :class="['btn','btn-sm',item.isTop?'btn-primary':'btn-light']"
                                    >{{item.isTop?'取消':"置顶"}}</button>
                                </b-th>
                                <b-td class="text-center"
                                    style="width: 8%;">
                                    <span class="news-number">{{parseInt(item.id)}}</span>
                                </b-td>
                                <b-td class="text-center partner-logo"
                                    style="width: 11%;">
                                    <img :src="item.icon" />
                                </b-td>
                                <b-td class="text-center">{{item.name}}</b-td>
                                <b-td class="text-center"
                                    style="width: 11%;">{{marks[item.workNature].name}}</b-td>
                                <b-td class="text-center"
                                    style="width: 12%;">{{parseInt(item.workYears)}}</b-td>
                                <b-td class="text-center"
                                    style="width: 12%;">{{formatTime(item.creationTime)}}</b-td>
                                <b-td class="text-center"
                                    style="width: 15%;">
                                    <b-button
                                        size="sm"
                                        @click.stop="_edit(item, item.index, $event.target)"
                                        class="mr-1"
                                        variant="info"
                                        >编辑</b-button>
                                    <b-button
                                        size="sm"
                                        @click.stop="_delete(item, item.index, $event.target)"
                                        variant="dark"
                                        >删除</b-button>
                                </b-td>
                            </b-tr>
                        </draggable>
                        <b-tfoot>
                            <b-tr>
                                <b-td colspan="8" variant="light" class="text-left">
                                Total Rows:
                                    <b>{{totalRows}}</b>
                                </b-td>
                            </b-tr>
                        </b-tfoot>
                    </b-table-simple>
                </section>
                <b-pagination
                    pills
                    align="center"
                    :total-rows="totalRows"
                    :per-page="perPage"
                    v-model="currentPage"
                    @change="pageChange"
                    class="my-0"/>
            </div>
        </section>
    </section>
</template>
<script>
import file from '@/components/custom/tankFiler'
import tools from '../utiltools/tools'
import swal from 'sweetalert'
import VueBase64FileUpload from 'vue-base64-file-upload'
import tinymce from '@/components/custom/tinymce'
import draggable from 'vuedraggable'

const baseFrom = {
    // logo: '',
    icon: '',
    cover: '',
    // title: '',
    name: '',
    // url: '',
    workYears: 0,
    workNature: 0,
    mark: null,
    workLocation: '',
    description: '',
    hasRequireMent: false,
    requireMent: '',

    isTop: false,
    isHot: false
}
export default {
    components: {
        file,
        tinymce,
        VueBase64FileUpload,
        draggable
    },
    data() {
        return {
            customImageMaxSize: 0.2,
            isUpdate: false, // 是否更新
            editMode: false,
            editorWidths: [640, 800, 900, 1000, 1200],
            editRow: {},
            editRowIndex: null,
            form: {},
            formShow: true,
            /* table设置 start*/
            items: [],
            dragging: false,
            isBusy: true,
            currentPage: 1,
            perPage: 10,
            totalRows: 0,
            pageOptions: [5, 10, 20, 50, 100],
            sortBy: 'number',
            sortDesc: false,
            sortDirection: 'desc',
            keyWord: null,
            filter: null,

            hasCover: true,
            fileShow: false,
            fileCallBack: function(x) {},

            marks: [{ id: 0, name: '无' }, { id: 1, name: '全职' }, { id: 2, name: '兼职' }, { id: 3, name: '远程办公' }],

            getAllUrl: '/api/services/app/Hr/GetAll',
            deleteUrl: `/api/services/app/Hr/Delete`,
            createUrl: `/api/services/app/Hr/Create`,
            updateUrl: `/api/services/app/Hr/Update`,
            // dragUrl: `/api/services/app/Hr/Move`
            dragUrl: ``
        }
    },
    props: ['scorllTopLength', 'contentTitle'],
    watch: {
        sortBy(val) {
            this.load()
        },
        sortDesc(val) {
            this.load()
        },
        perPage() {
            this.load()
            this.refreshScroll()
        },
        editMode(val) {
            var that = this
            if (val === true) {
                this.formShow = true
                that.$nextTick(() => {
                    this.$refs.tinymceNews.init()
                    this.$refs.tinymceNews.setVal(this.form.requireMent)
                })
            } else {
                this.$refs.tinymceNews.destroy()
                this.formShow = false
            }

            //刷新滚动轴
            that.refreshScroll()
        }
    },
    computed: {
        editModeTitle() {
            return this.isUpdate ? '编辑' : '新增'
        },
        editModeWidth() {
            return abp.page.width
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
                    key: 'number',
                    label: '顺序号',
                    sortable: true,
                    sortDirection: 'desc',
                    class: 'text-center'
                },
                { key: 'name', label: '职位名称', sortable: true, sortDirection: 'desc' }
                // { key: 'hasRequireMent', label: '注明需求', class: 'text-center' },
                // { key: 'actions', label: '操作', class: 'text-center' }
            ]

            return fields
        }
    },
    methods: {
        onMove(e) {
            if (this.dragging || this.sortBy !== 'number' || this.sortDesc) {
                return false
            }
        },
        async handleChange(e) {
            let toIndex = e.moved.newIndex - 1
            if (e.moved.oldIndex > e.moved.newIndex) toIndex = e.moved.newIndex + 1

            let draged = e.moved.element
            let to = this.items[toIndex]
            let json = {
                id: draged.id,
                toId: to.id,
                above: to.number < draged.number
            }
            // this.dragging = true
            // await this.$http.post(this.dragUrl, json).then(res => {
            //     this.items[e.moved.newIndex].number = res.data.result.number
            //     this.dragging = false
            //     this.dragUpdate = null
            // })
        },
        onFile(file) {},
        onLoadCover(dataUri) {
            this.form.icon = dataUri
        },
        onSizeExceeded(size) {
            swal({
                title: '请上传200K以内的图片',
                icon: 'error'
            })
        },
        refreshScroll() {
            this.$emit('refreshScroll')
        },
        reloadScroll() {
            this.$emit('reloadScroll')
        },

        /**Table methods */
        search(val) {
            this.filter = val
            this.load()
        },
        formatTime(val) {
            return tools.date(val)
        },
        pageChange(val) {
            this.currentPage = val
            this.load()
        },
        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },
        load() {
            this.isBusy = true
            let sorts = ['IsTop DESC']
            let sort = String(this.sortBy)
            if (sort !== null && sort !== undefined && sort !== '') {
                sort = sort.replace(sort[0], sort[0].toUpperCase())
                sort += ' '
                sort += this.sortDesc ? 'DESC' : 'ASC'
                sorts.push(sort)
            }
            let params = {
                params: {
                    Keyword: this.filter,
                    IsActive: true,
                    SkipCount: (this.currentPage - 1) * this.perPage,
                    MaxResultCount: this.perPage,
                    Sorting: sorts.toString()
                }
            }
            this.$http
                .get(this.getAllUrl, params)
                .then(res => {
                    if (res.data.success) {
                        let json = res.data.result
                        this.items = json.items
                        this.items.forEach(i => (i._showDetails = false))
                        this.totalRows = json.totalCount
                        this.isBusy = false
                    }
                })
                .catch(() => {
                    this.isBusy = false
                })
        },

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
        // 编辑模式
        outEditMode() {
            this.editMode = false
            this.isUpdate = false
            this.form = {}
            this.editRow = {}
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
                            this.load()
                        }
                    })
                }
            })
        },
        // 置顶
        _putTop(item) {
            item.isTop = !item.isTop
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
                    this.$refs.tinymceNews.init()
                }, 20)
            })
        },
        async onSubmit(evt) {
            evt.preventDefault()
            if (await this.validate('form-update')) {
                this.form.requireMent = this.$refs.tinymceNews.getVal()
                // this.form.workNature
                this.editRow = JSON.parse(JSON.stringify(this.form))
                if (!this.isUpdate) {
                    await this.$http.post(this.createUrl, this.editRow).then(res => {
                        if (res.data.success) {
                            let json = res.data.result
                            this.load()
                        }
                    })
                } else {
                    await this.$http.put(this.updateUrl, this.editRow).then(res => {
                        if (res.data.success) {
                            this.load()
                        }
                    })
                }
                swal('操作成功!', '', 'success').then(() => this.outEditMode())
            } else {
                swal({
                    title: '请填写必要的选项!',
                    icon: 'warning'
                })
            }
        },
        async validate(scope) {
            let res
            await this.$validator.validateAll(scope).then(async result => {
                res = result
            })
            return res
        },
        async update(item) {
            await this.$http.put(this.updateUrl, item).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    return json
                }
            })
        },
        async create(item) {
            await this.$http.post(this.createUrl, item).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    return json
                }
            })
        },
        /**封面管理 */
        coverOpen() {
            this.fileShow = true
            this.fileCallBack = this.coverSet
        },
        coverSet(fileUrl) {
            this.form.cover = fileUrl
            this.form.miniCover = fileUrl
        },
        getCover() {
            if (this.form.cover !== null && this.form.cover !== '' && this.form.cover !== undefined) {
                return this.form.cover
            } else return `/static/imgs/addCover.jpg`
        },
        fileClose() {
            this.fileShow = false
        }
    },
    created() {
        this.load()
    },

    beforeDestroy: function() {
        if (this.editMode) this.$refs.tinymceNews.destroy()
    }
}
</script>
