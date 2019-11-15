<template>
    <section class="container-fluid">
        <p class="lead">
            <i class="far fa-copy text-primary mr-1"></i>
            {{contentTitle}}
        </p>
        <div class="mr-3">
            <b-alert show dismissible>
                <b>Info:</b>拖动栏目可以自由排序. 自定义栏目最大扩展2层
            </b-alert>
        </div>
        <section class="tankTree">
            <treeUl
                :pages="Pages"
                :parentId="0"
                @add="add"
                @del="del"
                @edit="edit"
            ></treeUl>
        </section>
        <section class="subbar">
            <button
                class="form-inline btn btn-success px-5"
                type="button"
                @click="submit"
            >提交</button>
            <button
                class="form-inline btn btn-default px-5"
                type="button"
                @click="reset"
            >重置</button>
        </section>
        <!--弹出修改层-->
        <b-modal
            id="modalPrevent"
            ref="pageModal"
            :title="editMode?'编辑':'新增'"
            @ok="handleOk"
            @shown="clearName"
        >
            <form @submit.stop.prevent="handleSubmit">
                <b-input-group size="sm" prepend="栏目名称" class="mb-3">
                    <b-form-input></b-form-input>
                </b-input-group>
                <b-input-group size="sm" prepend="栏目链接" class="mb-3">
                    <b-form-input></b-form-input>
                </b-input-group>
                <b-input-group size="sm" prepend="栏目类型" class="mb-3">
                    <b-form-radio-group
                        size="sm"
                        :options="['新闻', '产品', '编辑器','自定义页面一','新闻', '产品', '编辑器','自定义页面一']"
                    />
                </b-input-group>
            </form>
        </b-modal>
    </section>
</template>
<script>
export default {
    data() {
        return {
            Pages: [],
            page: {
                name: '',
                active: false,
                subpage: []
            },
            editMode: false,
            name: ''
        }
    },
    props: ['contentTitle'],
    methods: {
        add(index, item) {
            this.editMode = false
            this.$refs.pageModal.show()
        },
        edit(index, item) {
            this.$refs.pageModal.show()
            this.editMode = true
        },
        del(index, item) {},
        submit() {},
        reset() {},
        clearName() {
            this.name = ''
        },
        handleOk(evt) {
            // Prevent modal from closing
            evt.preventDefault()
            if (!this.name) {
                alert('Please enter your name')
            } else {
                this.handleSubmit()
            }
        },
        handleSubmit() {
            this.names.push(this.name)
            this.clearName()
            this.$refs.modal.hide()
        },
        load() {
            this.$http.get('/api/services/app/Organization/GetAll', { params: { organizationId: null } }).then(res => {
                let json = res.data.result
                this.Pages = json
            })
        }
    },
    created: function() {
        var that = this
        that.load()
    },
    mounted() {
        var that = this
        // 开发调试
        that.$nextTick(() => {
            that.$emit('reloadScroll')
        })
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
