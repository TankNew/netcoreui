<style scoped>
.editor-container {
  position: relative;
  max-width: 100%;
}
.editor {
  min-height: 300px;
  max-height: 32767px;
  background-color: #fff;
  position: relative;
  border: 1px solid #999;
  border-radius: 4px;
  padding: 20px;
  outline: none;
  overflow-x: auto;
  box-shadow: 0 0 3px #999;
}
#editorToolbar {
  position: absolute;
  top: -70px;
  left: 0;
  z-index: 10;
}
</style>
<template>
  <section
    :style="{ width: editorWidth + 'px', marginTop: editorTop + 'px' }"
    class="editor-container"
    ref="editorContainer"
  >
    <div ref="editorToolbar" id="editorToolbar"></div>
    <file
      :fileShow="fileShow"
      :fileCallBack="fileCallBack"
      @fileClose="fileClose"
    ></file>
    <div
      :id="tinymceId"
      ref="editorContainer"
      class="editor"
      :style="minHeight"
      v-html="initial"
      @blur="refreshScroll"
      @keyup="refreshScroll"
    ></div>
  </section>
</template>
<script>
import file from '@/components/custom/tankFiler'
import { v4 as uuidv4 } from 'uuid'
export default {
  name: 'tinymce',
  data() {
    return {
      tinymceId: this.id || 'vue-tinymce' + uuidv4(),
      fileShow: false,
      // 延迟滚动，减少压力
      roll: null
    }
  },
  components: {
    file
  },
  computed: {
    minHeight() {
      return `min-height: ${this.height}px`
    }
  },
  watch: {
    scorllTopLength(val) {
      let maxtop = val - this.$refs.editorContainer.offsetTop + 70
      if (maxtop < 0) maxtop = 0
      if (maxtop >= 0) {
        maxtop -= 70
        this.$refs.editorToolbar.style.top = Math.round(maxtop) + 'px'
        // if (this.roll) clearTimeout(this.roll)
        // this.roll = setTimeout(() => {
        //     this.$refs.editorToolbar.style.top = Math.round(maxtop) + 'px'
        //     this.roll = null
        // }, 20)
      }
    }
  },
  props: {
    scollMinTop: {
      type: Number,
      default: 0
    },
    scorllTopLength: {
      type: Number,
      default: 0
    },
    id: {
      type: String,
      default: null
    },
    editorWidth: {
      type: Number,
      default: 800
    },
    editorTop: {
      type: Number,
      default: 0
    },
    initial: {
      type: String,
      default: null
    },
    height: {
      type: Number,
      default: 300
    }
  },
  methods: {
    init(inline = true) {
      var that = this
      tinymce.init({
        selector: `#${this.tinymceId}`,
        //当键盘抬起时的事件
        init_instance_callback: function (editor) {
          editor.on('keyup', function (e) {
            //console.log(editor.getContent())
          })
        },
        inline: inline,
        fixed_toolbar_container: '#editorToolbar',
        //theme: 'modern',
        //skin: 'lightgray',
        language: 'zh_CN',
        //element_format : 'html',
        visualblocks_default_state: false, //默认开启区块
        menubar: false,
        // height: 640,
        //max_height: 700,
        autoresize_bottom_margin: 10,
        autoresize_min_height: 400, // 自动调整最小高度
        //autoresize_max_height: 700, //自动调整最大高度
        image_advtab: true, //image advance optionhttp://localhost/

        paste_remove_styles_if_webkit: false,
        forced_root_block: 'div',
        plugin_preview_width: 800,
        plugin_preview_height: 600,
        relative_urls: false,
        imagetools_toolbar:
          'rotateleft rotateright | flipv fliph | editimage imageoptions', //image tools
        imagetools_cors_hosts: ['ednet.cn', 'localhost', '103.24.231.235'], //image tools hosts

        plugins: [
          'advlist anchor autolink autoresize charmap code colorpicker contextmenu directionality emoticons fullscreen',
          'hr image imagetools insertdatetime link lists media nonbreaking',
          'pagebreak paste preview print searchreplace spellchecker table template textcolor textpattern visualblocks visualchars wordcount'
        ],
        toolbar: [
          ' undo redo bullist numlist outdent indent alignleft aligncenter alignright alignjustify link | image | picload insertdatetime template',
          'fontsizeselect fontselect styleselect | bold italic underline forecolor backcolor removeformat hr blockquote visualblocks'
        ],

        //right click
        contextmenu:
          'paste inserttable insertdatetime | link | bold underline formats removeformat | preview  | code',

        //font_formats: '微软雅黑=微软雅黑;宋体=宋体;黑体=黑体;楷体=楷体;仿宋=仿宋;', // font setting
        // content_css: '../static/css/bootstrap.css', // 内容适应的CSS样式表，最好与前台保持一致
        content_style: 'body {font-size: 14px; font-family: 微软雅黑; }',
        font_formats:
          'Arial=arial,helvetica,sans-serif;' +
          'Arial Black=arial black,avant garde;' +
          'Courier New=courier new,courier;' +
          'Times New Roman=times new roman,times;' +
          'Verdana=verdana,geneva;' +
          '微软雅黑=微软雅黑;宋体=宋体;黑体=黑体;楷体=楷体;仿宋=仿宋;',

        fontsize_formats: '9px 10px 12px 14px 18px 24px 36px',
        setup: function (editor) {
          editor.addButton('picload', {
            text: '文件管理器',
            icon: 'emoticons',
            tooltip: '文件管理器',
            onclick: function () {
              that.loadFileManage()
            }
          })
          editor.addMenuItem('myMenuItem', {
            text: '文件管理器',
            icon: 'image',
            onclick: function () {
              that.loadFileManage()
            }
          })
          editor.addMenuItem('myformat', {
            text: '引用',
            icon: 'blockquote',
            onClick: function (e) {
              editor.execCommand(
                'mceBlockQuote',
                false,
                e.control.settings.commentText
              )
            }
          })
        },
        style_formats: [
          { title: 'Head 1', format: 'h1' },
          { title: 'Head 2', format: 'h2' },
          { title: 'Head 3', format: 'h3' },
          { title: 'Head 4', format: 'h4' },
          { title: 'Head 5', format: 'h5' },
          { title: 'Head 6', format: 'h6' },
          { title: '正文', format: 'p' }
        ],
        template_cdate_classes: 'cdate creationdate',
        template_cdate_format: '%Y/%m/%d',
        template_popup_height: '600',
        template_popup_width: '950',
        templates: [
          {
            title: '公司简介类模板',
            description: '适用于《公司简介》《关于我们》等描述性模块',
            url: '/static/template/tmp.html'
          }
        ]
      })
      console.log('tinymce loaded id= ' + this.tinymceId)
    },
    reload() {
      this.destroy()
      this.$nextTick(() => this.init())
    },
    destroy() {
      if (tinymce.get(this.tinymceId) != null) {
        console.log('tinymce destroyed')
        tinymce.get(this.tinymceId).remove()
      }
    },
    getVal() {
      return tinymce.get(this.tinymceId).getContent()
    },
    setVal(val) {
      tinymce.get(this.tinymceId).setContent(val)
    },
    loadFileManage() {
      this.fileShow = true
    },
    fileClose() {
      this.fileShow = false
    },
    //编辑器选择文件
    fileCallBack(fileUrl) {
      if (fileUrl != null) {
        var fileType = fileUrl
          .substring(fileUrl.lastIndexOf('.') + 1, fileUrl.length)
          .toLowerCase()

        var decodeFileUrl = decodeURIComponent(fileUrl)
        var fileName = decodeFileUrl.substring(
          decodeFileUrl.lastIndexOf('/') + 1,
          decodeFileUrl.lastIndexOf('.')
        )

        var imagetype = ['jpg', 'png', 'gif']
        var videotype = ['mp4', 'ogg', 'webm']
        var pdftype = ['7z', 'rar', 'zip', 'pdf', 'xls', 'xlsx', 'doc', 'docx']

        if (imagetype.indexOf(fileType) > -1) {
          tinymce.activeEditor.insertContent(
            '<img src="' + fileUrl + '" style="max-width:100%;">'
          )
        } else if (videotype.indexOf(fileType) > -1)
          tinymce.activeEditor.insertContent(
            '<video autoplay="autoplay"><source src="' +
              fileUrl +
              '">your browser does not support the video tag</video>'
          )
        else if (pdftype.indexOf(fileType) > -1)
          tinymce.activeEditor.insertContent(
            '<a href="' + fileUrl + '">' + fileName + '</a>'
          )

        //tinymce.get("editor1").execCommand('mceInsertContent', false, fileUrl)
      }
    },
    refreshScroll() {
      this.$emit('refreshScroll')
    },
    reloadScroll() {
      this.$emit('reloadScroll')
    }
  },
  mounted() {
    console.log(this.$refs.editorToolbar.offsetTop)
    // this.$nextTick(() => this.init())
  }
}
</script>
