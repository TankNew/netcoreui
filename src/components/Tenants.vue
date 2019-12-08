<template>
    <section class="container-fluid">
        <p class="lead">
            <i class="far fa-copy text-primary mr-1"></i>
            {{contentTitle}}
        </p>
        <section>
            <!-- Info modal -->
            <b-modal
                id="modalInfo"
                :title="modalTitle"
                :ok-title="'确认'"
                :cancel-title="'取消'"
                @ok="modalOk"
                @shown="modalInfoShow"
                @hidden="modalInfoHide"
            >
                <section>
                    <b-form
                        @submit.stop.prevent="modalSubmit"
                        autocomplete="off"
                        data-vv-scope="form-modal"
                    >
                        <b-form-group
                            label="公司名称:"
                            label-for="p-name"
                            description="填写公司的中文名称."
                        >
                            <b-form-input
                                ref="focusThis"
                                id="p-name"
                                type="text"
                                v-model="editRow.name"
                                name="公司名称"
                                :state="!errors.has('form-modal.公司名称') "
                                v-validate="'required'"
                                placeholder="公司名称"
                            ></b-form-input>
                        </b-form-group>
                        <b-form-group
                            label="标识"
                            label-for="p-tenancyName"
                            description="这将作为租户的唯一标识."
                        >
                            <b-form-input
                                id="p-tenancyName"
                                type="text"
                                v-model="editRow.tenancyName"
                                name="标识"
                                :state="!errors.has('form-modal.标识') "
                                v-validate="'required'"
                                placeholder="标识"
                            ></b-form-input>
                        </b-form-group>
                        <b-form-group
                            v-if="!isUpdate"
                            label="数据库连接"
                            label-for="p-connectionString"
                            description="可选. 如果你不知道自己在干什么，请留空"
                        >
                            <b-form-input
                                id="p-connectionString"
                                type="text"
                                v-model="editRow.connectionString"
                                name="数据库连接"
                                placeholder="数据库连接"
                            ></b-form-input>
                        </b-form-group>
                        <b-form-group
                            v-if="!isUpdate"
                            label="管理员邮箱地址"
                            label-for="p-adminEmailAddress"
                            description="必填，管理员可以通过邮箱地址找回自己的密钥."
                        >
                            <b-form-input
                                id="p-adminEmailAddress"
                                type="text"
                                v-model="editRow.adminEmailAddress"
                                name="管理员邮箱地址"
                                :state="!errors.has('form-modal.管理员邮箱地址') "
                                v-validate="'required'"
                                placeholder="管理员邮箱地址"
                            ></b-form-input>
                        </b-form-group>
                        <label>管理员默认密码：tianjin@001</label>
                        <b-form-checkbox
                            switch
                            @change="editRow.isActive=!editRow.isActive"
                            v-model="editRow.isActive"
                        >启用</b-form-checkbox>
                    </b-form>
                </section>
            </b-modal>
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
                        <b-form-select
                            size="sm"
                            :options="pageOptions"
                            v-model="perPage"
                        />
                    </b-input-group>
                </dd>
            </dl>
            <div class="mb-3 ml-4">
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
                        <template v-slot:cell(isActive)="row">
                            <button
                                type="button"
                                @click.stop="_changeState(row.item)"
                                :class="['btn','btn-sm',row.value?'btn-primary':'btn-light']"
                            >{{row.value?'正常':"停用"}}</button>
                        </template>
                        <template v-slot:cell(domains)="row">
                            <dl class="mb-0">
                                <dd
                                    class="my-1"
                                    v-for="(item,index) in row.value"
                                    :key="index"
                                >{{index+1}}.{{item.name}}</dd>
                            </dl>
                        </template>
                        <template v-slot:cell(actions)="row">
                            <!-- We use @click.stop here to prevent a 'row-clicked' event from also happening -->
                            <b-button
                                size="sm"
                                @click.stop="domainBind(row.item, row.index, $event.target)"
                                class="mr-1"
                                variant="success"
                            >域名管理</b-button>
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
                    <b-modal
                        id="modalDomainBind"
                        :title="editRow.name"
                        ok-only
                        ok-title="确定"
                        @hidden="domainModelHidden"
                    >
                        <section>
                            <dl class="domain-list">
                                <dd
                                    v-for="(domain,index) in editRow.domains"
                                    :key="index"
                                >
                                    <i
                                        class="fas fa-times-circle"
                                        @click="domainRemoveSubmit(domain,index)"
                                    ></i>
                                    {{index+1}}.{{domain.name}}
                                    <b-form-checkbox
                                        class="d-inline"
                                        switch
                                        v-model="domain.isActive"
                                        @input="domainActiveSubmit(domain,index)"
                                    ></b-form-checkbox>
                                </dd>
                            </dl>
                            <b-form
                                @submit.stop.prevent="domainBindSubmit"
                                autocomplete="off"
                                data-vv-scope="form-domainBind"
                            >
                                <b-input-group prepend="域名" class="mt-3">
                                    <b-form-input
                                        id="p-domain"
                                        type="text"
                                        name="域名"
                                        v-model="newDomain"
                                        :state="!errors.has('form-domainBind.域名') "
                                        v-validate="'required'"
                                        placeholder="www.domain.com"
                                    ></b-form-input>
                                    <b-input-group-append>
                                        <b-button
                                            type="submit"
                                            variant="outline-success"
                                        >绑定</b-button>
                                    </b-input-group-append>
                                </b-input-group>
                            </b-form>
                        </section>
                    </b-modal>
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
    </section>
</template>
<script>
import tools from '../utiltools/tools'
import swal from 'sweetalert'
const baseRow = {
    tenancyName: '',
    name: '',
    isActive: true,
    adminEmailAddress: '',
    connectionString: ''
}
export default {
    data() {
        return {
            /**编辑设定 */
            isUpdate: false, // 是否更新
            editRowIndex: null,
            editRow: {},
            newDomain: null,
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
            filter: null,

            getAllUrl: '/api/services/app/Tenant/GetAll',
            deleteUrl: `/api/services/app/Tenant/Delete`,
            createUrl: `/api/services/app/Tenant/Create`,
            updateUrl: `/api/services/app/Tenant/Update`,

            addDomainUrl: `/api/services/app/Tenant/AddDomainToTenant`,
            activeDomainUrl: '/api/services/app/Tenant/ActiveDomainInTenant',
            removeDomainUrl: `/api/services/app/Tenant/RemoveDomainFromTenant`
        }
    },
    props: ['contentTitle'],
    watch: {
        perPage() {
            this.refreshScroll()
        }
    },
    computed: {
        modalTitle() {
            return this.isUpdate ? '编辑' : '添加'
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
                    key: 'isActive',
                    label: '状态',
                    class: 'text-center'
                },

                { key: 'name', label: '企业名称', sortable: true, sortDirection: 'desc' },
                { key: 'tenancyName', label: '标识', class: 'text-center' },
                { key: 'domains', label: '域名', class: 'text-center' },
                { key: 'actions', label: '操作', class: 'text-center w25' }
            ]

            return fields
        }
    },
    methods: {
        refreshScroll() {
            this.$emit('refreshScroll')
        },
        reloadScroll() {
            this.$emit('reloadScroll')
        },

        /**Table methods */
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
            let params = {
                params: {
                    Keyword: ctx.filter,
                    // IsActive: true,
                    SkipCount: (ctx.currentPage - 1) * ctx.perPage,
                    MaxResultCount: ctx.perPage
                }
            }
            let sort = String(this.sortBy)
            if (sort !== null && sort !== undefined && sort !== '') {
                sort = sort.replace(sort[0], sort[0].toUpperCase())
                sort += ' '
                sort += this.sortDesc ? 'DESC' : 'ASC'
                params.params.Sorting = sort
            }

            let promise = this.$http.get(this.getAllUrl, params)
            return promise
                .then(res => {
                    if (res.data.success) {
                        let json = res.data.result
                        let items = json.items
                        items.forEach(i => (i._showDetails = false))
                        this.totalRows = json.totalCount
                        return items
                    }
                })
                .catch(() => {
                    return []
                })
        },
        // CRUD
        async _changeState(item) {
            item.isActive = !item.isActive
            await this.update(this.editRow)
            this.$root.$emit('bv::refresh::table', 'my-table')
        },
        modalInfoHide() {
            this.isUpdate = false
            this.editRow = {}
            this.editRowIndex = null
            this.$root.$emit('bv::hide::modal', 'modalInfo')
        },

        modalInfoShow(e) {
            this.$refs.focusThis.focus()
        },
        modalOk(e) {
            e.preventDefault()
            this.modalSubmit()
        },
        async modalSubmit(e) {
            if (await this.validate('form-modal')) {
                if (!this.isUpdate) {
                    await this.create(this.editRow)
                } else {
                    await this.update(this.editRow)
                }
                this.$root.$emit('bv::refresh::table', 'my-table')
                this.modalInfoHide()
            } else
                swal({
                    title: '请填写必要的选项!',
                    icon: 'warning'
                })
        },
        domainBind(item, index, button) {
            this.editRow = JSON.parse(JSON.stringify(item))
            this.$root.$emit('bv::show::modal', 'modalDomainBind')
        },
        domainModelHidden() {
            this.newDomain = null
            this.$root.$emit('bv::refresh::table', 'my-table')
        },
        async domainBindSubmit(e) {
            if (await this.validate('form-domainBind')) {
                this.$http
                    .post(this.addDomainUrl, { tenantId: this.editRow.id, domainName: this.newDomain })
                    .then(res => {
                        if (res.data.success) {
                            let json = res.data.result
                            this.newDomain = null
                            this.editRow.domains.push(json)
                            this.$validator.reset()
                        }
                    })
            } else
                swal({
                    title: '请填写必要的选项!',
                    icon: 'warning'
                })
        },
        domainActiveSubmit(item, index) {
            this.$http.post(this.activeDomainUrl, { domainId: item.id, isActive: item.isActive })
        },
        domainRemoveSubmit(item, index) {
            swal({
                title: '确认吗?',
                text: '被删除数据可能无法恢复，请您再次确认!',
                icon: 'warning',
                buttons: ['取消', '确认'],
                dangerMode: true
            }).then(async confirm => {
                if (confirm) {
                    this.$http
                        .delete(this.removeDomainUrl, { params: { domainId: item.id, domainName: item.name } })
                        .then(res => {
                            if (res.data.success) {
                                this.editRow.domains.splice(index, 1)
                            }
                        })
                }
            })
        },
        //编辑
        _edit(item, index, button) {
            this.isUpdate = true
            this.editRow = JSON.parse(JSON.stringify(item))
            this.$root.$emit('bv::show::modal', 'modalInfo')
        },
        //新增
        _new() {
            this.isUpdate = false
            this.editRow = JSON.parse(JSON.stringify(baseRow))
            this.$root.$emit('bv::show::modal', 'modalInfo')
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
        }
    },
    created() {
        var that = this
    },
    mounted: function() {
        var that = this
        // 开发调试
        that.$nextTick(() => {
            that.$emit('reloadScroll')
        })
    }
}
</script>
<style lang="less" scoped>
.domain-list {
    dd {
        padding: 6px;
        border-radius: 4px;
        border: 1px solid #ccc;
        margin-bottom: 4px;
        i {
            cursor: pointer;
            &:hover {
                color: #007bff;
            }
        }
        &:hover {
            background-color: rgba(0, 0, 0, 0.3);
        }
    }
}
</style>
