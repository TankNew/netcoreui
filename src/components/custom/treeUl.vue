<template>
    <ul :class="[classId,pages.length>1?'border-left':'']">
        <treeLi
            v-for="(item,index) in pages"
            :key="index"
            :item="item"
            :index="index"
            :parentId="parentId"
            @add="add"
            @del="del"
            @edit="edit"
            v-dragging="{ item: item, list:pages, group: classId}"
        ></treeLi>
    </ul>
</template>
<script>
export default {
    name: 'treeUl',
    data() {
        return {}
    },
    computed: {
        classId() {
            return 'ul' + this.parentId
        }
    },
    props: ['pages', 'parentId', 'hoverid'],
    methods: {
        add(index, item) {
            this.$emit('add', index, item)
        },
        edit(index, item) {
            this.$emit('edit', index, item)
        },
        del(index, item) {
            this.$emit('del', index, item)
        },
        imgtools(index) {
            this.$emit('imgtools', index)
        }
    },
    created() {}
}
</script>
