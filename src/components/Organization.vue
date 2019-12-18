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
    </div>
    <section class="tankTree">
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
      <nested-draggable
        :dragging="dragging"
        :dragUrl="dragUrl"
        :children="organizationList"
        :parentId="0"
        @onDrag="onDrag"
        @ctxMenuOpen="ctxMenuOpen"
      />
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
            :state="hasError(module.displayName,'节点显示名')"
            v-validate="'required'"
            v-model="module.displayName"
          ></b-form-input>
        </b-input-group>
      </form>
    </b-modal>
  </section>
</template>
<script>
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
            currentLayer: 0
        }
    },
    props: ['contentTitle'],
    components: {
        nestedDraggable,
        contextMenu
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
        hasError(val, name) {
            if (val) return val.length ? !this.errors.has(name) : null
            else return null
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
        }
    },
    created: function() {
        this.load()
    }
}
</script> 
