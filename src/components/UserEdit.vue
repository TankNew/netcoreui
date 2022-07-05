<template>
  <b-modal
    ref="blockModal"
    no-enforce-focus
    scrollable
    size="lg"
    :ok-disabled="isProperyMode"
    :ok-title="'确认'"
    :cancel-title="'取消'"
    :title="editModeTitle"
    @ok="blockModalOk"
    @cancel="blockModalCancel"
    @hidden="outEditMode"
  >
    <template v-slot:modal-header="{ close }">
      <!-- Emulate built in modal header close button action -->
      <h6>{{ editModeTitle }}：{{ form.userName }}</h6>
    </template>
    <file
      :fileShow="fileShow"
      :fileCallBack="fileCallBack"
      @fileClose="fileClose"
    ></file>

    <b-form
      @submit.stop.prevent="blockSubmit"
      autocomplete="off"
      role="presentation"
      data-vv-scope="form-modal"
    >
      <b-tabs content-class="m-3">
        <b-tab title="基础属性" active>
          <div class="user-basic">
            <div class="user-head">
              <img :src="form.headImage" />
              <b-button
                size="sm"
                variant="light"
                @click="fileOpen(form, 'headImage')"
                >更换头像</b-button
              >
            </div>
            <div class="user-name">
              <b-form-group label="姓氏*" label-size="sm" label-for="input-2">
                <b-form-input
                  id="input-2"
                  size="sm"
                  name="姓氏"
                  placeholder="姓氏"
                  v-model="form.surname"
                  v-validate="'required'"
                  :state="!errors.has('form-modal.姓氏')"
                  trim
                ></b-form-input>
              </b-form-group>

              <b-form-group label="名字*" label-size="sm" label-for="input-3">
                <b-form-input
                  size="sm"
                  id="input-3"
                  name="名字"
                  placeholder="名字"
                  v-model="form.name"
                  v-validate="'required'"
                  :state="!errors.has('form-modal.名字')"
                  trim
                ></b-form-input>
              </b-form-group>
            </div>
          </div>
          <b-form-group label="邮箱*" label-size="sm">
            <b-form-input
              size="sm"
              name="邮箱"
              placeholder="邮箱"
              v-model="form.emailAddress"
              v-validate="'required'"
              :state="!errors.has('form-modal.邮箱')"
              trim
            ></b-form-input>
          </b-form-group>
          <b-form-group label="手机" label-size="sm">
            <b-form-input
              name="手机"
              placeholder="手机"
              size="sm"
              v-model="form.phoneNumber"
              trim
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="用户名*"
            label-size="sm"
            :description="
              form.roleNames.includes(`ADMIN`)
                ? '管理用户，不能修改用户名.'
                : ''
            "
          >
            <b-form-input
              size="sm"
              name="initname"
              autocomplete="off"
              v-model="form.userName"
              v-validate="'required'"
              :state="!errors.has('form-modal.initname')"
              :disabled="form.roleNames.includes(`ADMIN`)"
              trim
            ></b-form-input>
          </b-form-group>

          <b-form-group label="密码:" label-size="sm" label-class="">
            <b-form-input
              size="sm"
              ref="initword"
              name="initword"
              autocomplete="off"
              type="password"
              v-model="form.password"
              v-validate="{
                required: !isUpdate,
                min: 6,
                max: 35
              }"
              :state="!errors.has('form-modal.initword')"
            ></b-form-input>
          </b-form-group>
          <b-form-group label="密码（核对）" label-size="sm">
            <b-form-input
              size="sm"
              name="密码（核对）"
              type="password"
              v-model="form.confirmPassword"
              v-validate="{
                required: !isUpdate,
                confirmed: `initword`
              }"
              :state="!errors.has('form-modal.密码（核对）')"
              placeholder="密码（核对）"
            ></b-form-input>
          </b-form-group>
          <b-form-checkbox v-model="form.isActive" name="check-button"
            >激活</b-form-checkbox
          >
          <b-form-checkbox v-model="form.isLockoutEnabled" name="check-button"
            >是否启用锁定？</b-form-checkbox
          >
        </b-tab>

        <b-tab title="扩展属性">
          <div v-show="!isProperyMode">
            <b-form-group
              class="user-property"
              v-for="item in form.properties"
              :key="item.dynamicEntityPropertyId"
              :label="item.displayName + ':'"
              label-size="sm"
            >
              <div class="p-value">
                <b-form-input
                  v-if="item.inputType === `SINGLE_LINE_STRING`"
                  size="sm"
                  v-model="item.values"
                  :placeholder="item.displayName"
                ></b-form-input>
                <b-form-checkbox-group
                  v-if="item.inputType === `CHECKBOX`"
                  size="sm"
                  v-model="item.values"
                  :options="item.allValuesInputTypeHas"
                  stacked
                ></b-form-checkbox-group>

                <b-form-select
                  v-if="item.inputType === `COMBOBOX`"
                  v-model="item.values"
                  :options="item.allValuesInputTypeHas"
                  size="sm"
                ></b-form-select>
              </div>
              <b-dropdown variant="primary">
                <template #button-content>
                  <span><i class="fas fa-cog mr-1"></i>操作</span>
                </template>
                <b-dropdown-item small @click="_editProperty(item)"
                  >编辑</b-dropdown-item
                >
                <b-dropdown-item @click="_deleteProperty(item)"
                  >删除</b-dropdown-item
                >
              </b-dropdown>
            </b-form-group>
            <hr />
            <b-button
              v-if="!isProperyMode"
              size="sm"
              variant="secondary"
              @click="_newProperty"
              ><span><i class="fas fa-plus mr-1"></i></span>增加属性</b-button
            >
          </div>
          <UserProperty
            ref="userProperty"
            @closePropertyMode="_closePropertyMode"
            @reloadUser="_reloadUser"
          ></UserProperty>
        </b-tab>

        <b-tab title="详细介绍">
          <tinymce ref="tinymceNews" :initial="form.introduction"></tinymce>
        </b-tab>

        <b-tab title="角色">
          <b-form-group v-slot="{ ariaDescribedby }">
            <b-form-checkbox-group
              id="checkbox-group-1"
              size="sm"
              v-model="form.roleNames"
              :options="options"
              :aria-describedby="ariaDescribedby"
              name="flavour-1"
              disabled-field="notEnabled"
              stacked
            ></b-form-checkbox-group>
          </b-form-group>
        </b-tab>
      </b-tabs>
    </b-form>
  </b-modal>
</template>
<script>
import swal from 'sweetalert'
import { mapActions } from 'vuex'
import file from '@/components/custom/tankFiler'
import tinymce from '@/components/custom/tinymce'
import UserProperty from './UserProperty'
const baseFrom = {
  id: 0,
  userName: '',
  headImage: `/static/imgs/ednet.jpg`,
  introduction: '',
  isActive: true,
  isLockoutEnabled: true,
  password: null,
  confirmPassword: null,
  roleNames: [],
  properties: []
}
export default {
  components: {
    UserProperty,
    tinymce,
    file
  },
  data() {
    return {
      isProperyMode: false,
      isUpdate: false, // 是否更新
      editRow: {},
      form: JSON.parse(JSON.stringify(baseFrom)),
      roles: [],
      fileShow: false,
      fileCallBack: function (x) {}
    }
  },
  computed: {
    editModeTitle() {
      return this.isUpdate ? '编辑用户' : '新增'
    },
    options() {
      return this.roles.map(x => {
        return {
          text: x.name,
          value: x.name.toUpperCase(),
          notEnabled:
            this.form.userName.toUpperCase() === `ADMIN` &&
            x.name.toUpperCase() === `ADMIN`
        }
      })
    }
  },
  methods: {
    ...mapActions([
      'getUserAsync',
      'createUserAsync',
      'updateUserAsync',
      'getRolesAsync',

      'getAllPropertyAsync',
      `deletePropertyAsync`
    ]),
    fileOpen(target, propertyName) {
      this.fileShow = true
      this.fileCallBack = fileUrl => {
        target[propertyName] = fileUrl
      }
    },
    fileClose() {
      this.fileShow = false
    },
    // 编辑模式
    outEditMode() {
      this.isUpdate = false
      this.editRow = {}
      this.form = JSON.parse(JSON.stringify(baseFrom))
    },
    async blockModalOpen(item = null, isUpdate) {
      var data = await this.getRolesAsync()
      if (data.success) {
        if (data.result.items) {
          this.roles = data.result.items
        }
      }
      this.editRow = item
      this.isUpdate = isUpdate
      await this._reloadUser()
      this.$refs.blockModal.show()
      this.$nextTick(() => {
        // modal 必须添加 no-enforce-focus
        this.$refs.tinymceNews.init(false)
        this.$refs.tinymceNews.setVal(this.form.introduction)
      })
    },

    // 重新加载当前用户数据
    async _reloadUser() {
      // 如果当前处于编辑状态
      if (this.isUpdate) {
        var userData = await this.getUserAsync({
          params: { id: this.editRow.id }
        })
        if (userData.success) {
          this.editRow = userData.result
          this.form = JSON.parse(JSON.stringify(userData.result))
          this.form.password = null
          this.form.confirmPassword = null
        } else {
          swal('发生错误!', data.error, 'error')
        }
      }
      // 如果当前处于新增用户状态
      else {
        var desData = await this.getAllPropertyAsync()
        if (desData.success) {
          this.editRow = {}
          this.form = JSON.parse(JSON.stringify(baseFrom))
          this.form.properties = desData.result
        } else {
          swal('发生错误!', data.error, 'error')
        }
      }
      //   把单行字符串的值数组转换成string
      this.form.properties = this.form.properties.map(x => {
        if (x.inputType === `SINGLE_LINE_STRING`) x.values = x.values.toString()
        return x
      })
    },
    blockModalOk(e) {
      e.preventDefault()
      this.blockSubmit()
    },
    blockModalCancel(e) {
      this.$refs.tinymceNews.destroy()
    },
    async blockSubmit() {
      this.form.introduction = this.$refs.tinymceNews.getVal()
      if (await this.validate('form-modal')) {
        if (this.form.password !== this.form.confirmPassword)
          swal({
            title: '请核对密码!',
            icon: 'warning'
          })
        else {
          this.editRow = JSON.parse(JSON.stringify(this.form))
          this.editRow.properties = this.editRow.properties.map(x => {
            if (x.inputType === `SINGLE_LINE_STRING`)
              x.values = x.values.replace(/，/gi, ',').split(',')
            return x
          })
          let data
          if (!this.isUpdate) {
            data = await this.createUserAsync(this.editRow)
          } else {
            data = await this.updateUserAsync(this.editRow)
          }
          if (data.success) {
            // 操作完成，让父级重新加载数据
            this.$emit(`load`)
            console.log(`更新成功`)
            swal('操作成功!', '', 'success').then(() => {
              this.$refs.tinymceNews.destroy()
              this.$refs.blockModal.hide()
            })
          } else {
            swal('发生错误!', data.error, 'error')
          }
        }
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

    _newProperty() {
      this.isProperyMode = true
      this.$refs.userProperty.newProperty()
    },
    _editProperty(item) {
      this.isProperyMode = true
      this.$refs.userProperty.editProperty(item)
    },
    _deleteProperty(item) {
      swal({
        title: '确认吗?',
        text: '被删除数据可能无法恢复，请您再次确认!',
        icon: 'warning',
        buttons: ['取消', '确认'],
        dangerMode: true
      }).then(async confirm => {
        if (confirm) {
          await this.deletePropertyAsync({
            params: {
              dynamicEntityPropertyId: item.dynamicEntityPropertyId,
              propertyId: item.propertyId
            }
          })
          this._reloadUser()
        }
      })
    },
    _closePropertyMode() {
      this.isProperyMode = false
    }
  },
  created() {
    this._closePropertyMode()
  }
}
</script>
