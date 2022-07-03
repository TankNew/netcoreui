<template>
  <section class="container-fluid">
    <p class="lead">
      <i class="far fa-copy text-primary mr-1"></i>
      {{ contentTitle }}
    </p>
    <section>
      <div>
        <b-alert show dismissible>
          <b>Info:</b>
          选择快捷工具‘单页显示条目’可改变显示的条目总数。角色模块无排序功能。
        </b-alert>
      </div>
      <label><i class="fas fa-wrench mx-2 text-info"></i>快捷工具</label>
      <!-- User Interface controls -->
      <dl class="news-bar">
        <dd class="search">
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
        <section style="min-height: 300px">
          <b-table-simple hover responsive bordered>
            <colgroup>
              <col />
              <col style="width: 120px" />
            </colgroup>
            <b-thead head-variant="light">
              <b-tr>
                <b-th class="text-center">角色名称</b-th>
                <b-th class="text-center">操作</b-th>
              </b-tr>
            </b-thead>
            <b-tbody v-if="isBusy">
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
              <b-tr v-for="(item, index) in items" :key="index">
                <b-td class="px-3"
                  >{{ item.name }}
                  <b-badge v-show="item.isStatic" variant="primary">系统</b-badge>
                  <b-badge v-show="item.isDefault" variant="secondary">默认</b-badge>
                </b-td>
                <b-td class="text-center">
                  <b-button
                    size="sm"
                    @click.stop="_edit(item, item.index, $event.target)"
                    class="mr-1"
                    variant="info"
                    >编辑</b-button
                  >
                  <b-button
                    size="sm"
                    @click.stop="_delete(item, item.index, $event.target)"
                    variant="dark"
                    >删除</b-button
                  >
                </b-td>
              </b-tr>
            </b-tbody>
            <b-tfoot>
              <b-tr>
                <b-td colspan="2" variant="light" class="text-left">
                  Total Rows:
                  <b>{{ totalRows }}</b>
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

    <b-modal
      ref="blockModal"
      scrollable
      size="lg"
      :ok-title="'确认'"
      :cancel-title="'取消'"
      :title="editModeTitle"
      @ok="blockModalOk"
      @hidden="blockModalHide"
    >
      <template v-slot:modal-header="{ close }">
        <!-- Emulate built in modal header close button action -->
        <h6>编辑角色：{{ form.role.name }}</h6>
      </template>
      <b-form @submit.stop.prevent="blockSubmit" autocomplete="off" data-vv-scope="form-modal">
        <b-tabs content-class="m-3" small>
          <b-tab title="角色名称" active>
            <b-form-group id="fieldset-1" label="角色名称" label-for="input-1">
              <b-form-input
                id="input-1"
                size="sm"
                name="角色名称"
                v-model="form.role.name"
                placeholder="角色名称"
                v-validate="'required'"
                :state="!errors.has('form-modal.角色名称')"
                :disabled="form.role.isStatic"
                trim
              ></b-form-input>
            </b-form-group>

            <b-form-checkbox v-model="form.role.isDefault" name="check-button" switch>
              默认<small>(新角色将默认拥有此角色)</small>
            </b-form-checkbox>

            <b-alert variant="warning" show class="mt-5">
              <small
                >如果您正在更改自己的权限，则可能需要刷新页面（F5），以在您所做的权限更改生效！</small
              ></b-alert
            >
          </b-tab>
          <b-tab title="权限">
            <b-form-group v-slot="{ ariaDescribedby }">
              <b-form-checkbox-group
                id="checkbox-group-1"
                size="sm"
                v-model="form.grantedPermissionNames"
                :options="options"
                :aria-describedby="ariaDescribedby"
                name="flavour-1"
                stacked
              ></b-form-checkbox-group>
            </b-form-group>
          </b-tab>
          <b-tab title="成员"> </b-tab>
        </b-tabs>
      </b-form>
    </b-modal>
  </section>
</template>
<script>
import tools from '../utiltools/tools'
import swal from 'sweetalert'
import { mapActions } from 'vuex'

const baseFrom = {
  role: {
    id: 0,
    name: '',
    isDefault: false
  },
  permissions: [
    {
      name: '',
      displayName: '',
      description: ''
    }
  ],
  grantedPermissionNames: ['']
}
export default {
  components: {},
  data() {
    return {
      isUpdate: false, // 是否更新
      editRow: {},
      editRowIndex: null,
      form: JSON.parse(JSON.stringify(baseFrom)),
      formShow: false,

      /* table设置 start*/
      items: [],
      isBusy: true,
      currentPage: 1,
      perPage: 10,
      totalRows: 0,
      pageOptions: [5, 10, 20, 50, 100],
      keyWord: null,
      filter: null
    }
  },
  props: {
    contentTitle: String,
    scorllTopLength: Number
  },
  watch: {
    perPage() {
      this.load()
      this.refreshScroll()
    }
  },
  computed: {
    options() {
      return this.form.permissions.map(x => {
        return { text: x.displayName, value: x.name }
      })
    },
    editModeTitle() {
      return this.isUpdate ? '编辑' : '新增'
    }
  },
  methods: {
    ...mapActions([
      'getAllRolesAsync',
      'getAllPermissionsAsync',
      'getRoleForEditAsync',
      'createRoleAsync',
      'updateRoleAsync',
      'deleteRoleAsync'
    ]),
    refreshScroll() {
      this.$emit('refreshScroll')
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
    async load() {
      this.isBusy = true
      let params = {
        params: {
          Keyword: this.filter,
          SkipCount: (this.currentPage - 1) * this.perPage,
          MaxResultCount: this.perPage
        }
      }
      var data = await this.getAllRolesAsync(params)

      if (data.success) {
        var json = data.result
        this.items = json.items
        this.totalRows = json.totalCount
      }
      this.isBusy = false
    },

    // 编辑模式
    outEditMode() {
      this.isUpdate = false
      this.form = JSON.parse(JSON.stringify(baseFrom))
      this.editRow = {}
    },
    //编辑
    async _edit(item, index, button) {
      this.isUpdate = true
      this.editRow = item
      var data = await this.getRoleForEditAsync({ params: { id: item.id } })
      if (data.success) {
        if (data.result.role) this.form.role = data.result.role
        if (data.result.permissions) this.form.permissions = data.result.permissions
        if (data.result.grantedPermissionNames)
          this.form.grantedPermissionNames = data.result.grantedPermissionNames

        this.$refs.blockModal.show()
      }
    },
    //新增
    async _new() {
      this.outEditMode()
      var data = await this.getAllPermissionsAsync()
      if (data.success) {
        if (data.result.items) {
          this.form.permissions = data.result.items
          this.$refs.blockModal.show()
        }
      }
    },
    async _delete(item, index, button) {
      swal({
        title: '确认吗?',
        text: '被删除数据可能无法恢复，请您再次确认!',
        icon: 'warning',
        buttons: ['取消', '确认'],
        dangerMode: true
      }).then(async confirm => {
        if (confirm) {
          await this.deleteRoleAsync({ params: { id: item.id } })
          this.load()
        }
      })
    },

    blockModalOk(e) {
      e.preventDefault()
      this.blockSubmit()
    },
    blockModalHide() {
      this.outEditMode()
      this.$refs.blockModal.hide()
    },
    async blockSubmit() {
      if (await this.validate('form-modal')) {
        this.editRow = JSON.parse(JSON.stringify(this.form.role))
        this.editRow.grantedPermissions = this.form.grantedPermissionNames

        let data
        if (!this.isUpdate) {
          data = await this.createRoleAsync(this.editRow)
        } else {
          data = await this.updateRoleAsync(this.editRow)
        }
        if (data.success) {
          this.load()
          swal('操作成功!', '', 'success').then(() => this.blockModalHide())
        } else {
          swal('发生错误!', data.error, 'error')
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
    }
  },
  created() {
    this.load()
  }
}
</script> 
