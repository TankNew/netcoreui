<template>
    <li>
        <div v-if="parentId!==0" class="o-line-up"></div>
        <a @mouseover="imgtools=true" @mouseout="imgtools=false">
            <div v-show="imgtools" class="img-cover-toolbar">
                <button
                    type="button"
                    class="btn btn-info btn-xs edit"
                    @click="edit(index,item)"
                >
                    <i class="fas fa-pencil-alt" aria-hidden="true"></i>
                </button>
                <button
                    type="button"
                    class="btn btn-success btn-xs del"
                    @click="add(index,item.children)"
                >
                    <i class="fas fa-plus" aria-hidden="true"></i>
                </button>
                <button
                    type="button"
                    class="btn btn-danger btn-xs del"
                    @click="del(index,item.children)"
                >
                    <i class="fas fa-minus" aria-hidden="true"></i>
                </button>
            </div>
            {{item.displayName}}
        </a>
        <div class="o-line-down" v-if="item.children.length>0"></div>
        <treeUl
            v-if="item.children.length>0"
            :pages="item.children"
            :parentId="item.id"
            @add="add"
            @del="del"
            @edit="edit"
        ></treeUl>
    </li>
</template>
<script>
export default {
    name: 'treeLi',
    data() {
        return {
            imgtools: false
        }
    },
    computed: {
        imgtoolsId() {
            return 'li' + this.item.parentId + this.item.id
        }
    },
    props: ['item', 'index', 'parentId', 'hoverid'],
    methods: {
        add(index, item) {
            this.$emit('add', index, item)
        },
        edit(index, item) {
            this.$emit('edit', index, item)
        },
        del(index, item) {
            this.$emit('del', index, item)
        }
    },
    created() {}
}
</script>
