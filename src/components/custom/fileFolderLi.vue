<template>
  <li :class="licss">
    <i v-if="hasChild" class="fas fa-chevron-right" @click="item.open=!item.open"></i>
    <a :class="item.isActive?'active':''"
       @click="oneClick($event)"
       @contextmenu="rightClick($event,item,false,parent)">

      <i :class="['far','mr-1',item.isActive?'fa-folder-open':'fa-folder']"></i>
      {{item.name}}
    </a>
    <file-fodler-ul v-if="item.isSubdir"
                    :model=item.subdir
                    :index="1"
                    :breadcrumb="bread"
                    :parent="item"
                    @setCurrent="setCurrent"
                    @clearCurrent="clearCurrent"
                    @setCurrentFolder="setCurrentFolder"
                    @rightClick="rightC"
                    @setBreadcrumb="setBreadcrumb"></file-fodler-ul>
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
      item() {
        return this.model
      },
      licss() {
        if (this.item.open)
          return 'active'
      },
      hasChild() {
        var res = false
        if (this.item.isSubdir)
          this.item.subdir.forEach(m => {
            if (m.isSubdir) res = true
          })
        return res
      }
    },
    props: ['model', 'index', 'breadcrumb', 'parent'],
    methods: {
      rightClick(e, item, bool, parent) {
        var that = this
        that.item.open = true
        that.$emit('rightClick', e, item, bool, parent)
        that.setActive()
      },
      rightC(e, item, bool, parent) {
        var that = this
        that.$emit('rightClick', e, item, bool, parent)
      },
      oneClick: function (event) {
        this.clicks++
        if (this.clicks >= 2) this.clicks = 2
        if (this.clicks === 1) {
          var that = this
          that.setActive()
          that.timer = setTimeout(function () {
            if (that.clicks === 2)
              that.item.open = !that.item.open
            that.clicks = 0
            clearTimeout(that.timer)
          }, this.delay)
        }
      },
      setActive() {
        var that = this
        that.clearCurrent()
        that.setCurrentFolder(that.item)
        setTimeout(() => {
          that.bread.unshift({ text: that.item.name, value: that.item })
          that.$emit('setBreadcrumb', that.bread)
          setTimeout(() => {
            that.item.isActive = true
            that.$emit('setCurrent', that.item, that.index)
          }, 0)
        }, 0)
      },
      setCurrent(val, _index) {
        var that = this
        that.item.subdir = val
        that.$emit('setCurrent', that.item, that.index)
      },
      clearCurrent() {
        this.$emit('clearCurrent')
      },
      setBreadcrumb(val) {
        val.unshift({ text: this.item.name, value: this.item })
        this.$emit('setBreadcrumb', val)
      },
      setCurrentFolder(val) {
        this.$emit('setCurrentFolder', val)
      }
    }
  }
</script>
