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
        <file :fileShow="fileShow" :fileCallBack="fileCallBack" @fileClose="fileClose"></file>
        <b-form
            v-if="formShow"
            @submit.stop.prevent="onSubmit"
            @reset="onReset"
            autocomplete="off"
            data-vv-scope="form-update"
        >
            <div class="mb-3 center">
                <div class="news-cover">
                    <img :src="form.headImage" @click="logoOpen" />
                </div>
            </div>
            <b-form-group label="用户名:" label-for="p-name">
                <b-form-input
                    ref="focusThis"
                    id="p-name"
                    type="text"
                    v-model="form.userName"
                    name="用户名"
                    placeholder="用户名"
                    :state="!errors.has('form-update.用户名')"
                    v-validate="'required'"
                ></b-form-input>
            </b-form-group>
            <b-form-group label="姓:" label-for="p-surname">
                <b-form-input
                    ref="focusThis"
                    id="p-surname"
                    type="text"
                    v-model="form.surname"
                    name="姓"
                    placeholder="姓"
                ></b-form-input>
            </b-form-group>
            <b-form-group label="名:" label-for="p-name">
                <b-form-input
                    ref="focusThis"
                    id="p-name"
                    type="text"
                    v-model="form.name"
                    name="名"
                    placeholder="名"
                ></b-form-input>
            </b-form-group>
            <b-form-group label="电子邮箱:" label-for="p-email">
                <b-form-input
                    ref="focusThis"
                    id="p-email"
                    type="text"
                    v-model="form.emailAddress"
                    name="Email"
                    placeholder="电子邮箱"
                    :state="!errors.has('form-update.Email')"
                    v-validate="'email'"
                ></b-form-input>
            </b-form-group>
            <div v-for="(item,index) in form.properties"
                :key="index">
                <b-form-group :label="item.propertyName + ':'" :label-for="item.propertyName"
                    v-if="item.inputType === 'SINGLE_LINE_STRING'">
                    <b-form-input
                        ref="focusThis"
                        :id="item.propertyName"
                        type="text"
                        v-model="form.properties[index].values[0]"
                        name="Email"
                        :placeholder="item.propertyName"
                    ></b-form-input>
                </b-form-group>
                <b-form-group :label="item.propertyName + ':'" :label-for="item.propertyName"
                    v-else-if="item.inputType === 'COMBOBOX'">
                    <b-form-select :id="item.propertyName"
                        v-model="form.properties[index].values[0]"
                        :options="form.properties[index].allValuesInputTypeHas"
                    >
                        <option slot="first" :value="undefined">请选择</option>
                    </b-form-select>
                </b-form-group>
                <b-input-group size="sm" :prepend="item.propertyName" class="mb-3"
                    v-else-if="item.inputType === 'CHECKBOX'">
                    <div class="form-control" size="sm" style="height: auto;">{{item.values.join(' ')}}</div>
                    <b-input-group-append>
                        <b-btn size="sm" variant="primary" @click.stop="changeCheckboxItem(item, index)"> 修改 </b-btn>
                    </b-input-group-append>
                </b-input-group>
            </div>
            
            <b-input-group size="sm" prepend="角色" class="mb-3">
                <div class="form-control" size="sm" style="height: auto;">{{viewPermissions}}</div>
                <b-input-group-append>
                    <b-btn size="sm" variant="primary" @click.stop="changeShowPermissions()"> 修改 </b-btn>
                </b-input-group-append>
            </b-input-group>
            <b-form-group v-show="!isUpdate" label="密码:" label-for="p-password">
                <b-form-input
                    ref="focusThis"
                    id="p-password"
                    type="text"
                    v-model="form.password"
                    name="password"
                    placeholder="密码"
                ></b-form-input>
            </b-form-group>
            <b-form-group label="激活账号:" label-for="p-isActive">
                <b-form-checkbox
                    id="p-isActive"
                    switch
                    @change="form.isActive=!form.isActive"
                    v-model="form.isActive"
                >启用</b-form-checkbox>
            </b-form-group>
            <b-form-group v-show="true" label="个人简介" label-for="detail">
                <tinymce
                    id="detail"
                    ref="tinymceNews"
                    @refreshScroll="refreshScroll"
                    @reloadScroll="reloadScroll"
                    :initial="form.introduction"
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
                        <option :value="false">{{sortBy === 'isActive' ? 'false' : '正序'}}</option>
                        <option :value="true">{{sortBy === 'isActive' ? 'true' : '倒序'}}</option>
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
                        <col style="width:120px;" />
                    </colgroup>
                    <b-thead head-variant="light">
                    <b-tr>
                        <b-th class="text-center">ID</b-th>
                        <b-th class="text-center">用户名</b-th>
                        <b-th class="text-center">邮箱</b-th>
                        <b-th class="text-center">激活</b-th>
                        <b-th class="text-center">创建时间</b-th>
                        <b-th class="text-center">操作</b-th>
                    </b-tr>
                    </b-thead>
                    <b-tbody v-if="isBusy">
                        <b-tr>
                            <b-td colspan="6">
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
                            <b-td class="text-center partner-logo">
                            <!-- <img :src="item.logo" /> -->
                                {{item.userName}}
                            </b-td>
                            <b-td class="text-center">{{item.emailAddress}}</b-td>
                            <b-td class="text-center">{{item.isActive}}</b-td>
                            <b-td class="text-center">{{formatTime(item.creationTime)}}</b-td>
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
                            <b-td colspan="6" variant="light" class="text-left">
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
    <!-- 修改权限 -->
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
                <li v-for="(item,index) in Roles"
                    :key="index"
                    @click.stop="changePermissions(item.normalizedName)">
                    <div class="permissions-item">
                        <span class="checkbox"
                            :class="permissionsAction(item.normalizedName) ? 'checkbox-action' : ''"></span>
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
    <!-- 多选 -->
    <section class="dhy-container" v-if="showProperties"
        ref="dhyContainerPropertiesMoveNodeRef"
        @scroll.stop
        @wheel.stop>
        <div class="permissions-container">
            <div class="head">
                <span class="title">修改 {{propertiesItem.propertyName}}</span>
                <i class="fa-times fas"
                    @click.stop="cancelPropertiesItem()"></i>
            </div>
            <ul class="scrollbar">
                <li v-for="(item,index) in propertiesItem.allValuesInputTypeHas"
                    :key="index"
                    @click.stop="changePropertiesItem(item)">
                    <div class="permissions-item">
                        <span class="checkbox"
                            :class="propertiesItemAction(item) ? 'checkbox-action' : ''"></span>
                        <span class="displayName">{{item}}</span>
                    </div>
                </li>
            </ul>
            <div class="foot">
                <b-button variant="primary"
                    @click.stop="confirmPropertiesItem()">确认</b-button>
                <b-button variant="light"
                    @click.stop="cancelPropertiesItem()">取消</b-button>
            </div>
        </div>
    </section>
</section>
</template>
<script>
// export default {
//     props: ['contentTitle']
// }
import tools from '../utiltools/tools'
import swal from 'sweetalert'
import VueBase64FileUpload from 'vue-base64-file-upload'
import tinymce from '@/components/custom/tinymce'
import draggable from 'vuedraggable'
import file from '@/components/custom/tankFiler'
const baseFrom = {
    headImage: '',
    // title: '',
    // url: '',
    // hasInfo: false,
    introduction: '',

    userName: '',
    name: '',
    surname: '',
    emailAddress: '',
    isActive: true,
    roleNames: [],
    password: '',
    properties: []
}
export default {
    components: {
        tinymce,
        VueBase64FileUpload,
        draggable,
        file
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
            fileShow: false,
            fileCallBack: function (x) {},
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

            // getAllUrl: '/api/services/app/Partner/GetAll',
            // deleteUrl: `/api/services/app/Partner/Delete`,
            // createUrl: `/api/services/app/Partner/Create`,
            // updateUrl: `/api/services/app/Partner/Update`,
            // dragUrl: `/api/services/app/Partner/Move`

            getAllUrl: '/api/services/app/User/GetAll',
            deleteUrl: `/api/services/app/User/Delete`,
            createUrl: `/api/services/app/User/Create`,
            updateUrl: `/api/services/app/User/Update`,
            dragUrl: '', // `/api/services/app/User/Move`

            Roles: [],
            // role: null,
            showPermissions: false,
            choicePermissions: [],
            getRoleAllUrl: '/api/services/app/Role/GetAll',

            showProperties: false,
            propertiesValues: [],
            propertiesItem: null,
            propertiesIndex: 0
        }
    },
    props: {
        contentTitle: String,
        scorllTopLength: Number
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
            this.refreshScroll()
        },
        editMode(val) {
            var that = this
            if (val === true) {
                this.formShow = true
                that.$nextTick(() => {
                    this.$refs.tinymceNews.init()
                    this.$refs.tinymceNews.setVal(this.form.introduction)
                })
            } else {
                this.$refs.tinymceNews.destroy()
                this.formShow = false
            }

            //刷新滚动轴
            that.refreshScroll()
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
                { key: 'id', label: 'ID', sortable: true, sortDirection: 'desc' },
                { key: 'userName', label: '用户名', sortable: true, sortDirection: 'desc' },
                { key: 'surname', label: '姓', class: 'text-center' },
                { key: 'fullName', label: '用户全称', class: 'text-center' },
                { key: 'emailAddress', label: '邮箱', sortable: true, sortDirection: 'desc' },
                { key: 'isActive', label: '激活', sortable: true, sortDirection: 'desc' },
                { key: 'creationTime', label: '创建时间', sortable: true, sortDirection: 'desc' },
                { key: 'actions', label: '操作', class: 'text-center w25' }
            ]

            return fields
        },
    
        viewPermissions() {
            let permissionsDisplayName = []
            if (this.form.roleNames && this.form.roleNames.length) {
                for (let i = 0; this.form.roleNames.length > i; i++) {
                    const grantedPermissionsName = this.form.roleNames[i]
                    const roleNames = this.Roles.find(item => item.normalizedName === grantedPermissionsName)
                    permissionsDisplayName.push(roleNames.displayName)
                }
                return permissionsDisplayName.join(' ')
            }
            return '无'
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
        onFile(file) {},
        logoOpen() {
            this.fileShow = true
            this.fileCallBack = this.logoSet
        },
        logoSet(fileUrl) {
            this.form.headImage = fileUrl
        },
        fileClose() {
            this.fileShow = false
        },
        onLoadCover(dataUri) {
            this.form.logo = dataUri
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
            let sorts = []
            let sort = String(this.sortBy)
            if (sort !== null && sort !== undefined && sort !== '') {
                sort = sort.replace(sort[0], sort[0].toUpperCase())
                sort += ' '
                sort += this.sortDesc ? 'DESC' : 'ASC'
                sorts.push(sort)
            }
            this.$http
                .get(this.getRoleAllUrl, {
                    params: {
                        Keyword: null,
                        SkipCount: 0,
                        MaxResultCount: 1000
                    }
                })
                .then(res => {
                    if (res.data.success) {
                        this.Roles = res.data.result.items
                    }
                })
                .catch(() => {
                    this.isBusy = false
                })
            let params = {
                params: {
                    Keyword: this.filter,
                    // IsActive: true,
                    SkipCount: (this.currentPage - 1) * this.perPage,
                    MaxResultCount: this.perPage,
                    Sorting: sorts.toString()
                }
            }
            if (this.sortBy === 'isActive') {
                params.params.IsActive = this.sortDesc
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

            this.form.introduction = this.form.introduction ? this.form.introduction : ''
            this.role = this.form.roleNames[0] ? this.form.roleNames[0] : null
        },
        //新增
        _new() {
            this.isUpdate = false
            this.editRow = {}
            this.form = JSON.parse(JSON.stringify(baseFrom))
            this.editMode = true

            this.role = null
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
            this.$refs.tinymceNews.destroy()
            this.formShow = false
            this.$nextTick(() => {
                this.formShow = true
                setTimeout(() => {
                    this.$refs.tinymceNews.init()
                }, 20)
            })
        },
        normProperties(properties) {
            for (let i = 0; i < properties.length; i++) {
                if (properties[i].values.length === 1) {
                    if (!properties[i].values[0]) {
                        properties[i].values = []
                    }
                }
            }
        },
        async onSubmit(evt) {
            evt.preventDefault()
            if (await this.validate('form-update')) {
                this.form.introduction = this.$refs.tinymceNews.getVal()
                delete this.form.fullName
                this.editRow = JSON.parse(JSON.stringify(this.form))
                this.normProperties(this.editRow.properties)
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
                this.choicePermissions = JSON.parse(JSON.stringify(this.form.roleNames))
            } else {
                this.form.roleNames = this.choicePermissions
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
        },
        changeCheckboxItem(item, index) {
            this.propertiesItem = item
            this.propertiesIndex = index
            this.propertiesValues = JSON.parse(JSON.stringify(item.values))
            this.showProperties = true
            this.$nextTick(() => {
                let dhyContainerPropertiesMoveNodeRef = this.$refs.dhyContainerPropertiesMoveNodeRef
                document.body.appendChild(dhyContainerPropertiesMoveNodeRef)
            })
        },
        propertiesItemAction(name) {
            if (this.propertiesValues && this.propertiesValues.length) {
                return this.propertiesValues.includes(name)
            }
            return false
        },
        changePropertiesItem(name) {
            if (!this.propertiesItemAction(name)) {
                this.propertiesValues.push(name)
            } else {
                this.propertiesValues.splice(this.propertiesValues.indexOf(name), 1)
            }
        },
        confirmPropertiesItem() {
            this.form.properties[this.propertiesIndex].values = this.propertiesValues
            this.cancelPropertiesItem()
        },
        cancelPropertiesItem() {
            this.propertiesItem = null
            this.propertiesIndex = 0
            this.propertiesValues = []
            this.showProperties = false
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

