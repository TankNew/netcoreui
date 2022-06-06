<template>
  <section class="container-fluid">
    <p class="lead">
      <i class="far fa-copy text-primary mr-1"></i>
      {{contentTitle}}
    </p>
    <div class="mr-3" v-show="!navItem.noShowNav">
      <b-alert show dismissible>
        <b>Info:</b> 将鼠标移动到节点上，即可编辑，删除，以及增加子节点。根节点不可删除，兄弟节点不可重名。
      </b-alert>
    </div>
    <section v-show="!navItem.noShowNav"
      class="tankTree"
      :class="'dhy-tankTree'"
      style="min-height: unset;padding-bottom: 15px;">
      <div class="dhy-container-card"
      style="width:100%;border:none;"
        >
        <div class="body"
        style="padding: 0 10px;">
          <ul class="nav">
            <li class="nav-item"
              v-for="(item,index) in navArr"
              :key="index">
              <div class="name"
                :class="navChoice === item.name ? 'name-action' : ''"
                @click.stop="changeNavChoice(item.name)">{{item.displayName}}</div>
            </li>
          </ul>
        </div>
      </div>
    </section>
    <!-- 第一个表格 -->
    <section v-if="navItem.name === navArr[0].name"
      v-show="!navItem.noShowNav">
      <div class="mb-3 ml-4">
          <button type="button" class="btn btn-primary btn-sm px-5"
            @click="addDynamicProperties()">
              <i class="fas fa-plus mr-1"></i>新增
          </button>
      </div>
      <div class="news-table">
          <section style="min-height: 300px;">
              <b-table-simple hover responsive bordered>
                  <colgroup>
                      <col style="width:60px;" />
                      <col />
                      <col style="width:120px;" />
                      <col style="width:200px;" />
                  </colgroup>
                  <b-thead head-variant="light">
                  <b-tr>
                      <b-th class="text-center">ID</b-th>
                      <b-th class="text-center">显示名</b-th>
                      <b-th class="text-center">属性名</b-th>
                      <b-th class="text-center">操作</b-th>
                  </b-tr>
                  </b-thead>
                  <b-tbody v-if="navItem.isBusy">
                      <b-tr>
                          <b-td colspan="4">
                              <div class="text-center text-info my-2">
                                  <b-spinner class="align-middle"></b-spinner>
                                  <strong>Loading...</strong>
                              </div>
                          </b-td>
                      </b-tr>
                  </b-tbody>

                  <b-tbody v-else>
                      <b-tr v-for="(item,index) in navItem.items" :key="index">
                          <b-td class="text-center">
                              <span class="news-number">{{parseInt(item.id)}}</span>
                          </b-td>
                          <b-td class="">{{item.displayName}}</b-td>
                          <b-td class="text-center">{{item.propertyName}}</b-td>
                          <b-td class="text-center">
                              <b-button
                                  size="sm"
                                  @click.stop="editDynamicProperties(item)"
                                  class="mr-1"
                                  variant="info"
                              >编辑</b-button>
                              <b-button
                                  v-if="item.inputType !== 'SINGLE_LINE_STRING'"
                                  size="sm"
                                  @click.stop="changeDynamicPropertiesValue(item)"
                                  class="mr-1"
                                  variant="success"
                              >属性值</b-button>
                              <b-button
                                  size="sm"
                                  @click.stop="deleteDynamicProperties(item)"
                                  variant="dark"
                              >删除</b-button>
                          </b-td>
                      </b-tr>
                  </b-tbody>
                  <b-tfoot>
                      <b-tr>
                          <b-td colspan="4" variant="light" class="text-left">
                              Total Rows:
                              <b>{{navItem.totalRows}}</b>
                          </b-td>
                      </b-tr>
                  </b-tfoot>
              </b-table-simple>
          </section>
      </div>
    </section>
    <!-- 编辑模式 -->
    <section v-if="navItem.name === navArr[0].name && navItem.noShowNav">
        <div class="alert alert-success" role="alert">
            <i class="far fa-bell mx-1"></i>
            您当前正处于{{editModeTitle}}模式
            <button
              type="button"
              class="btn btn-secondary btn-sm mx-1 float-right"
              @click="cancelEditMode()"
              >退出{{editModeTitle}}模式</button>
        </div>
        <b-form
            v-if="navItem.formShow"
            @submit.stop.prevent="onSubmit"
            @reset="onReset"
            autocomplete="off"
            data-vv-scope="form-update"
        >
            <b-form-group label="属性名:" label-for="p-propertyName">
                <b-form-input
                    ref="focusThis"
                    id="p-propertyName"
                    type="text"
                    v-model="navItem.form.propertyName"
                    name="属性名"
                    placeholder="属性名"
                    :state="!errors.has('form-update.属性名')"
                    v-validate="'required'"
                ></b-form-input>
            </b-form-group>
            <b-form-group label="显示名称:" label-for="p-displayName">
                <b-form-input
                    ref="focusThis"
                    id="p-displayName"
                    type="text"
                    v-model="navItem.form.displayName"
                    name="显示名称"
                    placeholder="显示名称"
                    :state="!errors.has('form-update.显示名称')"
                    v-validate="'required'"
                ></b-form-input>
            </b-form-group>
            <b-form-group label="数据类型:" label-for="mark">
                <b-form-select id="mark"
                    v-model="navItem.form.inputType"
                    :options="navItem.inputTypeNames"
                >
                    <!-- <option slot="first" :value="''">无</option> -->
                </b-form-select>
            </b-form-group>
            
            <b-input-group size="sm" prepend="权限" class="mb-3">
                <div class="form-control" size="sm" style="height: auto;">{{viewPermission(navItem.form.permission)}}</div>
                <b-input-group-append>
                    <b-btn size="sm" variant="primary" @click.stop="changeShowPermissions()"> 修改 </b-btn>
                </b-input-group-append>
            </b-input-group>
            <hr />
            <b-button type="submit" variant="primary">确认</b-button>
            <b-button type="reset" variant="light">重置</b-button>
        </b-form>
    </section>
    <!-- 弹窗选择权限 -->
    <section v-if="navItem.name === navArr[0].name && navItem.showPermissions"
        class="dhy-container"
        ref="dhyContainerPermissionsMoveNodeRef"
        @scroll.stop
        @wheel.stop>
        <div class="permissions-container">
            <div class="head">
                <span class="title">修改权限</span>
                <i class="fa-times fas"
                    @click.stop="cancelShowPermissions()"></i>
            </div>
            <ul class="scrollbar">
                <li v-for="(item,index) in navItem.Permissions"
                    :key="index"
                    @click.stop="choosePermission(item.name)">
                    <div class="permissions-item">
                        <span class="select"
                            :class="permissionStr === item.name ? 'select-action' : ''"></span>
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
    <!-- 弹窗选择权限 -->
    <section v-if="navItem.name === navArr[0].name && navItem.showValue"
        class="dhy-container"
        ref="dhyContainerValuePermissionsMoveNodeRef"
        @scroll.stop
        @wheel.stop>
        <div class="permissions-container">
            <div class="head">
                <span class="title">修改 {{navItem.valueItem.displayName}} 的属性值</span>
                <i class="fa-times fas"
                    @click.stop="cancelDynamicPropertiesValue()"></i>
            </div>
            <div class="head"
              style="border-top: 1px solid #eff2f5;padding: 12px 25px 4px;">
                <span class="title"></span>
                <b-input-group size="sm"
                  style="height:40px;border-top: 1px solid #eff2f5;">
                    <b-form-input
                      ref="inputValue"
                      v-model="navItem.value.value"
                      placeholder="属性值"
                      @keyup.enter.prevent="addValueDynamicPropertiesValue()"
                      style="height:100%;"
                      />
                    <b-input-group-append>
                      <b-btn @click="addValueDynamicPropertiesValue()"
                          variant="success"
                          style="padding-left: 13px;padding-right: 13px;">保存</b-btn>
                    </b-input-group-append>
                </b-input-group>
            </div>
            <ul class="scrollbar"
                style="height: calc(100% - 192px);border-top: none;">
                <li>
                  <div class="permissions-item"
                        style="justify-content: space-between;">
                        <span class="displayName"
                          style="font-weight: bold;">属性值</span>
                        <div></div>
                    </div>
                </li>
                <li v-for="(item,index) in navItem.valueList"
                    :key="index">
                    <div class="permissions-item"
                        style="justify-content: space-between;">
                        <span class="displayName">{{item.value}}</span>
                        <div>
                            <b-button
                                size="sm"
                                @click.stop="changeValueDynamicPropertiesValue(item)"
                                class="mr-1"
                                variant="info"
                            >修改</b-button>
                            <b-button
                                size="sm"
                                @click.stop="deleteValueDynamicPropertiesValue(item)"
                                variant="dark"
                            >删除</b-button>
                        </div>
                    </div>
                </li>
                <li class="loading"
                  v-show="navItem.valueIsBusy">
                  <div class="text-center text-info my-2">
                      <b-spinner class="align-middle"></b-spinner>
                      <strong>Loading...</strong>
                  </div>
                </li>
            </ul>
            <div class="foot">
                <b-button variant="primary"
                    @click.stop="addDynamicPropertiesValue()">新增</b-button>
                <b-button variant="light"
                    @click.stop="cancelDynamicPropertiesValue()">取消</b-button>
            </div>
        </div>
    </section>

    <!-- 第二个表格 -->
    <section v-if="navItem.name === navArr[1].name">
      <!-- <div class="mb-3 ml-4">
          <button type="button" class="btn btn-primary btn-sm px-5">
              <i class="fas fa-plus mr-1"></i>新增
          </button>
      </div> -->
      <div class="news-table">
          <section style="min-height: 300px;">
              <b-table-simple hover responsive bordered>
                  <colgroup>
                      <col />
                      <col style="width:160px;" />
                  </colgroup>
                  <b-thead head-variant="light">
                  <b-tr>
                      <b-th class="text-center">Entity Full Name</b-th>
                      <b-th class="text-center">操作</b-th>
                  </b-tr>
                  </b-thead>
                  <b-tbody v-if="navItem.isBusy">
                      <b-tr>
                          <b-td colspan="2">
                              <div class="text-center text-info my-2">
                                  <b-spinner class="align-middle"></b-spinner>
                                  <strong>Loading...</strong>
                              </div>
                          </b-td>
                      </b-tr>
                  </b-tbody>
                  <b-tbody v-else>
                      <b-tr v-for="(item,index) in navItem.items" :key="index">
                          <b-td class="text-center">{{item}}</b-td>
                          <b-td class="text-center">
                            <b-button
                                size="sm"
                                @click.stop="getDynamicEntityPropertiesAll(item)"
                                class="mr-1"
                                variant="info"
                            >详情</b-button>
                          </b-td>
                      </b-tr>
                  </b-tbody>
                  <b-tfoot>
                      <b-tr>
                          <b-td colspan="2" variant="light" class="text-left">
                              Total Rows:
                              <b>{{navItem.totalRows}}</b>
                          </b-td>
                      </b-tr>
                  </b-tfoot>
              </b-table-simple>
          </section>
      </div>
    </section>
    <!-- 第二个表格-弹窗 -->
    <section v-if="navItem.name === navArr[1].name && navItem.showDetails"
        class="dhy-container"
        ref="dhyContainerMoveAddDynamicEntityPropertiesNodeRef"
        @scroll.stop
        @wheel.stop>
        <div class="permissions-container">
            <div class="head">
                <span class="title">修改动态实体属性</span>
                <i class="fa-times fas"
                    @click.stop="cancelDynamicEntityPropertiesAll()"></i>
            </div>
            <div class="head"
              style="border-top: 1px solid #eff2f5;padding: 12px 25px 12px;">
                <span class="title"></span>
                <b-button variant="primary"
                  style="display: flex;"
                  @click.stop="showDynamicEntityProperties()">
                  <i class="fas fa-plus mr-1"
                    style="background: transparent;color: white;"></i>新增动态属性
                </b-button>
            </div>
            <ul class="scrollbar" style="height: calc(100% - 200px);">
                <li v-for="(item,index) in navItem.detailsList"
                    :key="index">
                    <div class="permissions-item"
                      style="justify-content: space-between;">
                        <span class="displayName">{{item.dynamicProperty.displayName}}</span>
                        <b-button
                            size="sm"
                            @click.stop="deleteDynamicEntityPropertiesAll(item.id)"
                            variant="dark"
                        >删除</b-button>
                    </div>
                </li>
                <li class="loading"
                  v-show="navItem.addIsBusy">
                  <div class="text-center text-info my-2">
                      <b-spinner class="align-middle"></b-spinner>
                      <strong>Loading...</strong>
                  </div>
                </li>
            </ul>
            <div class="foot">
                <b-button variant="light"
                    @click.stop="cancelDynamicEntityPropertiesAll()">关闭</b-button>
            </div>
        </div>
    </section>
    <!-- 第二个表格-弹窗添加属性 -->
    <section v-if="navItem.name === navArr[1].name && navItem.showDynamicProperty"
        class="dhy-container"
        ref="dhyContainerMoveAddDynamicPropertyNodeRef"
        @scroll.stop
        @wheel.stop>
        <div class="permissions-container"
          style="height: auto;width: auto;min-width: 300px;">
            <div class="head">
                <span class="title">选择属性添加</span>
                <i class="fa-times fas"
                    @click.stop="cancelDynamicEntityProperties()"></i>
            </div>
            <ul class="scrollbar" style="height: calc(100% - 210px);">
                <li style="background: #fff;">
                  <b-form-group label="数据类型:" label-for="mark">
                      <b-form-select id="mark"
                          v-model="navItem.itemDynamicProperty"
                          :options="navItem.DynamicPropertyList"
                          value-field="id"
                          text-field="displayName"
                      >
                          <option slot="first" :value="''">请选择</option>
                      </b-form-select>
                  </b-form-group>
                </li>
                <li class="loading"
                  v-show="navItem.DynamicPropertyIsBusy">
                  <div class="text-center text-info my-2">
                      <b-spinner class="align-middle"></b-spinner>
                      <strong>Loading...</strong>
                  </div>
                </li>
            </ul>
            <div class="foot">
                <b-button variant="primary"
                    @click.stop="confirmDynamicEntityProperties()">确认</b-button>
                <b-button variant="light"
                    @click.stop="cancelDynamicEntityProperties()">关闭</b-button>
            </div>
        </div>
    </section>
  </section>
</template>
<script>
import tools from '../utiltools/tools'
import swal from 'sweetalert'
const baseDynamicPropertiesFrom = {
  propertyName: '',
  displayName: '',
  inputType: '',
  permission: ''
}
const baseDynamicPropertiesValueFrom = {
  value: '',
  dynamicPropertyId: 0
}
export default {
    data() {
        return {
            navChoice: '',
            navArr: [
              {
                name: 'DynamicProperties',
                displayName: '动态属性', 
                abbreviation: 'Dynamic Properties',
                noShowNav: false,
                methods: 'DynamicProperties',
                getAllUrl: '/api/services/app/DynamicProperty/GetAll',
                isBusy: true,
                items: [],
                totalRows: 0,
                // 编辑
                getAllAllowedInputTypeNames: '/api/services/app/DynamicProperty/GetAllAllowedInputTypeNames',
                inputTypeNames: [],
                addUrl: '/api/services/app/DynamicProperty/Add',
                updateUrl: '/api/services/app/DynamicProperty/Update',
                deleteUrl: '/api/services/app/DynamicProperty/Delete',
                addIsBusy: true,
                isUpdate: false,
                form: {},
                formShow: true,
                // 修改权限
                getAllPermissionsUrl: '/api/services/app/Role/GetAllPermissions',
                showPermissions: false,
                Permissions: [],
                // 编辑
                showValue: false,
                valueIsBusy: true,
                getAllValuesOfDynamicProperty: '/api/services/app/DynamicValue/GetAllValuesOfDynamicProperty',
                addValuesOfDynamicProperty: '/api/services/app/DynamicValue/Add',
                updateValuesOfDynamicProperty: '/api/services/app/DynamicValue/Update',
                deleteValuesOfDynamicProperty: '/api/services/app/DynamicValue/Delete',
                valueList: [],
                valueItem: null,
                valueIsUpdate: false,
                value: {
                  value: '',
                  dynamicPropertyId: 0
                }

              }, {
                name: 'DynamicEntityProperties',
                displayName: '动态实体',
                abbreviation: 'Dynamic Entity Properties',
                methods: 'DynamicEntityProperties',
                isBusy: true,
                items: [],
                totalRows: 0,

                getAllUrl: '/api/services/app/DynamicEntityProperty/GetAll',
                deleteUrl: '/api/services/app/DynamicEntityProperty/Delete',
                showDetails: false,
                addIsBusy: true,
                detailsList: [],
                entityFullName: '',

                showDynamicProperty: false,
                getAllDynamicPropertyUrl: '/api/services/app/DynamicProperty/GetAll',
                addUrl: '/api/services/app/DynamicEntityProperty/Add',
                DynamicPropertyList: [],
                itemDynamicProperty: '',
                DynamicPropertyIsBusy: true
              }
            ],
            permissionStr: '',
            editRow: null
        }
    },
    props: ['contentTitle'],
    watch: {},
    computed: {
        navItem() {
            const item = this.navArr.find(item => {
              return item.name === this.navChoice
            })
            return item || {}
        },
        editModeTitle() {
          return this.navItem.isUpdate ? '编辑' : '新增'
        }
    },
    methods: {
        async validate(scope) {
            let res
            await this.$validator.validateAll(scope).then(async result => {
                res = result
            })
            return res
        },
        moveNodeRef(name) {
          this.$nextTick(() => {
              let dhyContainerMoveNodeRef = this.$refs[name]
              document.body.appendChild(dhyContainerMoveNodeRef)
          })
        },
        removeNodeRef(name) {
          this.$nextTick(() => {
              let dhyContainerMoveNodeRef = this.$refs[name]
              document.body.removeChild(dhyContainerMoveNodeRef)
          })
        },
        changeNavChoice(name) {
          this.navChoice = name
          this.load()
        },
        // 初始化input类型名称
        loadInputTypeNames() {
          this.$http
            .get(this.navItem.getAllAllowedInputTypeNames)
            .then(res => {
                if (res.data.success) {
                    this.navItem.inputTypeNames = res.data.result
                }
            })
            .catch(() => {})
        },
        load() {
          this['load' + this.navItem.methods]()
        },
        // 动态特性-初始化
        loadDynamicProperties() {
          this.navItem.isBusy = true
          this.$http
            .get(this.navItem.getAllUrl)
            .then(res => {
                if (res.data.success) {
                    this.navItem.items = res.data.result
                    this.navItem.totalRows = this.navItem.items.length
                }
                this.navItem.isBusy = false
            })
            .catch(() => {
                this.navItem.isBusy = false
            })
          this.$http
              .get(this.navItem.getAllPermissionsUrl)
              .then(res => {
                  if (res.data.success) {
                      this.navItem.Permissions = res.data.result.items
                  }
              })
              .catch(() => {})
          this.loadInputTypeNames()
        },
        addDynamicProperties() {
            this.navItem.noShowNav = true
            this.navItem.isUpdate = false
            this.editRow = JSON.parse(JSON.stringify(baseDynamicPropertiesFrom))
            this.navItem.form = JSON.parse(JSON.stringify(this.editRow))
        },
        editDynamicProperties(item) {
            this.navItem.noShowNav = true
            this.navItem.isUpdate = true
            this.editRow = JSON.parse(JSON.stringify(item))
            this.navItem.form = JSON.parse(JSON.stringify(this.editRow))
        },
        deleteDynamicProperties(item) {
            swal({
                title: '确认吗?',
                text: '被删除数据可能无法恢复，请您再次确认!',
                icon: 'warning',
                buttons: ['取消', '确认'],
                dangerMode: true
            }).then(async confirm => {
                if (confirm) {
                    this.$http.delete(this.navItem.deleteUrl, { params: { id: item.id } }).then(res => {
                        if (res.data.success) {
                            this.load()
                        }
                    })
                }
            })
        },
        cancelEditMode() {
          this.navItem.noShowNav = false
          this.navItem.isUpdate = false
          this.navItem.form = {}
          this.editRow = null
        },
        // 属性值
        changeDynamicPropertiesValue(item) {
          this.navItem.showValue = true
          this.navItem.valueItem = JSON.parse(JSON.stringify(item))
          this.moveNodeRef('dhyContainerValuePermissionsMoveNodeRef')
          this.addDynamicPropertiesValue()
          this.navItem.valueIsBusy = true
          let params = {
            params: {
              dynamicPropertyId: item.id
            }
          }
          this.$http
            .get(this.navItem.getAllValuesOfDynamicProperty, params)
            .then(res => {
              if (res.data.success) {
                this.navItem.valueList = res.data.result
                this.navItem.valueIsBusy = false
              }
            })
            .catch(() => {
              this.navItem.valueIsBusy = false
            })
        },
        addDynamicPropertiesValue() {
          this.navItem.valueIsUpdate = false
          this.navItem.value = JSON.parse(JSON.stringify(baseDynamicPropertiesValueFrom))
          this.navItem.value.dynamicPropertyId = this.navItem.valueItem.id
          this.$nextTick(() => {
              this.$refs.inputValue.focus()
          })
        },
        changeValueDynamicPropertiesValue(item) {
          this.navItem.valueIsUpdate = true
          this.navItem.value = JSON.parse(JSON.stringify(item))
          // this.navItem.value.dynamicPropertyId = this.navItem.valueItem.id
          this.$nextTick(() => {
              this.$refs.inputValue.focus()
          })
        },
        deleteValueDynamicPropertiesValue(item) {
            swal({
                title: '确认吗?',
                text: '被删除数据可能无法恢复，请您再次确认!',
                icon: 'warning',
                buttons: ['取消', '确认'],
                dangerMode: true
            }).then(async confirm => {
                if (confirm) {
                    this.$http.delete(this.navItem.deleteValuesOfDynamicProperty, { params: { id: item.id } }).then(res => {
                        if (res.data.success) {
                            this.changeDynamicPropertiesValue(this.navItem.valueItem)
                        }
                    })
                }
            })
        },
        addValueDynamicPropertiesValue() {
            if (this.navItem.value.value !== '') {
                let data = JSON.parse(JSON.stringify(this.navItem.value))
                if (!this.navItem.valueIsUpdate) {
                    this.$http.post(this.navItem.addValuesOfDynamicProperty, data).then(res => {
                        if (res.data.success) {
                          this.changeDynamicPropertiesValue(this.navItem.valueItem)
                        }
                    })
                } else {
                    this.$http.put(this.navItem.updateValuesOfDynamicProperty, data).then(res => {
                        if (res.data.success) {
                            this.changeDynamicPropertiesValue(this.navItem.valueItem)
                        }
                    })
                }
                swal('操作成功!', '', 'success').then(() => this.cancelEditMode())
            } else {
                swal({
                    title: '不能为空!',
                    icon: 'warning'
                })
            }
        },
        cancelDynamicPropertiesValue() {
          this.navItem.showValue = false
          this.navItem.valueItem = null
          this.navItem.valueList = []
        },
        // 展示权限弹窗
        changeShowPermissions() {
            this.navItem.showPermissions = !this.navItem.showPermissions
            if (this.navItem.showPermissions) {
                this.permissionStr = this.navItem.form.permission
                this.moveNodeRef('dhyContainerPermissionsMoveNodeRef')
            } else {
                this.navItem.form.permission = this.permissionStr
                this.permissionStr = ''
            }
        },
        // 取消权限弹窗
        cancelShowPermissions() {
            this.navItem.showPermissions = false
            this.permissionStr = ''
        },
        // 选择权限
        choosePermission(name) {
          if (this.permissionStr === name) {
            this.permissionStr = ''
          } else {
            this.permissionStr = name
          }
        },
        // 显示权限
        viewPermission(name) {
          for (let i = 0; i < this.navItem.Permissions.length; i++) {
            if (this.navItem.Permissions[i].name === name) {
              return this.navItem.Permissions[i].displayName
            }
          }
          return ''
        },
        //重置
        onReset(evt) {
            evt.preventDefault()
            this.navItem.form = JSON.parse(JSON.stringify(this.editRow))
            this.navItem.formShow = false
            this.$nextTick(() => {
                this.navItem.formShow = true
            })
        },
        async onSubmit(evt) {
            evt.preventDefault()
            if (await this.validate('form-update')) {
                let data = JSON.parse(JSON.stringify(this.navItem.form))
                if (data.inputType === '') {
                  swal({
                      title: '请选择数据类型!',
                      icon: 'warning'
                  })
                  return
                }
                if (!this.navItem.isUpdate) {
                    await this.$http.post(this.navItem.addUrl, data).then(res => {
                        if (res.data.success) {
                            let json = res.data.result
                            this.load()
                        }
                    })
                } else {
                    await this.$http.put(this.navItem.updateUrl, data).then(res => {
                        if (res.data.success) {
                            this.load()
                        }
                    })
                }
                swal('操作成功!', '', 'success').then(() => this.cancelEditMode())
            } else {
                swal({
                    title: '请填写必要的选项!',
                    icon: 'warning'
                })
            }
        },

        // 动态实体属性-初始化
        loadDynamicEntityProperties() {
          this.navItem.isBusy = true
          this.navItem.items = []
          this.navItem.totalRows = 0
          if (window.abp.custom && window.abp.custom.user_full_name) {
            this.navItem.items.push(window.abp.custom.user_full_name)
            this.navItem.totalRows++
          }
          this.navItem.isBusy = false
        },
        // 动态实体属性-弹窗
        getDynamicEntityPropertiesAll(entityFullName) {
          this.navItem.showDetails = true
          this.navItem.entityFullName = entityFullName
          this.moveNodeRef('dhyContainerMoveAddDynamicEntityPropertiesNodeRef')
          this.navItem.addIsBusy = true
          let params = {
            params: {
              entityFullName: entityFullName
            }
          }
          this.$http
            .get(this.navItem.getAllUrl, params)
            .then(res => {
              if (res.data.success) {
                this.navItem.detailsList = res.data.result
                this.navItem.addIsBusy = false
              }
            })
            .catch(() => {
              this.navItem.addIsBusy = false
            })
        },
        deleteDynamicEntityPropertiesAll(id) {
            swal({
                title: '确认吗?',
                text: '被删除数据可能无法恢复，请您再次确认!',
                icon: 'warning',
                buttons: ['取消', '确认'],
                dangerMode: true
            }).then(async confirm => {
                if (confirm) {
                    this.$http.delete(this.navItem.deleteUrl, { params: { id: id } }).then(res => {
                        if (res.data.success) {
                            this.getDynamicEntityPropertiesAll(this.navItem.entityFullName)
                        }
                    })
                }
            })
        },
        cancelDynamicEntityPropertiesAll() {
          this.navItem.showDetails = false
          this.navItem.detailsList = []
          this.navItem.entityFullName = ''
        },
        showDynamicEntityProperties() {
          this.navItem.showDynamicProperty = true
          this.moveNodeRef('dhyContainerMoveAddDynamicPropertyNodeRef')
          this.navItem.DynamicPropertyIsBusy = true
          this.$http
            .get(this.navItem.getAllDynamicPropertyUrl)
            .then(res => {
                if (res.data.success) {
                  this.navItem.DynamicPropertyList = []
                    for (let i = 0; i < res.data.result.length; i++) {
                      if (this.navItem.detailsList.findIndex(item => 
                        item.dynamicPropertyId === res.data.result[i].id) === -1) {
                        this.navItem.DynamicPropertyList.push(res.data.result[i])
                      }
                    }
                }
                this.navItem.DynamicPropertyIsBusy = false
            })
            .catch(() => {
                this.navItem.DynamicPropertyIsBusy = false
            })
        },
        confirmDynamicEntityProperties() {
          if (this.navItem.itemDynamicProperty === '') {
            swal({
                title: '请选择属性!',
                icon: 'warning'
            })
          } else {
            if (this.navItem.detailsList.findIndex(item => item.dynamicPropertyId === this.navItem.itemDynamicProperty) !== -1) {
              swal({
                  title: '已添加!',
                  icon: 'success'
              })
              this.cancelDynamicEntityProperties()
              return
            }
            let data = {
              entityFullName: this.navItem.entityFullName,
              dynamicPropertyId: this.navItem.itemDynamicProperty
            }
            this.$http.post(this.navItem.addUrl, data).then(res => {
                if (res.data.success) {
                    this.cancelDynamicEntityProperties()
                    this.getDynamicEntityPropertiesAll(this.navItem.entityFullName)
                }
            })
          }
        },
        cancelDynamicEntityProperties() {
          this.navItem.showDynamicProperty = false
          this.navItem.itemDynamicProperty = ''
        }

    },
    created: function() {
        this.changeNavChoice(this.navArr[0].name)
    },
    mounted() {
        // this.$nextTick(() => {
        //     let moveNodeRef = this.$refs.ctxMenuContainer
        //     document.body.appendChild(moveNodeRef)
        // })
    }
}
</script> 
