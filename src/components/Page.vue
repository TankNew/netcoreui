<template>
  <section class="container-fluid">
    <p class="lead">
      <i class="far fa-copy text-primary mr-1"></i>
      {{contentTitle}}
    </p>
    <b-alert show dismissible>
      <b>Info:</b>单击左侧列表图标或者直接双击列表标题展开列表，单击列表标题在右侧进行编辑
    </b-alert>
    <form @submit.stop.prevent="handleSubmit" autocomplete="off">
      <!--正文-->
      <tinymce
        ref="tinymceNews"
        @refreshScroll="refreshScroll"
        @reloadScroll="reloadScroll"
        :initial="page.content"
        :editorWidth="editModeWidth"
        :scollMinTop="36"
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
            id: null,
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
    computed: {
        editModeWidth() {
            return abp.page.width
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
                    this.$axios.put(this.updateUrl, this.page).then(() => swal('操作成功!', '', 'success'))
                }
            })
        },
        load() {
            this.$axios.get(this.getUrl, { params: { id: this.id } }).then(res => {
                var json = res.data.result
                this.page = json
            })
        }
    },
    async created() {
        if (this.$route.params.id) this.id = parseInt(this.$route.params.id)
        this.load()
    },
    mounted() {
        // 开发调试
        this.$nextTick(() => {
            this.$refs.tinymceNews.init()
        })
    },
    beforeDestroy: function() {
        this.$refs.tinymceNews.destroy()
    }
}
</script>
