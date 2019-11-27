<template>
    <div ref="wrapper" class="optiscroll">
        <slot></slot>
    </div>
</template>
<script>
import Optiscroll from 'optiscroll'
import 'optiscroll/dist/optiscroll.css'
Optiscroll.globalSettings.checkFrequency = 0
export default {
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
    mounted() {
        // 保证在DOM渲染完毕后初始化better-scroll
        //setTimeout(() => {
        //  this._initScroll()
        //}, 20)
        this.$nextTick(() => this._initScroll())
    },
    methods: {
        _initScroll() {
            var that = this
            if (!this.$refs.wrapper) {
                return
            }
            // better-scroll的初始化
            this.scroll = new Optiscroll(this.$refs.wrapper, {
                maxTrackSize: 100,
                minTrackSize: 20,
                wrapContent: false // Optiscroll will generate an element to wrap your content. If not, the first child will be used
            })

            if (this.autoScroll) this.ScrollToBottom()

            this.$nextTick(() => {
                that.$refs.wrapper.addEventListener('scroll', function(ev) {
                    that.$emit('scrollTop', ev.detail.scrollTop)
                })
            })
        },
        reload() {
            this.destroy()
            this.$nextTick(() => this._initScroll())
        },
        refresh() {
            // 代理better-scroll的refresh方法
            setTimeout(() => {
                this.scroll.update()
                if (this.autoScroll) this.scroll.scrollTo(false, 'bottom', 10)
            }, this.refreshDelay)
        },
        ScrollToTop() {
            setTimeout(() => {
                this.scroll.scrollTo(false, 'top', 500)
            }, this.refreshDelay)
        },
        ScrollToBottom() {
            setTimeout(() => {
                this.scroll.scrollTo(false, 'bottom', 10)
            }, this.refreshDelay)
        },
        destroy() {
            this.scroll.destroy()
        }
    },
    watch: {
        // 监听数据的变化，延时refreshDelay时间后调用refresh方法重新计算，保证滚动效果正常
        data() {
            this.refresh()
        }
    }
}
</script>
