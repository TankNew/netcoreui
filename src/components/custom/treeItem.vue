<template>
    <li :class="isOpen?'active':''">
        <div
            :class="currentPageGroup.catalogGroupId==item.id?'choose':''"
            @click="toggle"
            @dblclick="catalogChoose(item)"
        >
            <i v-if="isFolder" class="fas fa-circle-notch"></i>
            <i v-else class="fa fa-angle-left"></i>
            {{ item.displayName }}
        </div>
        <ul v-if="isFolder">
            <tree-item
                v-for="(child, index) in item.children"
                :key="index"
                :item="child"
                :currentPageGroup="currentPageGroup"
                @catalogChoose="catalogChooseEmit"
            ></tree-item>
        </ul>
    </li>
</template>
<script>
export default {
    name: 'tree-item',
    data() {
        return {
            isOpen: true
        }
    },
    props: {
        item: Object,
        currentPageGroup: Object
    },
    computed: {
        isFolder: function() {
            return this.item.children && this.item.children.length
        }
    },
    methods: {
        toggle: function() {
            if (this.isFolder) {
                this.isOpen = !this.isOpen
            }
        },
        catalogChoose(val) {
            if (!this.isFolder) {
                this.$emit('catalogChoose', val)
            }
        },
        catalogChooseEmit(val) {
            this.$emit('catalogChoose', val)
        }
    }
}
</script>
