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
            <nested-draggable
                :dragging="dragging"
                :dragUrl="dragUrl"
                :children="Pages"
                :parentId="0"
                :hasbind="true"
                @onDrag="onDrag"
                @add="add"
                @del="del"
                @edit="edit"
                @bind="bind"
                @unbind="unbind"
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
                        :state="hasError(page.displayName,'节点显示名')"
                        v-validate="'required'"
                        v-model="page.displayName"
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
            :title="modalName"
            @hidden="modalClose"
        >
            <template v-slot:modal-header="{ close }">
                <!-- Emulate built in modal header close button action -->
                <h5>
                    <i class="fas fa-columns text-info mr-1"></i>
                    导航绑定
                </h5>
                <div>
                    <b-form-radio-group
                        @change="switchActive(page)"
                        v-model="page.isActive"
                        :options="[{text:'启用',value:true},{text:'禁用',value:false} ]"
                    />
                </div>
            </template>
            <section>
                <div class="border-list">
                    <section>
                        <p class="lead">[{{page.displayName}}]的属性</p>
                        <b-alert show dismissible>
                            <b>Info:</b> 直接点选下列子项，即可绑定到导航哦
                        </b-alert>
                        <ul>
                            <li
                                v-for="(item,index) in webStaticModules"
                                :key="index"
                                @click="UpdateBind(page,page.id,item.id)"
                            >
                                <div
                                    :class="item.id==page.webModuleId?'active':''"
                                >
                                    <span>
                                        <i class="fas fa-cube"></i>
                                        {{item.name}}
                                    </span>
                                </div>
                            </li>
                        </ul>
                        <hr />
                        <ul>
                            <li
                                v-for="(item,index) in webCustomModules"
                                :key="index"
                                @click="UpdateBind(page,page.id,item.id)"
                            >
                                <div
                                    :class="item.id==page.webModuleId?'active':''"
                                >
                                    <span>
                                        <i class="fas fa-cube"></i>
                                        {{item.name}}
                                    </span>
                                </div>
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

export default {
    data() {
        return {
            Pages: [],
            page: {
                displayName: ''
            },
            editMode: false,
            modalName: '',
            // 绑定模块
            webStaticModules: [],
            webCustomModules: [],
            editModule: {
                name: '',
                isActive: true
            },
            // 拖动
            dragUrl: '/api/services/app/Navbar/Move',
            dragging: false
        }
    },
    computed: {},
    props: ['contentTitle'],
    components: {
        nestedDraggable
    },
    methods: {
        onDrag(e) {
            this.dragging = e
        },
        hasError(val, name) {
            if (val) return val.length ? !this.errors.has(name) : null
            else return null
        },
        add(index, item) {
            this.editMode = false
            this.page = { displayName: '', parentId: item.id }
            this.modalName = ` 新增 [${item.displayName}] 子节点：`
            this.$refs.modal.show()
        },
        edit(index, item) {
            this.editMode = true
            this.page = { displayName: item.displayName, id: item.id }
            this.modalName = ` 编辑 [${item.displayName}] 节点：`
            this.$refs.modal.show()
        },
        del(index, item) {
            swal({
                title: '确认吗?',
                text: '被删除数据可能无法恢复，请您再次确认!',
                icon: 'warning',
                buttons: ['取消', '确认'],
                dangerMode: true
            }).then(async willDelete => {
                if (willDelete) {
                    await this.$http
                        .delete('/api/services/app/Navbar/Delete', { params: { id: item.id } })
                        .then(res => {
                            if (res.data.success) this.load()
                        })
                }
            })
        },
        bind(index, item) {
            this.page = item
            this.$refs.bindModal.show()
        },
        async UpdateBind(item, id, webModuleId) {
            item.isMenu = false
            item.webModuleId = webModuleId
            await this.$http.post('/api/services/app/Navbar/BindModuleToNavbar', item).then(res => {
                if (res.data.success) this.load()
            })
        },
        async switchActive(item) {
            item.isActive = !item.isActive
            await this.$http.post('/api/services/app/Navbar/Active', item).then(res => {
                if (res.data.success) this.setLoopChildren(this.Pages, item)
            })
        },
        async unbind(index, item) {
            item.isMenu = !item.isMenu
            await this.$http.post('/api/services/app/Navbar/SwitchMenu', item).then(res => {
                if (res.data.success) this.setLoopChildren(this.Pages, item)
            })
        },

        setLoopChildren(arry, item) {
            arry.forEach(p => {
                if (p.id === item.id) p = item
                else if (p.children && p.children.length > 0) this.setLoopChildren(p.children, item)
            })
        },

        modalOpen() {
            this.$refs.modalInput.focus()
        },
        // 关闭清空编辑
        modalClose() {
            this.editMode = false
            this.page = {
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
                        await this.$http.post('/api/services/app/Navbar/Create', this.page).then(res => {
                            if (res.data.success) this.load()
                        })
                    } else {
                        await this.$http.put('/api/services/app/Navbar/Update', this.page).then(res => {
                            if (res.data.success) this.load()
                        })
                    }
                    this.$refs.modal.hide()
                }
            })
        },
        load() {
            this.$http.get('/api/services/app/Navbar/GetAll', { params: { Id: null } }).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.Pages = json
                }
            })
            this.$http.get('/api/services/app/WebModule/GetAll', { params: { isLock: true } }).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.webStaticModules = json
                }
            })
            this.$http.get('/api/services/app/WebModule/GetAll', { params: { isLock: false } }).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.webCustomModules = json
                }
            })
        }
    },
    created: function() {
        this.load()
    },
    mounted() {
        // 开发调试
        this.$nextTick(() => this.$emit('reloadScroll'))
    }
}
</script> 
