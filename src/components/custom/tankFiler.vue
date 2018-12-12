<style scoped>
  .breadcrumb { min-height: 42px; }
</style>
<template>
  <!-- 过渡动画 -->
  <transition name="fade">
    <div class="file-view" v-if="fileShow" @contextmenu="rightClickNull($event)">
      <context-menu id="context-menu" ref="ctxMenu" @ctx-open="onCtxOpen">
        <li @click="folderCreate"><i class="far fa-plus-square mr-1"></i>创建子文件夹</li>
        <li @click="folderDelete" :class="isRoot?'disabled':''"><i class="far fa-minus-square mr-1"></i>删除</li>
      </context-menu>

      <context-menu id="list-menu" ref="listMenu">
        <li @click="fileDelete"><i class="far fa-minus-square mr-1"></i>删除</li>
      </context-menu>

      <!-- 遮罩层 -->
      <div class="file-container" ref="fileContainer">
        <div class="progress-container" v-if="isUploading">
          <p class="lead">上传中 {{uploadPercentage}}%</p>
          <b-progress :value="uploadPercentage" class="m-3 w95" style="height:3px;"></b-progress>
        </div>
        <div class="file-toolbar"
             @mousedown="mousedown($event)">
          <span class="file-close-bar" @click="close"><i class="fa-times fas"></i></span>
          <h6>文件管理器 <code>v1.0</code></h6>
          <dl class="file-menu">
            <dd><a href="javascript:void(0)" @click="back"><i class="far fa-arrow-alt-circle-left"></i></a></dd>
            <dd><a href="javascript:void(0)" @click="refresh"><i class="fas fa-sync-alt"></i></a></dd>
            <dd><a href="javascript:void(0)" @click="setting"><i class="fas fa-cog"></i></a></dd>
            <dd>
              <label for="uploadfiles"><i class="fas fa-file-upload"></i></label>
              <b-form-file id="uploadfiles" v-model="uploadfiles" class="d-none"
                           plain
                           multiple
                           @input="upload">上传</b-form-file>
            </dd>
          </dl>
        </div>

        <div class="row file-content">
          <!--目录列表-->
          <div class="col-2 file-folder-container">

            <ul class="file-folder">

              <li v-for="(item,index) in Folders" :key="index" :class="item.open?'active':''">

                <i class="fas fa-chevron-right" @click="item.open=!item.open"></i>

                <!--<a :class="item.isActive?'active':''" @click="setActive(item)" @dblclick="item.open=!item.open">-->
                <a :class="item.isActive?'active':''" @click="oneClick($event,item)" @contextmenu="rightClick($event,item,true,null)">

                  <i :class="['far','mr-0',item.isActive?'fa-folder-open':'fa-folder']"></i>

                  {{item.describe}}
                </a>

                <file-fodler-ul :model=item.subdir
                                :index="index"
                                :breadcrumb="breadcrumb"
                                :parent="item"
                                @clearCurrent="clearCurrent"
                                @setCurrent="setCurrent"
                                @setCurrentFolder="setCurrentFolder"
                                @setBreadcrumb="setBreadcrumb"
                                @rightClick="rightClick" />

              </li>
            </ul>
          </div>
          <!--活动目录内容-->
          <div class="col-10 file-list" @click="cancelCurrentFile">
            <Loading :isLoading="isLoading" style="border-radius:0;"></Loading>
            <section ref="scroll1" class="scroll-container">
              <scroll ref="content" class="scroll" :data="currentFolder.subdir" :autoScroll="false">
                <section>
                  <ol class="breadcrumb">
                    <li :class="['breadcrumb-item',item.value==currentFolder?'active':'']" v-for="(item,index) in breadcrumb" :key="index" @click.stop="breadcrumbClick(item.value,index)">
                      {{item.text}}
                    </li>
                  </ol>
                  <dl>
                    <dd v-for="(item,index) in currentFolder.subdir" :key="index"
                        @click.stop="fileLeftClick(item)"
                        :class="currentFile==item?'active':''"
                        v-if="item.isSubdir"
                        @contextmenu="fileRightClick($event,item)">
                      <p v-if="item.isSubdir"><i class="fas fa-folder"></i></p>
                      <p v-else><img src="static/imgs/128.png" /></p>
                      <span>{{item.name}}</span>
                    </dd>
                    <dd v-for="(item1,index1) in currentFolder.subdir" :key="index1"
                        @click.stop="fileLeftClick(item1)"
                        :class="currentFile==item1?'active':''"
                        v-if="!item1.isSubdir"
                        @contextmenu="fileRightClick($event,item1)">
                      <p v-if="item1.isSubdir"><i class="fas fa-folder"></i></p>
                      <p v-else>
                        <i class="fas fa-file-archive" v-if="getFileExpansion(item1.name)==='zip'"></i>
                        <i class="fas fa-file-word" v-else-if="getFileExpansion(item1.name)==='word'"></i>
                        <i class="fas fa-file-excel" v-else-if="getFileExpansion(item1.name)==='excel'"></i>
                        <i class="fas fa-file-pdf" v-else-if="getFileExpansion(item1.name)==='pdf'"></i>
                        <i class="fas fa-file-video" v-else-if="getFileExpansion(item1.name)==='video'"></i>
                        <img v-else-if="getFileExpansion(item1.name)==='img'" :src="getUrl(item1.url)" />
                      </p>
                      <span>{{item1.name}}</span>
                    </dd>
                  </dl>
                </section>
              </scroll>
            </section>
          </div>
        </div>

      </div>
    </div>
  </transition>
</template>
<script>
  import tools from 'tools'
  import swal from 'sweetalert'
  import axios from 'axios'
  import contextMenu from 'vue-context-menu'
  import scroll from './scroll'
  import Loading from './loading'
  import '../../assets/tankFiler.css'
  export default {
    data() {
      return {
        isLoading: false,
        isUploading: false,
        uploadPercentage: 0,
        uploadfiles: null,
        // 当前文件
        currentFile: '',
        //当前文件夹所在目录
        breadcrumb: [],
        //当前文件夹
        currentFolder: {},
        //当前文件夹的父文件夹
        currentFolderParent: {},
        //是否首目录
        isRoot: false,
        Folders: [
          { name: 'files', describe: '文件', isSubdir: true, url: 'UserFiles/Files', subdir: [], open: false, isActive: false },
          { name: 'videos', describe: '视频', isSubdir: true, url: 'UserFiles/Videos', subdir: [], open: false, isActive: false },
          { name: 'images', describe: '图片', isSubdir: true, url: 'UserFiles/Images', subdir: [], open: false, isActive: false }
        ],
        //定义点击双击事件参数
        delay: 300,
        clicks: 0,
        timer: null
      }
    },
    components: { contextMenu, scroll, Loading },
    watch: {
    },
    computed: {
    },
    props: {
      fileShow: {
        type: Boolean,
        default: false
      },
      fileCallBack: {}
    },
    methods: {
      cancelCurrentFile() {
        this.currentFile = null
        this.isUploading = false
      },
      back() {
        if (this.breadcrumb.length > 1) {
          this.breadcrumb.splice(-1)
          this.setCurrentFolderByBreadcrumb(this.breadcrumb[this.breadcrumb.length - 1].value)
        }
      },
      refresh() {
        this.load()
      },
      setting() {
        console.log('setting')
      },
      upload() {
        var that = this
        let formdata = new FormData()
        formdata.append('folder', this.currentFolder.url)
        that.uploadfiles.forEach(u => formdata.append('file', u))
        //清空input=file的值，否则不能二次上传同名文件
        document.getElementById('uploadfiles').value = null

        that.isUploading = true
        that.uploadPercentage = 0

        that.$httpmulti.post(tools.fileUpload, formdata,
          {
            onUploadProgress: function (progressEvent) {
              that.uploadPercentage = parseInt(Math.round((progressEvent.loaded * 100) / progressEvent.total))
            }
          }
        ).then(function (response) {
          var json = response.data
          json.uploadFilesList.forEach(j => {
            that.currentFolder.subdir.forEach(c => {
              if (c.name === j.name)
                that.currentFolder.subdir.splice(that.currentFolder.subdir.indexOf(c), 1)
            })
            that.currentFolder.subdir.push(j)
          })
          that.isUploading = false
        }, function (error) {
          if (error.response) {
            swal({
              title: 'Error:' + error.response.status + '.' + error.response.data,
              icon: 'error'
            })
          } else if (error.request) {
            console.log(error.request)
          } else {
            console.log('Error', error.message)
          }
          console.log(error.config)
        })
      },
      //拖动
      mousedown(e) {
        var that = this
        var x = e.x
        var y = e.y
        var offsetX = that.$refs.fileContainer.offsetLeft
        var offsetY = that.$refs.fileContainer.offsetTop
        document.onmousemove = function (ev) {
          that.$refs.fileContainer.style.top = offsetY + ev.y - y + 'px'
          that.$refs.fileContainer.style.left = offsetX + ev.x - x + 'px'
        }
        document.onmouseup = function () {
          document.onmousemove = null
          document.onmouseup = null
        }
      },
      //图片获取链接
      getUrl(val) {
        return tools.HttpUrl + '/' + val
      },
      //获取文件名后缀
      getFileExpansion(file) {
        var fileExpansion = file.toLowerCase().split('.').splice(-1)
        switch (fileExpansion[0]) {
          case 'xls':
            return 'excel'
          case 'xlsx':
            return 'excel'
          case 'doc':
            return 'word'
          case 'docx':
            return 'word'
          case 'pdf':
            return 'pdf'
          case 'zip':
            return 'zip'
          case 'rar':
            return 'zip'
          case '7z':
            return 'zip'
          //视频
          case 'mp4':
            return 'video'
          case 'ogg':
            return 'video'
          case 'webm':
            return 'video'
          //图片
          case 'jpg':
            return 'img'
          case 'png':
            return 'img'
          case 'gif':
            return 'img'
          default:
            return 'file'
        }
      },
      /*内容部分的操作*/
      breadcrumbClick(val, index) {
        var that = this
        that.setCurrentFolderByBreadcrumb(val)
        that.breadcrumb.splice(index + 1, that.breadcrumb.length - 1)
      },
      //刷新内容
      refreshScroll() {
        this.$refs.content.reload()
      },
      //文件左键
      fileLeftClick(val) {
        this.clicks++
        if (this.clicks >= 2) this.clicks = 2
        if (this.clicks === 1) {
          var that = this
          that.currentFile = val
          that.timer = setTimeout(function () {
            if (that.clicks === 2) {
              if (that.currentFile.isSubdir) {
                that.breadcrumb.push({ text: that.currentFile.name, value: that.currentFile })
                that.setCurrentFolderByBreadcrumb(that.currentFile)
              }
              else {
                //that.$emit('MceSetFile', tools.HttpUrl + '/' + that.currentFile.url)
                that.fileCallBack(tools.HttpUrl + '/' + that.currentFile.url)
                that.close()
              }
            }
            that.clicks = 0
            clearTimeout(that.timer)
          }, this.delay)
        }
      },
      // 文件右键
      fileRightClick(e, val) {
        this.currentFile = val
        this.$refs.listMenu.open()
        e.preventDefault()
      },
      // 删除file
      fileDelete() {
        var that = this
        that.currentFolder.subdir.splice(that.currentFolder.subdir.indexOf(that.currentFile), 1)

        var url = tools.filedeletefolder + '?foldername=' + that.currentFile.url
        if (!that.currentFile.isSubdir)
          url = tools.fileDelete + '?filename=' + that.currentFile.url

        that.$http.post(url).then(function (response) {
          var json = response.data
          console.log(json)
        }, function (error) {
          if (error.response) {
            swal({
              title: 'Error:' + error.response.status + '.' + error.response.data,
              icon: 'error'
            })
          } else if (error.request) {
            console.log(error.request)
          } else {
            console.log('Error', error.message)
          }
          console.log(error.config)
        })
      },
      // 导航 - 设置当前内容
      setCurrentFolderByBreadcrumb(val) {
        var that = this
        that.currentFolder.open = true
        that.currentFolder.isActive = false
        that.setCurrentFolder(val)
        that.currentFolder.open = true
        that.currentFolder.isActive = true
        that.currentFile = ''
      },
      /*内容部分的操作结束*/

      /*左侧文件夹操作*/

      // 子目录- 设置当前内容
      setCurrentFolder(val) {
        this.currentFolder = val
      },
      //子目录- 同步组件内导航数据
      setBreadcrumb(val) {
        this.breadcrumb = val
      },
      //子目录- 同步组件数据
      setCurrent(val, key) {
        var that = this
        that.Folders[key].subdir = val
        that.breadcrumb.unshift({ text: that.Folders[key].name, value: that.Folders[key] })
      },

      //禁用空白区域右键
      rightClickNull(e) {
        //e.preventDefault()
      },
      //初始目录 - 定义右键菜单
      rightClick(e, item, bool, parent) {
        this.isRoot = bool
        this.$refs.ctxMenu.open(e, item)
        this.currentFolderParent = parent
        e.preventDefault()
      },
      // 添加子文件夹动作
      onCtxOpen(locals) {
        var that = this
        locals.open = true
        that.currentFolder = locals
        if (that.isRoot)
          that.setActive(locals)
        that.currentFile = ''
      },
      //删除子文件夹
      folderDelete() {
        var that = this
        that.currentFolderParent.subdir.splice(that.currentFolderParent.subdir.indexOf(that.currentFolder), 1)
        that.$http.post(tools.filedeletefolder + '?foldername=' + that.currentFolder.url).then(function (response) {
          var json = response.data
          console.log(json)
        }, function (error) {
          if (error.response) {
            swal({
              title: 'Error:' + error.response.status + '.' + error.response.data,
              icon: 'error'
            })
          } else if (error.request) {
            console.log(error.request)
          } else {
            console.log('Error', error.message)
          }
          console.log(error.config)
        })
      },
      //增加子文件夹
      folderCreate() {
        var that = this
        swal({
          text: '输入子文件夹名称',
          content: 'input',
          button: {
            text: '确认',
            closeModal: false
          }
        })
          .then(name => {
            if (!name)
              console.log('name不能为空')
            else {
              var _newFloder = { name: name, isSubdir: true, url: that.currentFolder.url + '/' + name, subdir: [], open: false, isActive: false }
              that.currentFolder.subdir.push(_newFloder)
              that.$http.post(tools.fileCreatefolder + '?foldername=' + _newFloder.url).then(function (response) {
                var json = response.data
              }, function (error) {
                if (error.response) {
                  swal({
                    title: 'Error:' + error.response.status + '.' + error.response.data,
                    icon: 'error'
                  })
                } else if (error.request) {
                  console.log(error.request)
                } else {
                  console.log('Error', error.message)
                }
                console.log(error.config)
              })
            }
            swal.stopLoading()
            swal.close()
          })
      },
      //初始目录 -定义点击双击事件
      oneClick: function (event, item) {
        this.clicks++
        if (this.clicks >= 2) this.clicks = 2
        if (this.clicks === 1) {
          var that = this
          that.setActive(item)
          that.timer = setTimeout(function () {
            if (that.clicks === 2)
              item.open = !item.open
            that.clicks = 0
            clearTimeout(that.timer)
          }, this.delay)
        }
      },
      //初始目录- 设置当前活动目录、设置当前路径、设置当前内容
      setActive(val) {
        var that = this
        that.clearCurrent()
        val.isActive = true
        that.currentFolder = val
        that.breadcrumb = [
          {
            text: val.name,
            value: val
          }
        ]
      },
      //所有目录- 清除当前活动目录
      clearCurrent() {
        this.breadcrumb = []
        pick(this.Folders)
        function pick(_json) {
          _json.forEach(j => {
            j.isActive = false
            if (j.isSubdir)
              pick(j.subdir)
          })
        }
      },
      //关闭文件管理器
      close() {
        var that = this
        that.$emit('fileClose')
      },
      //获取数据
      load() {
        var that = this
        that.isLoading = true
        this.$http.get(tools.fileUrl + '?type=File').then(function (response) {
          var json = response.data
          that.Folders.forEach(f => {
            if (f.name === 'files')
              f.subdir = json
          })
          // console.log(response.status)
        }, function (error) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            swal({
              title: 'Error:' + error.response.status + '.' + error.response.data,
              icon: 'error'
            })
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request)
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message)
          }
          console.log(error.config)
        })
        this.$http.get(tools.fileUrl + '?type=Video').then(function (response) {
          var json = response.data
          that.Folders.forEach(f => {
            if (f.name === 'videos')
              f.subdir = json
          })
        }, function (error) {
          if (error.response) {
            swal({
              title: 'Error:' + error.response.status + '.' + error.response.data,
              icon: 'error'
            })
          } else if (error.request) {
            console.log(error.request)
          } else {
            console.log('Error', error.message)
          }
          console.log(error.config)
        })
        this.$http.get(tools.fileUrl + '?type=Image').then(function (response) {
          var json = response.data
          that.Folders.forEach(f => {
            if (f.name === 'images') {
              f.subdir = json
              that.setActive(f)
              that.isLoading = false
            }
          })
        }, function (error) {
          if (error.response) {
            swal({
              title: 'Error:' + error.response.status + '.' + error.response.data,
              icon: 'error'
            })
          } else if (error.request) {
            console.log(error.request)
          } else {
            console.log('Error', error.message)
          }
          console.log(error.config)
        })
      }
    },
    created() {
      this.load()
    },
    mounted() {
      var that = this
      that.$nextTick(() => {
      })
    }
  }
</script>

