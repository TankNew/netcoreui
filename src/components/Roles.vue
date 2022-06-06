<style lang="less" scoped>

</style>
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
        <b-form
            v-if="formShow"
            @submit.stop.prevent="onSubmit"
            @reset="onReset"
            autocomplete="off"
            data-vv-scope="form-update"
        >
            <b-form-group label="显示名称:" label-for="p-displayName">
                <b-form-input
                    ref="focusThis"
                    id="p-displayName"
                    type="text"
                    v-model="form.displayName"
                    name="显示名称"
                    placeholder="显示名称"
                    :state="!errors.has('form-update.显示名称')"
                    v-validate="'required'"
                ></b-form-input>
            </b-form-group>
            <b-form-group label="名称:" label-for="p-name">
                <b-form-input
                    ref="focusThis"
                    id="p-name"
                    type="text"
                    v-model="form.name"
                    name="名称"
                    placeholder="名称"
                    :state="!errors.has('form-update.名称')"
                    v-validate="'required'"
                ></b-form-input>
            </b-form-group>
            <!-- <b-form-group label="规范名称:" label-for="p-normalizedName" description="英文字母大写">
                <b-form-input
                    ref="focusThis"
                    id="p-normalizedName"
                    type="text"
                    v-model="form.normalizedName"
                    name="规范名称"
                    placeholder="规范名称"
                    :state="!errors.has('form-update.规范名称')"
                    v-validate="'required'"
                ></b-form-input>
            </b-form-group> -->
            <b-form-group label="描述:" label-for="p-description">
                <b-form-input
                    ref="focusThis"
                    id="p-description"
                    type="text"
                    v-model="form.description"
                    name="description"
                    placeholder="描述"
                ></b-form-input>
            </b-form-group>
            <b-input-group size="sm" prepend="权限" class="mb-3">
                <div class="form-control" size="sm" style="height: auto;">{{viewPermissions}}</div>
                <b-input-group-append>
                    <b-btn size="sm" variant="primary" @click.stop="changeShowPermissions()"> 修改 </b-btn>
                </b-input-group-append>
            </b-input-group>
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
                        <option :value="false">{{'正序'}}</option>
                        <option :value="true">{{'倒序'}}</option>
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
                        <col style="width:100px;" />
                        <col style="width:100px;" />
                        <col style="width:80px;" />
                    </colgroup>
                    <b-thead head-variant="light">
                    <b-tr>
                        <b-th class="text-center">ID</b-th>
                        <b-th class="text-center">显示名称</b-th>
                        <b-th class="text-center">名称</b-th>
                        <b-th class="text-center">操作</b-th>
                    </b-tr>
                    </b-thead>
                    <b-tbody v-if="isBusy">
                        <b-tr>
                            <b-td colspan="4">
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
                        :disabled="!dragging"
                        :list="items"
                        :animation="200"
                        :group="{ name: `news`}"
                        :ghost-class="'ghost'"
                        :move="onMove"
                        @change="handleChange"
                    >
                        <b-tr v-for="(item,index) in items" :key="index">
                            <b-td class="text-center">
                            <span class="news-number">{{parseInt(item.id)}}</span>
                            </b-td>
                            <b-td class="text-center">{{item.displayName}} </b-td>
                            <b-td class="text-center">{{item.name}}</b-td>
                            <!-- <b-td class="text-center">
                                {{item.normalizedName}}
                            </b-td> -->
                            <b-td class="text-center">
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
                            <b-td colspan="4" variant="light" class="text-left">
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
                class="my-0"
            />
        </div>
    </section>
    <section class="dhy-container" v-show="showPermissions"
        ref="dhyContainerMoveNodeRef"
        @scroll.stop
        @wheel.stop>
        <div class="permissions-container">
            <div class="head">
                <span class="title">修改权限</span>
                <i class="fa-times fas"
                    @click.stop="cancelShowPermissions()"></i>
            </div>
            <ul class="scrollbar">
                <li v-for="(item,index) in AllPermissions"
                    :key="index"
                    @click.stop="changePermissions(item.name)">
                    <div class="permissions-item">
                        <span class="checkbox"
                            :class="permissionsAction(item.name) ? 'checkbox-action' : ''"></span>
                        <span class="displayName">{{item.displayName}}</span>
                    </div>
                </li>
            </ul>
            <div class="foot">
                <b-button variant="primary"
                    @click.stop="changeShowPermissions()">确认</b-button>
                <b-button variant="light"
                    @click.stop="cancelShowPermissions()">取消</b-button>
            </div>
        </div>
    </section>
</section>
</template>
<script>
// export default {
//     props: ['contentTitle']
// }
import swal from 'sweetalert'
import VueBase64FileUpload from 'vue-base64-file-upload'
// import tinymce from '@/components/custom/tinymce'
import draggable from 'vuedraggable'

const baseFrom = {
    displayName: '',
    name: '',
    normalizedName: '',
    description: '',
    grantedPermissions: []
}
export default {
    components: {
        // tinymce,
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
            sortBy: 'id',
            sortDesc: false,
            sortDirection: 'desc',
            keyWord: null,
            filter: null,

            getAllUrl: '/api/services/app/Role/GetAll',
            deleteUrl: `/api/services/app/Role/Delete`,
            createUrl: `/api/services/app/Role/Create`,
            updateUrl: `/api/services/app/Role/Update`,
            dragUrl: '', // `/api/services/app/User/Move`

            getAllPermissionsUrl: '/api/services/app/Role/GetAllPermissions',

            AllPermissions: [],
            showPermissions: false,
            choicePermissions: []
        }
    },
    props: {
        contentTitle: String
    },
    watch: {
        sortBy(val) {
            this.load()
        },
        sortDesc(val) {
            this.load()
        },
        perPage() {
            this.load()
        },
        editMode(val) {
            var that = this
            if (val === true) {
                this.formShow = true
                that.$nextTick(() => {
                })
            } else {
                this.formShow = false
            }
        },
        showPermissions() {
            if (this.showPermissions) {
                this.$nextTick(() => {
                    let dhyContainerMoveNodeRef = this.$refs.dhyContainerMoveNodeRef
                    document.body.appendChild(dhyContainerMoveNodeRef)
                })
            } else {
                this.$nextTick(() => {
                    let dhyContainerMoveNodeRef = this.$refs.dhyContainerMoveNodeRef
                    document.body.removeChild(dhyContainerMoveNodeRef)
                })
            }
        }
    },
    computed: {
        editModeTitle() {
            return this.isUpdate ? '编辑' : '新增'
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
                { key: 'id', label: 'ID', sortable: true, sortDirection: 'desc' },
                { key: 'displayName', label: '显示名称', sortable: true, sortDirection: 'desc' },
                { key: 'normalizedName', label: '规范名称', sortable: true, sortDirection: 'desc' },
                { key: 'actions', label: '操作', class: 'text-center w25' }
            ]

            return fields
        },

        viewPermissions() {
            let permissionsDisplayName = []
            if (this.form.grantedPermissions && this.form.grantedPermissions.length) {
                for (let i = 0; this.form.grantedPermissions.length > i; i++) {
                    const grantedPermissionsName = this.form.grantedPermissions[i]
                    const grantedPermissions = this.AllPermissions.find(item => item.name === grantedPermissionsName)
                    permissionsDisplayName.push(grantedPermissions.displayName)
                }
                return permissionsDisplayName.join(' ')
            }
            return '未定义'
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
            this.dragging = true
            await this.$http.post(this.dragUrl, json).then(res => {
                this.items[e.moved.newIndex].number = res.data.result.number
                this.dragging = false
                this.dragUpdate = null
            })
        },

        /**Table methods */
        search(val) {
            this.filter = val
            this.load()
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
            let sorts = []
            let sort = String(this.sortBy)
            if (sort !== null && sort !== undefined && sort !== '') {
                sort = sort.replace(sort[0], sort[0].toUpperCase())
                sort += ' '
                sort += this.sortDesc ? 'DESC' : 'ASC'
                sorts.push(sort)
            }
            this.$http
                .get(this.getAllPermissionsUrl)
                .then(res => {
                    if (res.data.success) {
                        this.AllPermissions = res.data.result.items
                    }
                })
                .catch(() => {
                    this.isBusy = false
                })
            let params = {
                params: {
                    Keyword: this.filter,
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
            setTimeout(() => {
            }, 20)
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
        //重置
        onReset(evt) {
            evt.preventDefault()
            /* Reset our form values */
            this.form = JSON.parse(JSON.stringify(this.editRow))
            /* 重置或者清除浏览器的验证状态 */
            this.formShow = false
            this.$nextTick(() => {
                this.formShow = true
                setTimeout(() => {
                }, 20)
            })
        },
        async onSubmit(evt) {
            evt.preventDefault()
            if (await this.validate('form-update')) {
                this.form.normalizedName = this.form.name.toUpperCase()
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

        changeShowPermissions() {
            this.showPermissions = !this.showPermissions
            if (this.showPermissions) {
                this.choicePermissions = JSON.parse(JSON.stringify(this.form.grantedPermissions))
            } else {
                this.form.grantedPermissions = this.choicePermissions
                this.choicePermissions = []
            }
        },
        cancelShowPermissions() {
            this.showPermissions = false
            this.choicePermissions = []
        },
        permissionsAction(name) {
            if (this.choicePermissions && this.choicePermissions.length) {
                return this.choicePermissions.includes(name)
            }
            return false
        },
        changePermissions(name) {
            if (this.choicePermissions && this.choicePermissions.length) {
                if (this.choicePermissions.includes(name)) {
                    this.choicePermissions.splice(this.choicePermissions.indexOf(name), 1)
                } else {
                    this.choicePermissions.push(name)
                }
                return
            }
            this.choicePermissions = [name]
        }
    },
    created() {
        this.load()
    },

    beforeDestroy: function() { }
}
</script>
