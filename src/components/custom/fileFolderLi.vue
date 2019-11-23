<template>
    <li v-if="folder.isSubdir" :class="licss">
        <i
            v-if="hasChild"
            class="fas fa-chevron-right"
            @click="folder.open=!folder.open"
        ></i>
        <a
            :class="folder.isActive?'active':''"
            @click="oneClick($event)"
            @contextmenu="rightClick($event,folder,false,parent)"
        >
            <i
                :class="['far','mr-1',folder.isActive?'fa-folder-open':'fa-folder']"
            ></i>
            {{folder.name}}
        </a>
        <file-fodler-ul
            v-if="folder.isSubdir"
            :model="folder.subdir"
            :index="1"
            :breadcrumb="bread"
            :parent="folder"
            @setCurrent="setCurrent"
            @clearCurrent="clearCurrent"
            @setCurrentFolder="setCurrentFolder"
            @rightClick="rightC"
            @setBreadcrumb="setBreadcrumb"
        ></file-fodler-ul>
    </li>
</template>
<script>
export default {
    name: 'file-folder-li',
    data() {
        return {
            //定义点击双击事件参数
            delay: 300,
            clicks: 0,
            timer: null
        }
    },
    computed: {
        bread() {
            return this.breadcrumb
        },
        folder() {
            return this.model
        },
        licss() {
            if (this.folder.open) return 'active'
        },
        hasChild() {
            var res = false
            if (this.folder.isSubdir)
                this.folder.subdir.forEach(m => {
                    if (m.isSubdir) res = true
                })
            return res
        }
    },
    props: ['model', 'index', 'breadcrumb', 'parent'],
    methods: {
        rightClick(e, item, bool, parent) {
            var that = this
            that.folder.open = true
            that.$emit('rightClick', e, item, bool, parent)
            that.setActive()
        },
        rightC(e, item, bool, parent) {
            var that = this
            that.$emit('rightClick', e, item, bool, parent)
        },
        oneClick: function(event) {
            this.clicks++
            if (this.clicks >= 2) this.clicks = 2
            if (this.clicks === 1) {
                var that = this
                that.setActive()
                that.timer = setTimeout(function() {
                    if (that.clicks === 2) that.folder.open = !that.folder.open
                    that.clicks = 0
                    clearTimeout(that.timer)
                }, this.delay)
            }
        },
        setActive() {
            var that = this
            that.clearCurrent()
            that.setCurrentFolder(that.folder)
            setTimeout(() => {
                that.bread.unshift({ text: that.folder.name, value: that.folder })
                that.$emit('setBreadcrumb', that.bread)
                setTimeout(() => {
                    that.folder.isActive = true
                    that.$emit('setCurrent', that.folder, that.index)
                }, 0)
            }, 0)
        },
        setCurrent(val, _index) {
            var that = this
            that.folder.subdir = val
            that.$emit('setCurrent', that.folder, that.index)
        },
        clearCurrent() {
            this.$emit('clearCurrent')
        },
        setBreadcrumb(val) {
            val.unshift({ text: this.folder.name, value: this.folder })
            this.$emit('setBreadcrumb', val)
        },
        setCurrentFolder(val) {
            this.$emit('setCurrentFolder', val)
        }
    }
}
</script>
