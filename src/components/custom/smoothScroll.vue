<template>
  <section ref="scrollContainer" class="scroll-container">
    <!-- 他妈的神经病啊，必须加上一个div -->
    <div>
      <slot></slot>
    </div>
  </section>
</template>
<script>
import Scrollbar from 'smooth-scrollbar'

export default {
    data() {
        return {
            scroll: null,
            bottom: 0
        }
    },
    props: {
        data: {
            type: Array,
            default: null
        },
        autoScroll: {
            type: Boolean,
            default: false
        },
        refreshDelay: {
            type: Number,
            default: 20
        }
    },
    watch: {
        // 监听数据的变化，延时refreshDelay时间后调用refresh方法重新计算，保证滚动效果正常
        data() {
            this.refresh()
        }
    },
    methods: {
        init() {
            var that = this
            if (!this.$refs.scrollContainer) {
                return
            }
            if (this.scroll === null) {
                this.scroll = Scrollbar.init(this.$refs.scrollContainer, {
                    damping: 0.2
                })
                if (this.autoScroll) this.ScrollToBottom()
                this.scroll.addListener(this.listener)
                let size = this.scroll.getSize()
                this.bottom = size.content.height
            }
        },
        listener(status) {
            this.$emit('scrollTop', status.offset.y)
        },
        reload() {
            this.destroy()
            this.$nextTick(() => this.init())
        },
        refresh() {
            this.scroll.update()
            if (this.autoScroll) this.ScrollToBottom()
        },
        ScrollToTop() {
            setTimeout(() => {
                //  ( destX, destY [, duration] )
                this.scroll.scrollTo(0, 0, 500)
            }, this.refreshDelay)
        },
        ScrollToBottom() {
            setTimeout(() => {
                this.scroll.scrollTo(0, this.bottom, 10)
            }, this.refreshDelay)
        },
        destroy() {
            if (this.scroll !== null) {
                this.scroll.destroy(this.$refs.scrollContainer)
                this.scroll = null
            }
        }
    },
    mounted() {
        // 保证在DOM渲染完毕后初始化better-scroll
        //setTimeout(() => {
        //  this.init()
        //}, 20)
        this.$nextTick(() => this.init())
    }
}
</script>
