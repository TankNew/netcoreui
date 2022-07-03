<style scoped>
.breadcrumb {
  min-height: 42px;
}
</style>
<template>
  <div ref="moveNodeRef">
    <!-- 过渡动画 -->
    <transition name="fade">
      <div class="file-view" v-if="fileShow" @contextmenu="rightClickNull($event)">
        <context-menu id="context-menu" ref="ctxMenu" @ctx-open="onCtxOpen">
          <li @click="folderCreate"><i class="far fa-plus-square mr-1"></i>创建子文件夹</li>
          <li @click="folderDelete" :class="isRoot ? 'disabled' : ''">
            <i class="far fa-minus-square mr-1"></i>删除
          </li>
        </context-menu>

        <context-menu id="list-menu" ref="listMenu">
          <li @click="fileDelete"><i class="far fa-minus-square mr-1"></i>删除</li>
        </context-menu>

        <!-- 遮罩层 -->
        <div class="file-container" ref="fileContainer">
          <div class="progress-container" v-if="isUploading">
            <p class="lead">上传中 {{ uploadPercentage }}%</p>
            <b-progress :value="uploadPercentage" class="m-3 w-100" height="4px"></b-progress>
          </div>
          <div class="file-toolbar" @mousedown="mousedown($event)">
            <span class="file-close-bar" @click="close">
              <i class="fa-times fas"></i>
            </span>
            <h6>
              文件管理器
              <code>v1.1</code>
            </h6>
            <dl class="file-menu">
              <dd>
                <a href="javascript:void(0)" @click="back">
                  <i class="far fa-arrow-alt-circle-left"></i>
                </a>
              </dd>
              <dd>
                <a href="javascript:void(0)" @click="refresh">
                  <i class="fas fa-sync-alt"></i>
                </a>
              </dd>
              <dd>
                <a href="javascript:void(0)" @click="setting">
                  <i class="fas fa-cog"></i>
                </a>
              </dd>
              <dd>
                <label for="uploadfiles">
                  <i class="fas fa-file-upload"></i>
                </label>
                <b-form-file
                  id="uploadfiles"
                  v-model="uploadfiles"
                  class="d-none"
                  plain
                  multiple
                  @input="upload"
                  >上传</b-form-file
                >
              </dd>
              <dd>
                <a href="javascript:void(0)" @click="setnull">
                  <i class="fas fa-ban"></i>
                </a>
              </dd>
            </dl>
          </div>
          <div class="row file-content">
            <!--目录列表-->
            <div class="col-2 file-folder-container">
              <smooth-scroll ref="fileFolderView" :data="Folders" :autoScroll="false">
                <ul class="file-folder">
                  <folder-li
                    v-for="(child, i) in Folders"
                    :isRoot="true"
                    :key="i"
                    :folder="child"
                    :index="i"
                    :parent="null"
                    :breadcrumb="breadcrumb"
                    @disActive="disActive"
                    @rightClick="rightClick"
                    @setCurrentFolder="setCurrentFolder"
                    @setBreadcrumb="setBreadcrumb"
                  ></folder-li>
                </ul>
              </smooth-scroll>
            </div>
            <!--活动目录内容-->
            <div class="col-10 file-list" @click="cancelCurrentFile">
              <Loading :isLoading="isLoading" style="border-radius: 0"></Loading>
              <ol class="breadcrumb">
                <li
                  :class="['breadcrumb-item', item.value == currentFolder ? 'active' : '']"
                  v-for="(item, index) in breadcrumb"
                  :key="index"
                  @click.stop="breadcrumbClick(item.value, index)"
                >
                  {{ item.text }}
                </li>
              </ol>
              <div class="file-folder-list">
                <smooth-scroll ref="fileListView" :autoScroll="false">
                  <dl>
                    <dd
                      v-for="(item, index) in mapFolder"
                      :key="index"
                      @click.stop="fileLeftClick(item)"
                      @dblclick.stop="fileDbClick(item)"
                      :class="currentFile == item ? 'active' : ''"
                      @contextmenu="fileRightClick($event, item)"
                    >
                      <p v-if="item.isSubdir">
                        <i class="fas fa-folder"></i>
                      </p>

                      <p v-else>
                        <i
                          class="fas fa-file-archive"
                          v-if="getFileExpansion(item.name) === 'zip'"
                        ></i>
                        <i
                          class="fas fa-file-word"
                          v-else-if="getFileExpansion(item.name) === 'word'"
                        ></i>
                        <i
                          class="fas fa-file-excel"
                          v-else-if="getFileExpansion(item.name) === 'excel'"
                        ></i>
                        <i
                          class="fas fa-file-pdf"
                          v-else-if="getFileExpansion(item.name) === 'pdf'"
                        ></i>
                        <i
                          class="fas fa-file-video"
                          v-else-if="getFileExpansion(item.name) === 'video'"
                        ></i>
                        <img
                          v-else-if="getFileExpansion(item.name) === 'img'"
                          :src="getImgUrl(item.url)"
                        />
                      </p>
                      <span>{{ item.name }}</span>
                    </dd>
                  </dl>
                </smooth-scroll>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import tools from 'tools'
import folderLi from './folderLi'
import AppConsts from '@/utiltools/appconst'
import swal from 'sweetalert'
import contextMenu from 'vue-context-menu'
import smoothScroll from './smoothScroll'
import Loading from './loading'
import '@/assets/tankFiler.less'
export default {
  components: { contextMenu, smoothScroll, Loading, folderLi },
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
      currentFolder: {
        subdir: []
      },
      //当前文件夹的父文件夹
      currentFolderParent: {},
      //是否首目录
      isRoot: false,
      RootPath: null,
      Folders: []
    }
  },
  watch: {
    fileShow: {
      handler(newVal) {
        if (newVal) {
          this.load()
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    mapFolder() {
      let folders = this.currentFolder.subdir.filter(x => x.isSubdir)
      let files = this.currentFolder.subdir.filter(x => !x.isSubdir)
      return folders.concat(files)
    }
  },
  props: {
    fileShow: {
      type: Boolean,
      default: false
    },
    fileCallBack: {}
  },
  methods: {
    //取消选中
    cancelCurrentFile() {
      this.currentFile = null
      this.isUploading = false
    },
    //后退
    back() {
      if (this.breadcrumb.length > 1) {
        this.breadcrumb.splice(-1)
        this.setCurrentFolderByBreadcrumb(this.breadcrumb[this.breadcrumb.length - 1].value)
      }
    },
    //刷新
    refresh() {
      this.load()
    },
    //设置
    setting() {
      console.log('setting')
    },
    //获取数据
    load() {
      var that = this
      that.isLoading = true
      this.$axios.get(tools.fileUrl).then(function (response) {
        var json = response.data.result
        that.RootPath = json.rootPath
        that.Folders = json.folderInfos
        that.setTypeRoot(that.Folders[0])
        that.isLoading = false
      })
    },
    upload() {
      var that = this
      let formdata = new FormData()
      formdata.append('folder', that.currentFolder.url)
      that.uploadfiles.forEach(u => formdata.append('file', u))
      //清空input=file的值，否则不能二次上传同名文件
      document.getElementById('uploadfiles').value = null
      that.isUploading = true
      that.uploadPercentage = 0

      this.$axios
        .post(tools.fileUpload, formdata, {
          onUploadProgress: function (progressEvent) {
            that.uploadPercentage = parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            )
          }
        })
        .then(function (response) {
          var json = response.data.result
          json.uploadFilesList.forEach(j => {
            that.currentFolder.subdir.forEach(c => {
              if (c.name === j.name)
                that.currentFolder.subdir.splice(that.currentFolder.subdir.indexOf(c), 1)
            })
            that.currentFolder.subdir.push(j)
          })
          that.isUploading = false
        })
        // eslint-disable-next-line handle-callback-err
        .catch(error => {
          that.isUploading = false
        })
    },
    // 删除file
    fileDelete() {
      var that = this
      that.currentFolder.subdir.splice(that.currentFolder.subdir.indexOf(that.currentFile), 1)
      // 如果是文件夹
      var url = tools.filedeletefolder + '?folderName=' + that.currentFile.url
      //如果是文件
      if (!that.currentFile.isSubdir) url = tools.fileDelete + '?fileName=' + that.currentFile.url

      that.$axios.delete(url)
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
    getImgUrl(val) {
      var that = this
      return AppConsts.remoteServiceBaseUrl + '/' + that.RootPath + val
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
        case 'jepg':
          return 'img'
        case 'svg':
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
    //面包屑导航点击
    breadcrumbClick(val, index) {
      var that = this
      that.setCurrentFolderByBreadcrumb(val)
      that.breadcrumb.splice(index + 1, that.breadcrumb.length - 1)
    },
    //文件左键
    fileLeftClick(val) {
      var that = this
      that.currentFile = val
    },
    // 双击
    fileDbClick(val) {
      var that = this
      if (that.currentFile.isSubdir) {
        that.breadcrumb.push({ text: that.currentFile.name, value: that.currentFile })
        that.setCurrentFolderByBreadcrumb(that.currentFile)
      } else {
        //that.$emit('MceSetFile', AppConsts.remoteServiceBaseUrl + '/' + that.currentFile.url)

        that.fileCallBack(
          AppConsts.remoteServiceBaseUrl + '/' + that.RootPath + that.currentFile.url
        )
        that.close()
      }
    },
    // 文件右键
    fileRightClick(e, val) {
      this.currentFile = val
      this.$refs.listMenu.open()
      e.preventDefault()
    },

    // 导航 - 设置当前内容
    setCurrentFolderByBreadcrumb(val) {
      var that = this
      that.currentFolder.open = true
      that.currentFolder.isActive = false
      this.setCurrentFolder(val)
    },
    /*内容部分的操作结束*/

    /*左侧文件夹操作*/
    // 子目录- 设置当前内容
    setCurrentFolder(val) {
      this.currentFolder = val
      this.currentFolder.isActive = true
      this.currentFile = ''
    },
    //子目录- 同步组件内导航数据
    setBreadcrumb(val) {
      this.breadcrumb = val
    },
    //禁用空白区域右键
    rightClickNull(e) {},
    //初始目录 - 定义右键菜单
    rightClick(e, item, bool, parent) {
      e.preventDefault()
      this.isRoot = bool
      this.$refs.ctxMenu.open(e, item)
      this.currentFolderParent = parent
    },
    // 添加子文件夹动作
    onCtxOpen(locals) {
      var that = this
      that.disActive()
      this.setCurrentFolder(locals)
    },
    //删除子文件夹
    folderDelete() {
      var that = this
      that.currentFolderParent.subdir.splice(
        that.currentFolderParent.subdir.indexOf(that.currentFolder),
        1
      )
      that.$axios.delete(tools.filedeletefolder + '?folderName=' + that.currentFolder.url)
      this.setCurrentFolder(this.currentFolderParent)
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
      }).then(name => {
        if (!name) console.log('name不能为空')
        else {
          var _newFloder = {
            name: name,
            isSubdir: true,
            url: that.currentFolder.url + '/' + encodeURIComponent(name),
            subdir: [],
            open: false,
            isActive: false
          }
          that.currentFolder.subdir.push(_newFloder)
          that.$axios
            .post(tools.fileCreatefolder + '?folderName=' + _newFloder.url)
            .then(function (response) {
              var json = response.data.result
              that.currentFolder.open = true
              swal.stopLoading()
              swal.close()
            })
        }
      })
    },
    //初始目录- 设置当前活动目录、设置当前路径、设置当前内容
    setTypeRoot(val) {
      var that = this
      that.disActive()
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
    disActive() {
      this.breadcrumb = []
      pick(this.Folders)
      function pick(_json) {
        _json.forEach(j => {
          j.isActive = false
          if (j.isSubdir) pick(j.subdir)
        })
      }
    },
    //关闭文件管理器
    close() {
      var that = this
      that.$emit('fileClose')
    },
    // 清空选择
    setnull() {
      this.fileCallBack(null)
      this.close()
    }
  },
  mounted() {
    this.$nextTick(() => {
      let moveNodeRef = this.$refs.moveNodeRef
      document.body.appendChild(moveNodeRef)
    })
  }
}
</script>

