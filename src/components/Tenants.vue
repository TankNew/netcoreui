<template>
  <section class="container-fluid">
    <p class="lead">
      <i class="far fa-copy text-primary mr-1"></i>
      {{contentTitle}}
    </p>
    <!-- 租户管理modal -->
    <b-modal
      id="modalDomainBind"
      size="lg"
      ok-only
      :title="editRow.name"
      @hidden="domainModelHidden"
    >
      <smooth-scroll ref="domainModelScroll" :autoScroll="false">
        <section @click="domainModelClear" class="pl-1 h-100">
          <b-form
            @submit.stop.prevent="domainModelSubmit"
            autocomplete="off"
            data-vv-scope="form-update"
          >
            <b-form-group
              label="公司名称:"
              label-for="up-name"
              description="填写公司的中文名称."
            >
              <b-form-input
                ref="focusThis"
                id="up-name"
                type="text"
                v-model="editRow.name"
                name="公司名称"
                :state="!errors.has('form-update.公司名称') "
                v-validate="'required'"
                placeholder="公司名称"
                @keyup.enter.prevent="domainModelSubmit"
              ></b-form-input>
            </b-form-group>
          </b-form>
          <section class="tenant-template">
            <h3 class="modal-insider-title">
              模板管理
              <i class="fas fa-ellipsis-h"></i>
            </h3>
            <div class="tenant-template-panel">
              <div class="template-snapshot-container">
                <div class="template-snapshot">
                  <img :src="getSnapUrl(editRow)" />
                </div>
                <h6>{{editRow.template?editRow.template.displayName:'未选择模板'}}</h6>
                <h6>{{editRow.theme?editRow.theme.name:'未选择主题'}}</h6>
              </div>

              <div class="template-list-container">
                <div class="template-list">
                  <smooth-scroll :autoScroll="false">
                    <ul>
                      <li v-for="item in templates" :key="item.id">
                        <div class="snapshot">
                          <div :class="getClass(item)">
                            <img
                              :src="getImgUrl(item)"
                              @click="ChooseTemplate(item)"
                            />
                          </div>
                          <a
                            href="javascript:void(0)"
                            class="display-name"
                            @click="ChooseTemplate(item)"
                          >{{ item.displayName }}</a>
                        </div>
                      </li>
                    </ul>
                  </smooth-scroll>
                </div>
                <div class="theme-list">
                  <ul>
                    <li v-for="item in themes" :key="item.id">
                      <b-form-checkbox
                        v-model="editRow.themeId"
                        :value="item.id"
                        name="flavour-3a"
                      >
                        <i
                          class="fas fa-circle"
                          :style="`color:${item.primaryColor}`"
                        ></i>
                        {{ item.name }}
                      </b-form-checkbox>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          <section class="tenant-domain">
            <h3 class="modal-insider-title">
              域名管理
              <i class="fas fa-ellipsis-h"></i>
            </h3>
            <div class="tenant-domain-panel" @click.stop>
              <div class="list">
                <p class="lead mb-3">域名列表</p>
                <dl>
                  <dd
                    v-for="(domain,index) in editRow.domains"
                    :key="index"
                    @click.stop="_domainEdit(domain,index)"
                  >
                    <a @click.stop>
                      <b-form-checkbox
                        class="d-inline"
                        switch
                        v-model="domain.isActive"
                        @input="domainActiveSubmit($event,domain,index)"
                      ></b-form-checkbox>
                    </a>
                    <a>{{index+1}}.{{domain.name}}</a>
                    <i
                      class="far fa-trash-alt text-danger ml-2"
                      @click.stop="domainRemoveSubmit(domain,index)"
                    ></i>
                  </dd>
                  <dd class="text-success" @click.stop="_domainNew">
                    <i class="fas fa-plus path mr-1"></i>新增
                  </dd>
                </dl>
              </div>
              <div class="detail">
                <div
                  class="no-action"
                  v-if="Object.entries(domainModel).length === 0 && domainModel.constructor === Object"
                >选择左侧模块进行编辑</div>
                <div v-else>
                  <p class="tips">
                    <i class="fas fa-edit path" v-if="domainModelIndex>-1"></i>
                    <i class="fas fa-plus path" v-else></i>
                    <span class="path">{{domainModelIndex>-1?`编辑`:`新增`}}</span>
                    <span
                      class="action"
                    >{{domainModelIndex>-1?domainModel.name:``}}</span>
                  </p>
                  <b-form
                    @submit.stop.prevent="domainBindSubmit"
                    autocomplete="off"
                    data-vv-scope="form-domainBind"
                  >
                    <p>
                      <b-input-group size="sm" prepend="域名">
                        <b-form-input
                          id="p-domain"
                          type="text"
                          name="域名"
                          v-model="domainModel.name"
                          :disabled="domainModelIndex>-1"
                          :state="!errors.has('form-domainBind.域名') "
                          v-validate="'required'"
                          placeholder="www.domain.com"
                        ></b-form-input>
                      </b-input-group>
                    </p>

                    <p>
                      <b-input-group size="sm" prepend="津ICP备">
                        <b-form-input
                          id="p-icp"
                          type="text"
                          name="津ICP"
                          v-model="domainModel.icp"
                          placeholder="B1-10000000号-1"
                        ></b-form-input>
                      </b-input-group>
                    </p>

                    <p>
                      <b-input-group size="sm" prepend="津公网安备" append="号">
                        <b-form-input
                          id="p-gongan"
                          type="text"
                          name="津公网安备"
                          v-model="domainModel.gongAn"
                          placeholder="120000000000000"
                        ></b-form-input>
                      </b-input-group>
                    </p>
                    <hr />
                    <p class="center">
                      <b-button type="submit" variant="primary">提交</b-button>
                    </p>
                  </b-form>
                </div>
              </div>
            </div>
          </section>
        </section>
      </smooth-scroll>
    </b-modal>
    <!-- 租户新增panel -->
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
              v-model="newRow.name"
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
              v-model="newRow.tenancyName"
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
              v-model="newRow.connectionString"
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
              v-model="newRow.adminEmailAddress"
              name="管理员邮箱地址"
              :state="!errors.has('form-modal.管理员邮箱地址') "
              v-validate="'required'"
              placeholder="管理员邮箱地址"
            ></b-form-input>
          </b-form-group>
          <label>管理员默认密码：tianjin@001</label>
          <b-form-checkbox
            switch
            @change="newRow.isActive=!newRow.isActive"
            v-model="newRow.isActive"
          >启用</b-form-checkbox>
        </b-form>
      </section>
    </b-modal>
    <!-- table tools -->
    <div class="news-bar-contaner">
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
      <p class="m-2">
        <button type="button" class="btn btn-primary btn-sm px-5" @click="_new">
          <i class="fas fa-plus mr-1"></i>新增
        </button>
      </p>
    </div>
    <!-- tables list -->
    <div class="news-table">
      <section style="min-height: 300px;">
        <b-table-simple responsive bordered>
          <colgroup>
            <col style="width:4rem;" />
            <col style="width:6rem;" />
            <col />
            <col style="width:10rem;" />
            <col style="width:8rem;" />
          </colgroup>
          <b-thead head-variant="light">
            <b-tr>
              <b-th class="text-center">ID</b-th>
              <b-th class="text-center">开通时间</b-th>
              <b-th class="text-center">企业名称</b-th>
              <b-th class="text-center">企业标识</b-th>
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
          <b-tbody v-else>
            <b-tr v-for="(item,index) in items" :key="index">
              <b-td colspan="5" class="p-0">
                <table class="tr-table">
                  <colgroup>
                    <col style="width:4rem;" />
                    <col style="width:6rem;" />
                    <col />
                    <col style="width:10rem;" />
                    <col style="width:8rem;" />
                  </colgroup>
                  <tr @click="showDetail(item,$event)">
                    <td class="text-center">
                      <span class="news-number">{{parseInt(item.id)}}</span>
                    </td>
                    <td class="text-center">{{formatTime(item.creationTime)}}</td>

                    <td class="text-left">{{item.name}}</td>
                    <td class="text-left">
                      <i
                        :class="['fas','fa-circle',item.isActive?'color-success':'color-danger']"
                      ></i>
                      {{item.tenancyName}}
                    </td>
                    <td class="text-center">
                      <b-button
                        size="sm"
                        @click.stop="domainModelOpen(item, index, $event.target)"
                        class="mr-1"
                        variant="info"
                      >管理</b-button>
                      <b-button
                        size="sm"
                        @click.stop="_delete(item, index, $event.target)"
                        variant="light"
                      >删除</b-button>
                    </td>
                  </tr>
                  <tr v-if="item._showDetails" class="news-show-tr">
                    <td colspan="5">
                      <div class="news-show-detail">
                        <div class="domains">
                          <h3>绑定域名列表:</h3>
                          <ul>
                            <li
                              v-for="(x,index) in item.domains"
                              :key="index"
                            >{{index + 1 + '.' + x.name}}</li>
                          </ul>
                        </div>
                        <div class="template">
                          <h3>当前模板:{{item.template ? item.template.displayName : '未选择'}}</h3>
                          <div class="snopshot">
                            <img :src="getSnapUrl(item)" />
                          </div>
                          <h3 v-if="item.theme">
                            <i
                              class="fas fa-circle"
                              :style="`color:${item.theme.primaryColor}`"
                            ></i>
                          </h3>
                          <h3 v-else>未选择</h3>
                        </div>
                      </div>
                    </td>
                  </tr>
                </table>
              </b-td>
            </b-tr>
          </b-tbody>
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
</template>
<script>
import tools from '../utiltools/tools'
import AppConsts from '../utiltools/appconst'
import swal from 'sweetalert'
import smoothScroll from './custom/smoothScroll'
const baseRow = {
    tenancyName: '',
    name: '',
    isActive: true,
    adminEmailAddress: '',
    connectionString: ''
}
export default {
    components: {
        smoothScroll: smoothScroll
    },
    data() {
        return {
            snapshotSimple: '/static/imgs/960-1280.jpg',
            templates: [],
            themes: [],
            /**编辑设定 */
            isUpdate: false, // 是否更新
            editRowIndex: -1,
            newRow: {},
            editRow: {},
            domainModel: {},
            domainModelIndex: -1,
            /* table设置 start*/
            items: [],
            isBusy: true,
            currentPage: 1,
            perPage: 10,
            totalRows: 1,
            pageOptions: [5, 10, 20, 50, 100],
            sortBy: 'creationTime',
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
            removeDomainUrl: `/api/services/app/Tenant/RemoveDomainFromTenant`,
            updateDomainUrl: `/api/services/app/Tenant/UpdateDomain`,

            templateGetUrl: '/api/services/app/Template/Get',
            templateGetAllUrl: '/api/services/app/Template/GetAll',

            themeGetUrl: '/api/services/app/theme/Get',
            themeGetAllUrl: '/api/services/app/theme/GetAll'
        }
    },
    props: ['contentTitle'],
    watch: {
        editRow: {
            handler(val, oldval) {
                if (
                    this.editRowIndex > -1 &&
                    this.isUpdate &&
                    Object.keys(val).length !== 0 &&
                    Object.keys(oldval).length !== 0
                ) {
                    this.domainModelSubmit()
                }
            },
            deep: true
        },
        perPage() {
            this.load()
            this.refreshScroll()
        },
        sortBy(val) {
            this.load()
        },
        sortDesc(val) {
            this.load()
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
                { key: 'name', label: '企业名称', sortable: true, sortDirection: 'desc' },
                { key: 'tenancyName', label: '标识', sortable: true, sortDirection: 'desc' },
                { key: 'creationTime', label: '创建时间', sortable: true, sortDirection: 'desc' }
            ]

            return fields
        }
    },
    methods: {
        getSnapUrl(item) {
            return item.templateSnapshot ? AppConsts.remoteServiceBaseUrl + item.templateSnapshot : this.snapshotSimple
        },
        getImgUrl(item) {
            return item.templateSnapshots &&
                item.templateSnapshots.filter(x => x.themeId === this.editRow.themeId).length > 0
                ? AppConsts.remoteServiceBaseUrl +
                      item.templateSnapshots.filter(x => x.themeId === this.editRow.themeId)[0].snapshot
                : this.snapshotSimple
        },
        getClass(item) {
            return item.id === this.editRow.templateId ? 'choose' : ''
        },
        ChooseTemplate(item) {
            this.editRow.templateId = item.id
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
        showDetail(item, event) {
            item._showDetails = !item._showDetails
        },
        _new() {
            this.isUpdate = false
            this.newRow = JSON.parse(JSON.stringify(baseRow))
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
        /**企业新增面板 */
        modalInfoHide() {
            this.isUpdate = false
            this.newRow = {}
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
                await this.create(this.newRow)
                this.load(true)
                this.modalInfoHide()
            } else
                swal({
                    title: '请填写必要的选项!',
                    icon: 'warning'
                })
        },
        // 远程数据操作
        async validate(scope) {
            let res
            await this.$validator.validateAll(scope).then(async result => {
                res = result
            })
            return res
        },
        async update(item) {
            const res = await this.$http.put(this.updateUrl, item)
            if (res.data.success) {
                let json = res.data.result
                return json
            }
        },
        async create(item) {
            const res = await this.$http.post(this.createUrl, item)
            if (res.data.success) {
                let json = res.data.result
                return json
            }
        },
        syncEditRow() {
            this.items[this.editRowIndex].name = this.editRow.name
            this.items[this.editRowIndex].domains = this.editRow.domains
            this.items[this.editRowIndex].templateId = this.editRow.templateId
            this.items[this.editRowIndex].template = this.editRow.template
            this.items[this.editRowIndex].themeId = this.editRow.themeId
            this.items[this.editRowIndex].theme = this.editRow.theme
            this.items[this.editRowIndex].templateSnapshot = this.editRow.templateSnapshot
            this.items[this.editRowIndex].isActive = this.editRow.isActive
        },
        /*
        域名管理部分
        */
        domainModelOpen(item, index, button) {
            this.isUpdate = true
            this.editRow = JSON.parse(JSON.stringify(item))
            this.editRowIndex = index

            this.$root.$emit('bv::show::modal', 'modalDomainBind')
        },
        async domainModelSubmit(e) {
            this.isUpdate = false
            if (await this.validate('form-update')) {
                let res = await this.update(this.editRow)
                // this.items[this.editRowIndex] = this.editRow
                this.editRow = res
                this.syncEditRow()
            } else
                swal({
                    title: '请填写必要的选项!',
                    icon: 'warning'
                })
            this.$nextTick(() => (this.isUpdate = true))
        },
        domainModelHidden() {
            this.domainModelClear()
            this.isUpdate = false
            this.editRow = {}
            this.editRowIndex = -1
        },
        domainModelClear() {
            this.domainModel = {}
            this.domainModelIndex = -1
            this.$validator.reset()
        },
        _domainNew() {
            this.domainModelClear()
            this.domainModel.tenantId = this.editRow.id
        },
        _domainEdit(item, index) {
            this.domainModelClear()
            this.domainModelIndex = index
            this.domainModel = JSON.parse(JSON.stringify(item))
        },
        async domainBindSubmit(e) {
            this.isUpdate = false
            if (await this.validate('form-domainBind')) {
                if (this.domainModelIndex > -1) {
                    let res = await this.$http.put(this.updateDomainUrl, this.domainModel)
                    if (res.data.success) {
                        let json = res.data.result
                        this.editRow.domains[this.domainModelIndex] = json
                        this.syncEditRow()
                        this.$validator.reset()
                    }
                } else {
                    let res = await this.$http.post(this.addDomainUrl, this.domainModel)
                    if (res.data.success) {
                        let json = res.data.result
                        this.editRow.domains.push(json)
                        this.syncEditRow()
                        this.$validator.reset()
                    }
                }
            } else
                swal({
                    title: '请填写必要的选项!',
                    icon: 'warning'
                })
            this.$nextTick(() => (this.isUpdate = true))
        },
        domainActiveSubmit(e, item, index) {
            this.$http
                .post(this.activeDomainUrl, { id: item.id, isActive: item.isActive })
                .then(x => this.domainModelClear())
        },
        domainRemoveSubmit(item, index) {
            this.isUpdate = false
            swal({
                title: '确认吗?',
                text: '被删除数据可能无法恢复，请您再次确认!',
                icon: 'warning',
                buttons: ['取消', '确认'],
                dangerMode: true
            }).then(async confirm => {
                if (confirm) {
                    let res = await this.$http.delete(this.removeDomainUrl, { params: { id: item.id } })
                    if (res.data.success) {
                        this.editRow.domains.splice(index, 1)
                        this.syncEditRow()
                    }
                }
            })
            this.$nextTick(() => (this.isUpdate = true))
        },
        /*
        加载数据
        */
        load(x = false) {
            if (x) this.currentPage = 1
            this.isBusy = true
            let sorts = []
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
                        this.items = json.items.map(i => {
                            i._showDetails = false
                            return i
                        })
                        this.totalRows = json.totalCount
                        this.isBusy = false
                    }
                })
                .catch(() => {
                    this.isBusy = false
                })

            params = {
                params: {
                    MaxResultCount: 100,
                    Sorting: 'Id Asc'
                }
            }
            this.$http.get(this.templateGetAllUrl, params).then(res => {
                this.templates = res.data.result.items
            })
            this.$http.get(this.themeGetAllUrl, params).then(res => {
                this.themes = res.data.result.items
            })
        }
    },
    created() {
        this.load()
    }
}
</script>
<style lang="less" scoped>
</style>
