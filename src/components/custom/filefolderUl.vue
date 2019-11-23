<template>
    <ul class="file-folder">
        <file-fodler-li
            v-for="(folder,i) in folders"
            :key="i"
            :breadcrumb="breadcrumb"
            :index="i"
            :model="folder"
            :parent="parent"
            @clearCurrent="clearCurrent"
            @setCurrent="setCurrent"
            @rightClick="rightClick"
            @setCurrentFolder="setCurrentFolder"
            @setBreadcrumb="setBreadcrumb"
        ></file-fodler-li>
    </ul>
</template>
<script>
export default {
    name: 'file-folder-ul',
    data() {
        return {}
    },
    computed: {
        folders() {
            return this.model
        }
    },
    props: ['model', 'index', 'breadcrumb', 'parent'],
    methods: {
        rightClick(e, item, bool, parent) {
            this.$emit('rightClick', e, item, bool, parent)
        },
        setCurrent(val, _index) {
            var that = this
            that.folders[_index] = val
            that.$emit('setCurrent', that.folders, that.index)
        },
        clearCurrent() {
            this.$emit('clearCurrent')
        },
        setBreadcrumb(val) {
            this.$emit('setBreadcrumb', val)
        },
        setCurrentFolder(val) {
            this.$emit('setCurrentFolder', val)
        }
    }
}
</script>
