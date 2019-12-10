<template>
    <section class="container-fluid">
        <p class="lead">
            <i class="far fa-copy text-primary mr-1"></i>
            {{contentTitle}}
        </p>
        <div class="news-edit-editmode">
            <label>编辑模式:</label>
            <button
                v-for="(ew,index) in editorWidths"
                :key="index"
                type="button"
                :class="['btn',editModeWidth==ew?'btn-secondary':'btn-light']"
                @click="putEditModeWidth(ew)"
            >{{ew}}</button>
        </div>
        <form @submit.stop.prevent="handleSubmit" autocomplete="off">
            <!--正文-->
            <tinymce
                ref="tinymceNews"
                @refreshScroll="refreshScroll"
                @reloadScroll="reloadScroll"
                :initial="page.content"
                :editorTop="0"
                :editorWidth="editModeWidth"
                :scollMinTop="86"
                :scorllTopLength="scorllTopLength"
                :height="600"
            ></tinymce>
            <p class="m-3">
                <button class="btn btn-primary py-2 px-5" type="submit">提交</button>
            </p>
        </form>
    </section>
</template>
<script>
import swal from 'sweetalert'
import tinymce from '@/components/custom/tinymce'
export default {
    name: 'page',
    data() {
        return {
            id: 0,
            editModeWidth: 900,
            editorWidths: [640, 800, 900, 1000, 1200],
            page: {},
            getUrl: '/api/services/app/Page/Get',
            deleteUrl: `/api/services/app/Page/Delete`,
            createUrl: `/api/services/app/Page/Create`,
            updateUrl: `/api/services/app/Page/Update`
        }
    },
    components: {
        tinymce
    },
    props: { contentTitle: String, scorllTopLength: Number },
    watch: {
        $route(val) {
            this.$nextTick(() => {
                this.id = parseInt(val.params.id)
                this.load()
            })
        }
    },
    methods: {
        //改变编辑器宽度
        putEditModeWidth(val) {
            var that = this
            this.$refs.tinymceNews.destroy()
            that.editModeWidth = val
            setTimeout(() => {
                this.$refs.tinymceNews.init()
            }, 20)
            //刷新滚动轴
            that.refreshScroll()
        },
        //刷新滚动轴
        refreshScroll() {
            this.$emit('refreshScroll')
        },
        reloadScroll() {
            this.$emit('reloadScroll')
        },
        handleSubmit(e) {
            this.page.content = this.$refs.tinymceNews.getVal()
            this.$validator.validateAll().then(async result => {
                if (result) {
                    this.$http.put(this.updateUrl, this.page)
                }
            })
        },
        load() {
            this.$http.get(this.getUrl, { params: { id: this.id } }).then(res => {
                var json = res.data.result
                this.page = json
            })
        }
    },
    async created() {
        this.id = parseInt(this.$route.params.id)
        this.load()
    },
    mounted() {
        // 开发调试
        this.$nextTick(() => {
            this.$refs.tinymceNews.init()
            this.$emit('reloadScroll')
        })
    },
    beforeDestroy: function() {
        this.$refs.tinymceNews.destroy()
    }
}
</script>
