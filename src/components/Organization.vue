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
                @onDrag="onDrag"
                @add="add"
                @del="del"
                @edit="edit"
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
                        :state="hasError(page.displayName,'节点显示名')"
                        v-validate="'required'"
                        v-model="page.displayName"
                    ></b-form-input>
                </b-input-group>
            </form>
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
            dragUrl: '/api/services/app/Organization/Move',
            dragging: false
        }
    },
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
                        .delete('/api/services/app/Organization/Delete', { params: { organizationId: item.id } })
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
                        await this.$http.post('/api/services/app/Organization/Create', this.page).then(res => {
                            if (res.data.success) this.load()
                        })
                    } else {
                        await this.$http.put('/api/services/app/Organization/Update', this.page).then(res => {
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
                    this.Pages = json
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
<style lang="less" scope>
/*组织结构图设定*/
.subbar {
    border-top: 1px solid #ccc;
    padding: 10px 20px;
}
</style>
