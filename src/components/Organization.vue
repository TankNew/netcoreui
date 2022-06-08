<template>
  <section class="container-fluid">
    <p class="lead">
      <i class="far fa-copy text-primary mr-1"></i>
      {{contentTitle}}
    </p>
    <div class="mr-3">
      <b-alert show dismissible>
        <b>Info:</b> 将鼠标移动到节点上，即可编辑，删除，以及增加子节点。根节点不可删除，兄弟节点不可重名。
      </b-alert>
      <div ref="ctxMenuContainer">
        <context-menu id="context-menu" ref="ctxMenu" @ctx-open="onCtxOpen">
          <li @contextmenu.prevent @click="edit">
            <i class="fas color-primary fa-pencil-alt mr-1"></i>
            编辑
          </li>
          <li @contextmenu.prevent @click="add">
            <i class="fas color-success fa-plus mr-1"></i>
            扩展
          </li>
          <li @contextmenu.prevent @click="del" v-if="currentLayer>0">
            <i class="fas color-danger fa-minus mr-1"></i>
            删除
          </li>
        </context-menu>
      </div>
    </div>
    <section class="tankTree"
      :class="folderView ? 'dhy-tankTree' : ''">
      <div v-if="folderView"
        class="dhy-container-card"
        >
        <div class="head">
          <div class="title">组织结构</div>
        </div>
        <div class="body">
          <nested-draggable
            :dragging="dragging"
            :dragUrl="dragUrl"
            :children="organizationList"
            :parentId="0"
            :folderView="folderView"
            @onDrag="onDrag"
            @ctxMenuOpen="ctxMenuOpen"
            @choiceChildren="choiceChildren"
          />
        </div>
      </div>
      <div v-if="folderView"
        class="dhy-container-card"
        >
        <div class="head"
          style="justify-content: space-between;">
          <div class="title">{{childrenItem ? childrenItem.displayName : ''}}</div>
          <div class="title">{{childrenItem ? 'Id:' + childrenItem.id : ''}}</div>
        </div>
        <div class="body">
          <ul class="nav">
            <li class="nav-item"
              v-for="(item,index) in navArr"
              :key="index">
              <div class="name"
                v-if="item.viewDisplay"
                :class="navChoice === item.name ? 'name-action' : ''"
                @click.stop="changeNavChoice(item.name)">{{item.displayName}}</div>
            </li>
          </ul>
          <div class="buttons"
            v-if="navItem.name === navArr[0].name && childrenItem">
            <b-button variant="primary"
              @click.stop="changeShowChooseUsers()">
              <!-- <i class="fas fa-plus"></i> -->
              修改{{navChoiceDisplay}}
              </b-button>
          </div>
          <div class="dhy-table"
            v-if="navItem.name === navArr[0].name && childrenItem">
            <div class="thead">
              <div class="tr">
                <div class="th">删除</div>
                <div class="th">全名</div>
                <div class="th">电子邮箱</div>
              </div>
            </div>
            <div class="tbody">
              <div class="tr"
                v-show="navItem.BindingData.length"
                v-for="(item,index) in navItem.BindingData"
                :key="index">
                <div class="td">
                  <div class="delete"
                    @click.stop="deleteUser(item.id)"
                  ><i class="fas fa-times"></i></div>
                </div>
                <div class="td">
                  <div class="name">{{item.fullName}}</div>
                </div>
                <div class="td">
                  <div class="description">{{item.emailAddress}}</div>
                </div>
              </div>
              <div class="tr"
                v-show="!navItem.BindingData.length">
                <div class="td"
                  style="width:100%;">
                  <div class="remind"
                    style="text-align: center;">没有数据</div>
                </div>
              </div>
              <div class="tr loading"
                v-show="navItem.isBusy">
                <div class="text-center text-info my-2">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong>Loading...</strong>
                </div>
              </div>
            </div>
            <div class="tfoot">
              <!-- <div class="tr">
                <div class="td">
                  <div class="pages">
                    <b-pagination
                        pills
                        align="center"
                        :total-rows="navItem.totalRows"
                        :per-page="navItem.perPage"
                        v-model="navItem.currentPage"
                        class="my-0"
                        style="flex-direction: row;flex-wrap: wrap;"
                    />
                  </div>
                </div>
              </div> -->
              <div class="tr">
                <div class="td"
                  style="justify-content: flex-start;">
                  <!-- <div class="perPage">
                      <b-form-select size="sm" :options="pageOptions" v-model="navItem.perPage" />
                  </div> -->
                  <div class="total">总计：{{navItem.totalRows}}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="buttons"
            v-if="navItem.name === navArr[1].name && childrenItem">
            <b-button variant="primary"
              @click.stop="changeShowChooseRoles()">
              <!-- <i class="fas fa-plus"></i> -->
              修改{{navChoiceDisplay}}
              </b-button>
          </div>
          <div class="dhy-table"
            v-if="navItem.name === navArr[1].name && childrenItem">
            <div class="thead">
              <div class="tr">
                <div class="th">删除</div>
                <div class="th">{{navChoiceDisplay}}名</div>
                <div class="th">描述</div>
              </div>
            </div>
            <div class="tbody">
              <div class="tr"
                v-show="navItem.BindingData.length"
                v-for="(item,index) in navItem.BindingData"
                :key="index">
                <div class="td">
                  <div class="delete"
                    @click.stop="deleteRole(item.id)"
                  ><i class="fas fa-times"></i></div>
                </div>
                <div class="td">
                  <div class="name">{{item.displayName}}</div>
                </div>
                <div class="td">
                  <div class="description">{{item.description}}</div>
                </div>
              </div>
              <div class="tr"
                v-show="!navItem.BindingData.length">
                <div class="td"
                  style="width:100%;">
                  <div class="remind"
                    style="text-align: center;">没有数据</div>
                </div>
              </div>
              <div class="tr loading"
                v-show="navItem.isBusy">
                <div class="text-center text-info my-2">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong>Loading...</strong>
                </div>
              </div>
            </div>
            <div class="tfoot">
              <!-- <div class="tr">
                <div class="td">
                  <div class="pages">
                    <b-pagination
                        pills
                        align="center"
                        :total-rows="navItem.totalRows"
                        :per-page="navItem.perPage"
                        v-model="navItem.currentPage"
                        class="my-0"
                        style="flex-direction: row;flex-wrap: wrap;"
                    />
                  </div>
                </div>
              </div> -->
              <div class="tr">
                <div class="td"
                  style="justify-content: flex-start;">
                  <!-- <div class="perPage">
                      <b-form-select size="sm" :options="pageOptions" v-model="navItem.perPage" />
                  </div> -->
                  <div class="total">总计：{{navItem.totalRows}}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="tips"
            v-show="!childrenItem">选择一个组织结构以查看{{navChoiceDisplay}}.</div>
        </div>
      </div>
    </section>
    <!-- 修改绑定成员 -->
    <section class="dhy-container" v-if="navItem.name === navArr[0].name && navItem.showChoose"
        ref="dhyContainerUsersMoveNodeRef"
        @scroll.stop
        @wheel.stop>
        <div class="permissions-container">
            <div class="head">
                <span class="title">修改 {{navChoiceDisplay}}</span>
                <i class="fa-times fas"
                    @click.stop="cancelShowChooseRoles()"></i>
            </div>
            <b-input-group size="sm"
              style="height:63px;border-top: 1px solid #eff2f5;padding: 12px 35px;">
                <b-form-input
                  v-model="navItem.filter.filter"
                  placeholder="关键词"
                  @keyup.enter.prevent="getAllDataUsers()"
                  style="height:100%;"
                  />
                <b-input-group-append>
                  <b-btn @click="getAllDataUsers()">查找</b-btn>
                </b-input-group-append>
            </b-input-group>
            <ul class="scrollbar" style="border-top: none;height: calc(100% - 250px);">
                <li v-for="(item,index) in navItem.AllDataArr"
                    :key="index"
                    @click.stop="changeChoiceAllDataRoles(item.id)">
                    <div class="permissions-item">
                        <span class="checkbox"
                            :class="choiceAllDataRolesAction(item.id) ? 'checkbox-action' : ''"></span>
                        <span class="displayName">{{item.userName + '（' + item.emailAddress + '）'}}</span>
                    </div>
                </li>
                <li class="loading"
                  v-show="navItem.filter.isBusy">
                  <div class="text-center text-info my-2">
                      <b-spinner class="align-middle"></b-spinner>
                      <strong>Loading...</strong>
                  </div>
                </li>
            </ul>
            <div class="pages">
                <b-pagination
                    pills
                    align="center"
                    :total-rows="navItem.filter.totalCount"
                    :per-page="navItem.filter.perPage"
                    v-model="navItem.filter.currentPage"
                    @change="getAllDataUsers()"
                    class="my-0"
                    style="flex-direction: row;flex-wrap: wrap;"
                />
                <div class="perPage">
                    <b-form-select size="sm" :options="pageOptions" v-model="navItem.filter.perPage"
                      @change="getAllDataUsers()"/>
                </div>
                <div class="total">总计：{{navItem.filter.totalCount}}</div>
            </div>
            <div class="foot">
                <b-button variant="primary"
                    @click.stop="confirmChangeUsers()">确认</b-button>
                <b-button variant="light"
                    @click.stop="cancelShowChooseRoles()">取消</b-button>
            </div>
        </div>
    </section>
    <!-- 修改绑定角色 -->
    <section class="dhy-container" v-if="navItem.name === navArr[1].name && navItem.showChoose"
        ref="dhyContainerRolesMoveNodeRef"
        @scroll.stop
        @wheel.stop>
        <div class="permissions-container">
            <div class="head">
                <span class="title">修改 {{navChoiceDisplay}}</span>
                <i class="fa-times fas"
                    @click.stop="cancelShowChooseRoles()"></i>
            </div>
            <b-input-group size="sm"
              style="height:63px;border-top: 1px solid #eff2f5;padding: 12px 35px;">
                <b-form-input
                  v-model="navItem.filter.filter"
                  placeholder="关键词"
                  @keyup.enter.prevent="getAllDataRoles()"
                  style="height:100%;"
                  />
                <b-input-group-append>
                  <b-btn @click="getAllDataRoles()">查找</b-btn>
                </b-input-group-append>
            </b-input-group>
            <ul class="scrollbar" style="border-top: none;height: calc(100% - 250px);">
                <li v-for="(item,index) in navItem.AllDataArr"
                    :key="index"
                    @click.stop="changeChoiceAllDataRoles(item.id)">
                    <div class="permissions-item">
                        <span class="checkbox"
                            :class="choiceAllDataRolesAction(item.id) ? 'checkbox-action' : ''"></span>
                        <span class="displayName">{{item.displayName}}</span>
                    </div>
                </li>
                <li class="loading"
                  v-show="navItem.filter.isBusy">
                  <div class="text-center text-info my-2">
                      <b-spinner class="align-middle"></b-spinner>
                      <strong>Loading...</strong>
                  </div>
                </li>
            </ul>
            <div class="pages">
                <b-pagination
                    pills
                    align="center"
                    :total-rows="navItem.filter.totalCount"
                    :per-page="navItem.filter.perPage"
                    v-model="navItem.filter.currentPage"
                    @change="getAllDataRoles()"
                    class="my-0"
                    style="flex-direction: row;flex-wrap: wrap;"
                />
                <div class="perPage">
                    <b-form-select size="sm" :options="pageOptions" v-model="navItem.filter.perPage"
                      @change="getAllDataRoles()"/>
                </div>
                <div class="total">总计：{{navItem.filter.totalCount}}</div>
            </div>
            <div class="foot">
                <b-button variant="primary"
                    @click.stop="confirmChangeRoles()">确认</b-button>
                <b-button variant="light"
                    @click.stop="cancelShowChooseRoles()">取消</b-button>
            </div>
        </div>
    </section>
    <!--弹出修改层-->
    <b-modal
      id="modalPrevent"
      ref="modal"
      :title="modalName"
      :ok-title="'确认'"
      :cancel-title="'取消'"
      @ok="handleOk"
      @shown="modalOpen"
      @hidden="clearName"
    >
      <form autocomplete="off" @submit.stop.prevent="handleOk">
        <b-input-group size="sm" prepend="节点显示名" class="mb-3">
          <b-form-input
            ref="modalInput"
            name="节点显示名"
            :state="!errors.has('节点显示名')"
            v-validate="'required'"
            v-model="module.displayName"
          ></b-form-input>
        </b-input-group>
      </form>
    </b-modal>
  </section>
</template>
<script>
import tools from '../utiltools/tools'
import swal from 'sweetalert'
import nestedDraggable from './custom/nested'
import contextMenu from 'vue-context-menu'

export default {
    data() {
        return {
            organizationList: [],
            module: {
                displayName: ''
            },
            editMode: false,
            modalName: '',
            dragUrl: '/api/services/app/Organization/Move',
            dragging: false,
            currentOrganization: {},
            currentLayer: 0,

            folderView: true,
            navArr: [
              {
                name: 'User',
                viewDisplay: true,
                displayName: '组织成员',
                abbreviation: '成员',
                methods: 'OrganizationUsers',
                currentPage: 1,
                perPage: 10,
                totalRows: 0,
                isBusy: true,
                
                showChoose: false,

                BindingData: [],
                Geturl: '/api/services/app/Organization/GetOrganizationUnitUsers',
                Seturl: '/api/services/app/Organization/SetOrganizationUnitUsers',
                Deleteurl: '/api/services/app/Organization/RemoveUserFromOrganizationUnit',

                getAllurl: '/api/services/app/User/GetAll',
                filter: {
                  filter: '',
                  sorts: '',
                  perPage: 10,
                  currentPage: 1,
                  totalCount: 0,
                  isBusy: true
                },
                AllDataArr: []
              }, {
                name: 'Role',
                viewDisplay: false,
                displayName: '角色',
                abbreviation: '角色',
                methods: 'OrganizationRoles',
                currentPage: 1,
                perPage: 10,
                totalRows: 0,
                isBusy: true,

                showChoose: false,

                BindingData: [],
                Geturl: '/api/services/app/Organization/GetOrganizationUnitRoles',
                Seturl: '/api/services/app/Organization/SetOrganizationUnitRoles',
                Deleteurl: '/api/services/app/Organization/RemoveRoleFromOrganizationUnit',

                getAllurl: '/api/services/app/Role/GetAll',
                filter: {
                  filter: '',
                  sorts: '',
                  perPage: 10,
                  currentPage: 1,
                  totalCount: 0,
                  isBusy: true
                },
                AllDataArr: []
              }
            ],
            choiceAllData: [],

            navChoice: '',
            childrenItem: null,
            pageOptions: [5, 10, 20, 50, 100]

        }
    },
    props: ['contentTitle'],
    watch: {},
    components: {
        nestedDraggable,
        contextMenu
    },
    computed: {
        navChoiceDisplay() {
            const item = this.navArr.find(item => {
              return item.name === this.navChoice
            })
            return item ? item.abbreviation : '-'
        },
        navItem() {
            const item = this.navArr.find(item => {
              return item.name === this.navChoice
            })
            return item || {}
        }
    },
    methods: {
        // 当右键菜单打开时
        onCtxOpen(locals) {},
        // 打开右键
        ctxMenuOpen(e, item, index, currentLayer) {
            this.$refs.ctxMenu.open(e, item)
            this.currentLayer = currentLayer
            this.currentOrganization = item
        },
        onDrag(e) {
            this.dragging = e
        },
        add() {
            this.editMode = false
            this.module = { displayName: '', parentId: this.currentOrganization.id }
            this.modalName = ` 新增 [${this.currentOrganization.displayName}] 子节点：`
            this.$refs.modal.show()
        },
        edit() {
            this.editMode = true
            this.module = JSON.parse(JSON.stringify(this.currentOrganization))
            this.modalName = ` 编辑 [${this.currentOrganization.displayName}] 节点：`
            this.$refs.modal.show()
        },
        del() {
            swal({
                title: '确认吗?',
                text: '被删除数据可能无法恢复，请您再次确认!',
                icon: 'warning',
                buttons: ['取消', '确认'],
                dangerMode: true
            }).then(async willDelete => {
                if (willDelete) {
                    await this.$http
                        .delete('/api/services/app/Organization/Delete', {
                            params: { organizationId: this.currentOrganization.id }
                        })
                        .then(res => {
                            if (res.data.success) this.load()
                        })
                }
            })
        },
        modalOpen() {
            this.$refs.modalInput.focus()
        },
        // 关闭清空编辑
        clearName() {
            this.editMode = false
            this.module = {
                displayName: ''
            }
            this.modalName = ''
        },
        async handleOk(evt) {
            // Prevent modal from closing
            evt.preventDefault()
            this.$validator.validateAll().then(async result => {
                if (result) {
                    if (!this.editMode) {
                        await this.$http.post('/api/services/app/Organization/Create', this.module).then(res => {
                            if (res.data.success) this.load()
                        })
                    } else {
                        await this.$http.put('/api/services/app/Organization/Update', this.module).then(res => {
                            if (res.data.success) this.load()
                        })
                    }
                    this.$refs.modal.hide()
                }
            })
        },
        load() {
            this.$http.get('/api/services/app/Organization/GetAll', { params: { organizationId: null } }).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.organizationList = json
                }
            })
        },
        formatTime(val) {
            return tools.datetime(val)
        },
        // 点击组织结构
        choiceChildren(item) {
            this.childrenItem = item
            // this.loadOrganizationRoles()
            this['load' + this.navItem.methods]()
        },
        // 切换 成员/角色
        changeNavChoice(name) {
          this.navChoice = name
          if (this.childrenItem)
            this.$nextTick(() => {
              this['load' + this.navItem.methods]()
            })
        },

        // 查询绑定成员，展示
        async loadOrganizationUsers() {
          this.navItem.isBusy = true
          const params = {
                params: {
                    ouId: this.childrenItem.id
                }
            }
          await this.$http
              .get(this.navItem.Geturl, params)
              .then(res => {
                  if (res.data.success) {
                      this.navItem.BindingData = res.data.result
                      this.navItem.totalRows = this.navItem.BindingData.length
                      this.choiceAllData = []
                      for (let i = 0; i < this.navItem.BindingData.length; i++) {
                        this.choiceAllData.push(this.navItem.BindingData[i].id)
                      }
                  }
                  this.navItem.isBusy = false
              })
              .catch(() => {
                  this.navItem.isBusy = false
              })
        },
        // 获取成员展示
        async getAllDataUsers() {
            this.navItem.filter.isBusy = true
            let params = {
                params: {
                    Keyword: this.navItem.filter.filter,
                    SkipCount: (this.navItem.filter.currentPage - 1) * this.navItem.filter.perPage,
                    MaxResultCount: this.navItem.filter.perPage
                    // Sorting: this.navItem.filter.sorts
                }
            }
            await this.$http
                .get(this.navItem.getAllurl, params)
                .then(res => {
                    if (res.data.success) {
                        let json = res.data.result
                        this.navItem.AllDataArr = json.items
                        this.navItem.filter.totalCount = json.totalCount
                        this.navItem.filter.isBusy = false
                    }
                })
                .catch(() => {
                    this.navItem.filter.isBusy = false
                })
        },
        // 删除成员
        async deleteUser(id) {
          swal({
              title: '确认吗?',
              text: '被删除数据可能无法恢复，请您再次确认!',
              icon: 'warning',
              buttons: ['取消', '确认'],
              dangerMode: true
          }).then(async confirm => {
              if (confirm) {
                  this.$http.delete(this.navItem.Deleteurl, { params: { userId: id, ouId: this.childrenItem.id } }).then(res => {
                      if (res.data.success) {
                          this.loadOrganizationUsers()
                      }
                  })
              }
          })
        },
        // 展示成员弹出修改框
        async changeShowChooseUsers() {
          this.navItem.showChoose = true
          this.$nextTick(() => {
              let dhyContainerUsersMoveNodeRef = this.$refs.dhyContainerUsersMoveNodeRef
              document.body.appendChild(dhyContainerUsersMoveNodeRef)
          })
          await this.getAllDataUsers()
        },
        // 确认修改 角色
        confirmChangeUsers() {
          let choice = JSON.parse(JSON.stringify(this.choiceAllData))
          this.$http.post(this.navItem.Seturl + '?ouId=' + this.childrenItem.id, choice).then(res => {
              if (res.data.success) {
                  swal('操作成功!', '', 'success').then(() => {
                    this.cancelShowChooseRoles()
                    this.loadOrganizationUsers()
                  })
              }
          })
        },

        // 查询绑定角色，展示
        async loadOrganizationRoles() {
          this.navItem.isBusy = true
          const params = {
                params: {
                    ouId: this.childrenItem.id
                }
            }
          await this.$http
              .get(this.navItem.Geturl, params)
              .then(res => {
                  if (res.data.success) {
                      this.navItem.BindingData = res.data.result
                      this.navItem.totalRows = this.navItem.BindingData.length
                      this.choiceAllData = []
                      for (let i = 0; i < this.navItem.BindingData.length; i++) {
                        this.choiceAllData.push(this.navItem.BindingData[i].id)
                      }
                  }
                  this.navItem.isBusy = false
              })
              .catch(() => {
                  this.navItem.isBusy = false
              })
        },
        // 获取角色展示
        async getAllDataRoles() {
            this.navItem.filter.isBusy = true
            let params = {
                params: {
                    Keyword: this.navItem.filter.filter,
                    SkipCount: (this.navItem.filter.currentPage - 1) * this.navItem.filter.perPage,
                    MaxResultCount: this.navItem.filter.perPage,
                    Sorting: this.navItem.filter.sorts
                }
            }
            await this.$http
                .get(this.navItem.getAllurl, params)
                .then(res => {
                    if (res.data.success) {
                        let json = res.data.result
                        this.navItem.AllDataArr = json.items
                        this.navItem.filter.totalCount = json.totalCount
                        this.navItem.filter.isBusy = false
                    }
                })
                .catch(() => {
                    this.navItem.filter.isBusy = false
                })
        },
        // 删除角色
        async deleteRole(id) {
          swal({
              title: '确认吗?',
              text: '被删除数据可能无法恢复，请您再次确认!',
              icon: 'warning',
              buttons: ['取消', '确认'],
              dangerMode: true
          }).then(async confirm => {
              if (confirm) {
                  this.$http.delete(this.navItem.Deleteurl, { params: { roleId: id, organizationUnitId: this.childrenItem.id } }).then(res => {
                      if (res.data.success) {
                          this.loadOrganizationRoles()
                      }
                  })
              }
          })
        },
        // 展示角色弹出修改框
        async changeShowChooseRoles() {
          this.navItem.showChoose = true
          this.$nextTick(() => {
              let dhyContainerRolesMoveNodeRef = this.$refs.dhyContainerRolesMoveNodeRef
              document.body.appendChild(dhyContainerRolesMoveNodeRef)
          })
          await this.getAllDataRoles()
        },
        // 确认修改 角色
        confirmChangeRoles() {
          let choice = JSON.parse(JSON.stringify(this.choiceAllData))
          this.$http.post(this.navItem.Seturl + '?ouId=' + this.childrenItem.id, choice).then(res => {
              if (res.data.success) {
                  swal('操作成功!', '', 'success').then(() => {
                    this.cancelShowChooseRoles()
                    this.loadOrganizationRoles()
                  })
              }
          })
        },
        // 隐藏弹出修改框
        cancelShowChooseRoles() {
            this.navItem.showChoose = false
        },
        // 切换选中状态，提交数组
        changeChoiceAllDataRoles(id) {
            if (this.choiceAllData.includes(id)) {
                this.choiceAllData.splice(this.choiceAllData.indexOf(id), 1)
            } else {
                this.choiceAllData.push(id)
            }
        },
        // 判断选中状态
        choiceAllDataRolesAction(id) {
          let flag0 = false
          if (this.choiceAllData && this.choiceAllData.length) {
              flag0 = this.choiceAllData.includes(id)
          }
          return flag0
        }
    },
    created: function() {
        this.navChoice = this.navArr[0].name
        this.load()
    },
    mounted() {
        this.$nextTick(() => {
            let moveNodeRef = this.$refs.ctxMenuContainer
            document.body.appendChild(moveNodeRef)
        })
    }
}
</script> 
