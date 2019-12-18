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
    <section class="tankTree" @contextmenu.prevent>
      <context-menu id="context-menu" ref="ctxMenu" @ctx-open="onCtxOpen">
        <li @contextmenu.prevent @click="edit">
          <i class="fas color-primary fa-pencil-alt mr-1"></i>
          编辑
        </li>
        <li @contextmenu.prevent @click="bind" v-if="currentLayer>0">
          <i class="fas color-Purple fa-link mr-1"></i>
          绑定
        </li>
        <li @contextmenu.prevent @click="add" v-if="currentLayer<3">
          <i class="fas color-success fa-plus mr-1"></i>
          扩展
        </li>
        <li
          @contextmenu.prevent
          @click="expandNavbar"
          v-if="currentLayer<3 && currentNavbar.navbarType===2"
          style="width:140px;"
        >
          <i class="fas color-success fa-exchange-alt mr-1"></i>
          自动扩展
        </li>
        <li @contextmenu.prevent @click="del" v-if="currentLayer>0">
          <i class="fas color-danger fa-minus mr-1"></i>
          删除
        </li>
      </context-menu>
      <nested-draggable
        :dragging="dragging"
        :dragUrl="dragUrl"
        :children="navbarList"
        :parentId="0"
        :hasbind="true"
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
      @hidden="modalClose"
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
    <!-- 弹出绑定层 -->
    <b-modal
      ref="bindModal"
      size="lg"
      scrollable
      :ok-title="'确认'"
      @hidden="modalClose"
    >
      <template v-slot:modal-header="{ close }">
        <!-- Emulate built in modal header close button action -->
        <h5>
          <i class="fas fa-columns text-info mr-1"></i>
          导航绑定
        </h5>
        <div>
          <b-form-checkbox
            switch
            @change="switchActive(module)"
            v-model="module.isActive"
            size="lg"
          >启用</b-form-checkbox>
        </div>
      </template>
      <section>
        <div class="border-list">
          <section>
            <p class="lead">[{{module.displayName}}]的属性</p>
            <b-alert show dismissible>
              <b>Info:</b> 单击模块可展开（如果有子项），双击即可绑定到导航哦
            </b-alert>
            <p class="center">
              <b-button-group>
                <b-button
                  class="px-5"
                  @click="bindMenu"
                  :variant="module.navbarType === 0?'warning':''"
                >菜单</b-button>
                <b-button
                  class="px-5"
                  :variant="module.navbarType !== 0&&module.navbarType !== 4?'info':''"
                >模块</b-button>
                <b-button
                  class="px-5"
                  @click="module.navbarType=4"
                  :variant="module.navbarType === 4?'success':''"
                >链接</b-button>
              </b-button-group>
            </p>
            <b-input-group prepend="链接" class="mt-3">
              <b-form-input
                v-model="module.url"
                :disabled="module.navbarType !== 4"
                :placeholder="module.navbarType === 4?'http://www.ednet.cn':'选择模块将自动生成链接地址'"
              ></b-form-input>
              <b-input-group-append>
                <b-button @click="bindUrl" variant="info">绑定</b-button>
              </b-input-group-append>
            </b-input-group>
            <hr />
            <ul>
              <li
                v-for="(item,index) in webStaticModules"
                :key="index"
                @click="ChooseModule(item,item.id,1)"
                @dblclick="bindModule(item,item.id,1)"
              >
                <div
                  :class="module.navbarType===1&&item.url==module.url?'active':''"
                >
                  <span>
                    <i class="fas fa-cube"></i>
                    {{item.displayName}}
                  </span>
                </div>
              </li>
            </ul>
            <hr />
            <ul>
              <li
                v-for="(item,index) in webPageModules"
                :key="index"
                @click="ChooseModule(item,item.id,3)"
                @dblclick="bindModule(item,item.id,3)"
              >
                <div
                  :class="currentNavbar.navbarType===3&&item.id==currentNavbar.pageId?'active':''"
                >
                  <span>
                    <i class="fas fa-cube"></i>
                    {{item.displayName}}
                  </span>
                </div>
              </li>
            </ul>
            <hr />
            <ul class="ul-has-sub">
              <li v-for="(item,index) in webCustomModules" :key="index">
                <div
                  :class="currentNavbar.navbarType===2&&item.id==currentNavbar.catalogGroupId?'active':''"
                  @click="ChooseModule(item,item.id,2)"
                  @dblclick="bindModule(item,item.id,2)"
                >
                  <span>
                    <i class="fas fa-cube"></i>
                    {{item.displayName}}
                  </span>
                </div>
                <span
                  v-if="(item.id==currentModule.id ||
                                     (module.navbarType===2&&module.catalogGroup&&module.catalogGroup.code.indexOf(item.code)>-1))
                                     &&item.children.length>0"
                  class="o-line-down"
                ></span>
                <ul
                  class="sub-list mt-3"
                  v-if="(item.id==currentModule.id ||
                                     (module.navbarType===2&&module.catalogGroup&&module.catalogGroup.code.indexOf(item.code)>-1))
                                     &&item.children.length>0"
                >
                  <li v-for="(s,i) in item.children" :key="i">
                    <div
                      :class="currentNavbar.navbarType===2&&s.id==currentNavbar.catalogGroupId?'active':''"
                      @dblclick="bindModule(s,s.id,2)"
                    >
                      <span>{{s.displayName}}</span>
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
          </section>
        </div>
      </section>
      <template v-slot:modal-footer="{ ok, cancel, hide }">
        <b-button variant="primary" @click="ok()">确认</b-button>
      </template>
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
            editMode: false,
            module: {},
            modalName: '',
            currentNavbar: {},
            currentLayer: 0,
            currentModule: {},

            navbarList: [],
            webStaticModules: [],
            webCustomModules: [],
            webPageModules: [],
            // 获取CMS子分类
            dataGroupListUrl: '/api/services/app/CatalogGroup/GetAll',
            // 拖动
            dragUrl: '/api/services/app/Navbar/Move',
            dragging: false
        }
    },
    computed: {},
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
            this.currentNavbar = item
        },
        onDrag(e) {
            this.dragging = e
        },
        add() {
            this.editMode = false
            this.module = { displayName: '', navbarType: 0, parentId: this.currentNavbar.id }
            this.modalName = ` 新增 [${this.currentNavbar.displayName}] 子节点：`
            this.$refs.modal.show()
        },
        expandNavbar() {
            this.$http
                .get('/api/services/app/CatalogGroup/GetAll', { params: { id: this.currentNavbar.catalogGroupId } })
                .then(res => {
                    if (res.data.success) {
                        let json = res.data.result
                        if (json.length < 1)
                            swal({
                                title: '当前模块没有子分类!',
                                icon: 'info'
                            })
                        else {
                            let childrenNames = this.currentNavbar.children.map(x => x.displayName)
                            json.forEach(async x => {
                                if (childrenNames.indexOf(x.displayName) < 0)
                                    await this.$http
                                        .post('/api/services/app/Navbar/Create', {
                                            displayName: x.displayName,
                                            navbarType: 2,
                                            parentId: this.currentNavbar.id,
                                            webModuleId: null,
                                            catalogGroupId: x.id,
                                            url: '/Main/News/' + x.id
                                        })
                                        .then(res => {
                                            if (res.data.success) this.load()
                                        })
                            })
                        }
                    }
                })
        },
        edit() {
            this.editMode = true
            this.module = JSON.parse(JSON.stringify(this.currentNavbar))
            this.modalName = ` 编辑 [${this.currentNavbar.displayName}] 节点：`
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
                        .delete('/api/services/app/Navbar/Delete', { params: { id: this.currentNavbar.id } })
                        .then(res => {
                            if (res.data.success) this.load()
                        })
                }
            })
        },
        bind() {
            this.module = JSON.parse(JSON.stringify(this.currentNavbar))
            this.$refs.bindModal.show()
        },
        async ChooseModule(item, id, navbarType) {
            if (this.currentModule !== item) {
                this.currentModule = item
            }
        },
        modalOpen() {
            this.$refs.modalInput.focus()
        },
        // 关闭清空编辑
        modalClose() {
            this.editMode = false
            this.module = {}
            this.currentNavbar = {}
            this.currentModule = {}
            this.modalName = ''
        },
        setLoopChildren(arry, item) {
            arry.forEach(p => {
                if (p.id === item.id) p = item
                else if (p.children && p.children.length > 0) this.setLoopChildren(p.children, item)
            })
        },
        async bindMenu() {
            this.module.navbarType = 0
            this.update()
        },
        async bindUrl() {
            this.module.navbarType = 4
            this.update()
        },
        async bindModule(item, id, bindType) {
            this.module.navbarType = bindType

            switch (this.module.navbarType) {
                case 1:
                    this.module.url = item.url
                    break
                case 2:
                    this.module.catalogGroupId = item.id
                    switch (item.catalogType) {
                        case 1:
                            this.module.url = '/Main/News/' + item.id
                            break
                        case 2:
                            this.module.url = '/Main/PhotoNews/' + item.id
                            break
                        case 3:
                            this.module.url = '/Main/Product/' + item.id
                            break
                    }
                    break
                case 3:
                    this.module.pageId = item.id
                    this.module.url = '/Main/Page/' + item.id
                    break
            }
            this.update()
        },
        async update() {
            await this.$http.put('/api/services/app/Navbar/Update', this.module).then(res => {
                if (res.data.success) {
                    this.currentNavbar = res.data.result
                    this.module = JSON.parse(JSON.stringify(this.currentNavbar))
                    this.load()
                }
            })
        },
        async switchActive(item) {
            item.isActive = !item.isActive
            await this.$http.post('/api/services/app/Navbar/Active', item).then(res => {
                if (res.data.success) this.setLoopChildren(this.navbarList, item)
            })
        },
        async handleOk(evt) {
            // Prevent modal from closing
            evt.preventDefault()

            this.$validator.validateAll().then(async result => {
                if (result) {
                    if (!this.editMode) {
                        await this.$http.post('/api/services/app/Navbar/Create', this.module).then(res => {
                            if (res.data.success) this.load()
                        })
                    } else this.update()

                    this.$refs.modal.hide()
                }
            })
        },
        loadAll() {
            this.load()
            this.$http.get('/api/services/app/WebModule/GetAll').then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.webStaticModules = json
                }
            })
            this.$http.get('/api/services/app/CatalogGroup/GetAll').then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.webCustomModules = json
                }
            })

            this.$http.get('/api/services/app/Page/GetAll').then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.webPageModules = json.items
                }
            })
        },
        load() {
            this.$http.get('/api/services/app/Navbar/GetAll', { params: { Id: null } }).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.navbarList = json
                }
            })
        }
    },
    created: function() {
        this.loadAll()
    }
}
</script> 
