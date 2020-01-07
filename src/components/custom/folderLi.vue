<template>
  <li :class="licss">
    <i v-if="hasChild" class="fas fa-chevron-right" @click="dbClick($event)"></i>
    <a
      :class="folder.isActive?'active':''"
      @click="oneClick($event)"
      @dblclick="dbClick($event)"
      @contextmenu="rightC($event,folder,isRoot,parent)"
    >
      <i :class="['far','mr-1',folder.isActive?'fa-folder-open':'fa-folder']"></i>
      {{folder.name}}
    </a>
    <ul class="file-folder" v-if="folder.isSubdir">
      <folder-li
        v-for="(child,i) in mapFolders"
        :key="i"
        :folder="child"
        :index="i"
        :parent="folder"
        :breadcrumb="breadcrumb"
        @disActive="disActive"
        @rightClick="rightClick"
        @setCurrentFolder="setCurrentFolder"
        @setBreadcrumb="setBreadcrumb"
      ></folder-li>
    </ul>
  </li>
</template>
<script>
export default {
    name: 'folder-li',
    data() {
        return {}
    },
    computed: {
        hasChild() {
            var res = false
            if (this.folder.isSubdir)
                this.folder.subdir.forEach(m => {
                    if (m.isSubdir) res = true
                })
            return res
        },
        mapFolders() {
            return this.folder.subdir.filter(x => x.isSubdir)
        },
        licss() {
            if (this.folder.open) return 'active'
        }
    },
    props: {
        folder: {
            required: true,
            type: Object
        },
        index: {
            required: true,
            type: Number
        },
        breadcrumb: {
            required: true,
            type: Array
        },
        parent: {
            type: Object
        },
        isRoot: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        rightC(e, item, bool, parent) {
            var that = this
            that.$emit('rightClick', e, item, bool, parent)
            setTimeout(() => {
                that.breadcrumb.unshift({ text: that.folder.name, value: that.folder })
                that.$emit('setBreadcrumb', that.breadcrumb)
            }, 0)
        },
        rightClick(e, item, bool, parent) {
            var that = this
            that.$emit('rightClick', e, item, bool, parent)
        },
        oneClick: function(event, val) {
            var that = this
            that.disActive()
            that.setCurrentFolder(that.folder)
            that.folder.isActive = true
            setTimeout(() => {
                that.breadcrumb.unshift({ text: that.folder.name, value: that.folder })
                that.$emit('setBreadcrumb', that.breadcrumb)
            }, 0)
        },
        dbClick(e) {
            this.folder.open = !this.folder.open
        },
        setBreadcrumb(val) {
            val.unshift({ text: this.folder.name, value: this.folder })
            this.$emit('setBreadcrumb', val)
        },
        disActive() {
            this.$emit('disActive')
        },
        setCurrentFolder(val) {
            this.$emit('setCurrentFolder', val)
        }
    }
}
</script>
