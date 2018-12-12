<style scoped>
  .news-toolbar { margin-bottom: 20px; padding: 10px; background-color: aliceblue; }
  .attach-btn { display: inline-block; vertical-align: middle; padding: 0 20px; }
  .attach { display: inline-block; overflow: hidden; vertical-align: middle; margin: 0; padding-left: 20px; }
    .attach > li { margin: 10px; padding-bottom: 5px; border-bottom: 1px solid #ccc; display: inline-block; }
      .attach > li i { margin-left: 5px; font-size: 18px; cursor: pointer; }
  .news-topnum { cursor: pointer; display: inline-block; width: 32px; height: 32px; line-height: 32px; border-radius: 50%; color: #fff; background-color: #6699FF; }
    .news-topnum:hover { color: #fff; background-color: #3366FF; }
</style>
<template>
  <section class="container-fluid">
    <section v-if="editMode" style="height:100%; position:relative;">
      <file :fileShow="fileShow" :fileCallBack="fileCallBack" @fileClose="fileClose"></file>
      <div class="alert alert-success" role="alert">
        <i class="far fa-bell mx-1"></i>您当前正处于{{editModeTitle}}模式
        <button type="button" class="btn btn-secondary btn-sm mx-1 float-right" @click="_new">退出{{editModeTitle}}模式</button>
      </div>
      <b-form @submit="onSubmit" @reset="onReset" autocomplete="off" v-if="formShow">
        <b-form-group id="InputGroup1" label="标题:" label-for="Input1" description="请填写5-30个字的标题.">
          <b-form-input id="Input1" ref="focusThis" type="text" v-model="form.title" required placeholder="输入公告标题">
          </b-form-input>
        </b-form-group>

        <b-form-group id="InputGroup3" label="类别" label-for="Input3">
          <b-form-select id="Input3" :options="categorys" required v-model="form.category">
          </b-form-select>
        </b-form-group>

        <div class="news-toolbar">
          <label>编辑模式:</label>
          <button type="button" :class="['btn',editModeWidth==640?'btn-secondary':'btn-light']" @click="putEditModeWidth(640)">640</button>
          <button type="button" :class="['btn',editModeWidth==800?'btn-secondary':'btn-light']" @click="putEditModeWidth(800)">800</button>
          <button type="button" :class="['btn',editModeWidth==900?'btn-secondary':'btn-light']" @click="putEditModeWidth(900)">900</button>
          <button type="button" :class="['btn',editModeWidth==1000?'btn-secondary':'btn-light']" @click="putEditModeWidth(1000)">1000</button>
          <button type="button" :class="['btn',editModeWidth==1200?'btn-secondary':'btn-light']" @click="putEditModeWidth(1200)">1200</button>
        </div>
        <b-form-group id="Group2" label="正文" label-for="detail">
          <!--正文-->
          <section style="background-color:#f5f7f9; padding:20px;">
            <tinymce ref="tinymceNews" @refreshScroll="refreshScroll" @reloadScroll="reloadScroll"
                     :editorTop="70"
                     :editorWidth="editModeWidth"
                     :scollMinTop="386"
                     :scorllTopLength="scorllTopLength"></tinymce>
          </section>
        </b-form-group>
        <b-form-group id="Group4">
          <b-form-checkbox id="checkbox1" v-model="form.top">置顶</b-form-checkbox>
          <b-form-checkbox id="checkbox2" v-model="form.isfile">附件</b-form-checkbox>
          <b-button variant="primary" v-if="form.isfile" size="sm" @click="attachOpen">打开文件管理器</b-button>
          <ol class="attach" v-if="form.isfile">
            <li v-for="(f,i) in form.files" :key="i">
              <a :href="f.url">
                <i class="fas fa-file mr-1"></i>{{f.name}}
              </a>
              <i @click="attachDelete(i)" class="far fa-times-circle text-danger"></i>
            </li>
          </ol>
        </b-form-group>
        <hr />
        <b-button type="submit" variant="primary">确认</b-button>
        <b-button type="reset" variant="light">重置</b-button>
      </b-form>
    </section>
    <section v-show="!editMode">
      <!-- User Interface controls -->
      <dl class="mb-3 flex-column news-bar">
        <dt>
          <i class="fas fa-wrench mr-1 text-info"></i>快捷工具
        </dt>
        <dd>
          <b-input-group size="sm">
            <b-form-input v-model="filter" placeholder="关键词" />
            <b-input-group-append>
              <b-btn :disabled="!filter" @click="filter = ''">查找</b-btn>
            </b-input-group-append>
          </b-input-group>
        </dd>
        <dd>
          <b-input-group size="sm">
            <b-form-select v-model="sortBy" :options="sortOptions">
              <option slot="first" :value="null">-- 排序依据 --</option>
            </b-form-select>
            <b-form-select size="sm" :disabled="!sortBy" v-model="sortDesc" slot="append">
              <option :value="false">正序</option>
              <option :value="true">倒序</option>
            </b-form-select>
          </b-input-group>
        </dd>
        <dd>
          <b-form-group horizontal label="单页显示条目" class="mb-0" :label-cols="4">
            <b-form-select size="sm" :options="pageOptions" v-model="perPage" />
          </b-form-group>
        </dd>
      </dl>
      <div class="mb-3 ml-4">
        <button type="button" class="btn btn-primary btn-sm" @click="_new">
          <i class="fas fa-plus mr-2"></i>新增
        </button>
      </div>
      <!-- Main table element -->
      <div class="news-table">
        <section style="min-height: 300px;">
          <b-table show-empty :head-variant="'bTable'"
                   :hover="true"
                   :bordered="true"
                   stacked="md"
                   :items="items"
                   :fields="fields"
                   :current-page="currentPage"
                   :per-page="perPage"
                   :filter="filter"
                   :sort-by.sync="sortBy"
                   :sort-desc.sync="sortDesc"
                   :sort-direction="sortDirection"
                   @filtered="onFiltered">
            <template slot="top" slot-scope="row">
              <button type="button" @click.stop="_putTop(row.item)" :class="['btn','btn-sm',row.value?'btn-primary':'btn-light']">{{row.value?'取消':"置顶"}}</button>
            </template>
            <template slot="topnum" slot-scope="row">
              <span class="news-topnum" @click.stop="isChangeTopNum=!isChangeTopNum" v-if="!isChangeTopNum">
                {{row.value}}
              </span>
              <input class="form-control form-control-sm" v-else type="number" v-model="row.item.topnum" @keyup.enter.prevent="isChangeTopNum=!isChangeTopNum" />
            </template>
            <template slot="title" slot-scope="row">
              {{row.value}}
            </template>
            <template slot="category" slot-scope="row">
              {{row.value}}
            </template>
            <template slot="createtime" slot-scope="row">
              {{row.value}}
            </template>
            <template slot="isfile" slot-scope="row">
              {{row.value?'是':'否'}}
            </template>
            <template slot="actions" slot-scope="row">
              <!-- We use @click.stop here to prevent a 'row-clicked' event from also happening -->
              <b-button size="sm" @click.stop="rowClicked(row.item, row.index, $event.target)" class="mr-1">
                预览
              </b-button>
              <b-button size="sm" @click.stop="_edit(row.item, row.index, $event.target)" class="mr-1">
                编辑
              </b-button>
              <b-button size="sm" @click.stop="refreshScroll()" variant="light">
                删除
              </b-button>
            </template>
          </b-table>
        </section>

        <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />

        <!-- Info modal -->
        <b-modal id="modalInfo" @hide="resetModal" :title="modalInfo.title" ok-only @shown="focusMyElement" size="lg">
          <section class="scroll-container">
            <scroll ref="content" class="scroll" :autoScroll="false">
              <div ref="focusThis" v-html="modalInfo.content"></div>
            </scroll>
          </section>
        </b-modal>
      </div>
    </section>
  </section>
</template>
<script>
  import file from '@/components/custom/tankFiler'
  import tinymce from '@/components/custom/tinymce'
  //import Editor from '@tinymce/tinymce-vue'
  import scroll from './scroll'
  export default {
    data() {
      return {
        items: [],
        isChangeTopNum: false, // 修改顺序号标识
        formShow: true,
        isEditMode: false,
        editMode: false,
        editModeWidth: 800,
        fields: [
          {
            key: 'top',
            label: '置顶',
            class: 'text-center w5'
          },
          {
            key: 'topnum',
            label: '顺序号',
            sortable: true,
            sortDirection: 'desc',
            class: 'text-center w10'
          },
          { key: 'title', label: '标题', sortable: true, sortDirection: 'desc' },
          {
            key: 'category',
            label: '分类',
            sortable: true,
            class: 'text-center'
          },
          {
            key: 'createtime',
            label: '发布时间',
            sortable: true,
            class: 'text-center'
          },
          { key: 'isfile', label: '附件', class: 'text-center' },
          { key: 'actions', label: '操作', class: 'text-center w25' }
        ],
        currentPage: 1,
        perPage: 10,
        totalRows: 1,
        pageOptions: [5, 10, 15],
        sortBy: null,
        sortDesc: true,
        sortDirection: 'desc',
        filter: null,
        modalInfo: { title: '', content: '' },
        editRow: {},
        form: {},
        formModel: {},
        categorys: [
          { text: '选择分类', value: null },
          '通知',
          '重要通知',
          '公告',
          '特别公告'
        ],
        //无用设置tinymce
        editorInit: {
          selector: 'editor',
          inline: true
        },
        fileShow: false,
        //文件管理器回调函数
        fileCallBack: function (x) {
          console.log(x)
        }
      }
    },
    props: ['data', 'scorllTopLength'],
    components: {
      //'editor': Editor,
      file: file,
      scroll: scroll,
      tinymce: tinymce
    },
    watch: {
      //当页面变动时，收起所有打开的Detail
      currentPage() {
        this.items.forEach(i => {
          if (i._showDetails) i._showDetails = false
        })
      },
      //监测是否出于编辑状态
      editMode(val) {
        var that = this
        if (val === true)
          that.$nextTick(() => {
            this.$refs.tinymceNews._initScroll()
            this.$refs.tinymceNews.setVal(this.form.content)
          })
        else
          this.$refs.tinymceNews.destroy()
        //刷新滚动轴
        that.refreshScroll()
      },
      perPage() {
        this.refreshScroll()
      }
    },
    computed: {
      editModeTitle() {
        return this.isEditMode ? '编辑' : '新增'
      },
      editModeCss() {
        return 'width:' + this.editModeWidth + 'px'
      },
      sortOptions() {
        // Create an options list from our fields
        return this.fields.filter(f => f.sortable).map(f => {
          return { text: f.label, value: f.key }
        })
      }
    },
    methods: {
      //删除附件
      attachDelete(index) {
        this.form.files.splice(index, 1)
      },
      fileClose() {
        this.fileShow = false
      },
      //附件选择
      attachOpen() {
        this.fileShow = true
        this.fileCallBack = this.attachSet
      },
      attachSet(fileUrl) {
        var fileType = fileUrl
          .substring(fileUrl.lastIndexOf('.') + 1, fileUrl.length)
          .toLowerCase()
        var decodeFileUrl = decodeURIComponent(fileUrl)
        var fileName = decodeFileUrl.substring(
          decodeFileUrl.lastIndexOf('/') + 1,
          decodeFileUrl.lastIndexOf('.')
        )
        var json = { name: fileName + '.' + fileType, url: fileUrl }
        this.form.files.push(json)
      },

      //改变编辑器宽度
      putEditModeWidth(val) {
        var that = this
        this.$refs.tinymceNews.destroy()
        that.editModeWidth = val
        setTimeout(() => {
          this.$refs.tinymceNews._initScroll()
        }, 20)
        //刷新滚动轴
        that.refreshScroll()
      },
      //提交
      onSubmit(evt) {
        evt.preventDefault()
        this.form.content = this.$refs.tinymceNews.getVal()
        this.editRow.title = this.form.title
        this.editRow.category = this.form.category
        this.editRow.content = this.form.content
        this.editRow.topnum = this.form.topnum
        this.editRow.top = this.form.top
        this.editRow.isfile = this.form.isfile
        this.editRow.file = this.form.file
        this.editRow.createtime = this.form.createtime
        this.editRow.modifytime = this.form.modifytime
        this.editRow.files = this.form.files

        //这里异步更新到后端，并返回顺序号、ID
        //并更新数据

        this.editMode = false
        this.formModel = {}
        this.form = {}
        this.editRow = {}
      },
      //重置
      onReset(evt) {
        evt.preventDefault()
        /* Reset our form values */
        this.form = JSON.parse(JSON.stringify(this.formModel))
        /* 重置或者清除浏览器的验证状态 */
        this.$refs.tinymceNews.destroy()
        this.formShow = false
        this.$nextTick(() => {
          this.formShow = true
          setTimeout(() => {
            this.$refs.tinymceNews._initScroll()
          }, 20)
        })
      },
      //modal打开时焦点设置
      focusMyElement(e) {
        //this.$refs.focusThis.focus()
      },
      onFiltered(filteredItems) {
        // Trigger pagination to update the number of buttons/pages due to filtering
        this.totalRows = filteredItems.length
        this.currentPage = 1
      },
      //刷新滚动轴
      refreshScroll() {
        this.$emit('refreshScroll')
      },
      reloadScroll() {
        this.$emit('reloadScroll')
      },
      _putTop(item) {
        item.top = !item.top
      },
      //编辑
      _edit(item, index, button) {
        this.isEditMode = true
        this.editRow = item
        this.form = JSON.parse(JSON.stringify(item))
        this.formModel = JSON.parse(JSON.stringify(item))
        this.editMode = !this.editMode
      },
      //新增
      _new() {
        this.isEditMode = false
        this.editRow = {}
        this.formModel = {}
        this.form = {}
        this.editRow.category = null
        this.form.category = null
        this.formModel.category = null
        this.editMode = !this.editMode
      },
      //查看
      rowClicked(item, index, event) {
        var that = this
        this.modalInfo.title = item.title
        //this.modalInfo.content = JSON.stringify(item, null, 2)
        this.modalInfo.content = item.content
        this.$root.$emit('bv::show::modal', 'modalInfo')
        that.$nextTick(() => {
          setTimeout(() => {
            that.$refs.content.refresh()
          }, 20)
        })
      },
      //重置查看
      resetModal() {
        this.modalInfo.title = ''
        this.modalInfo.content = ''
      }
    },
    created() {
      var that = this
      that.items = that.data
      that.totalRows = that.items.length
      //重置所有展开状态
      this.items.forEach(i => {
        if (i._showDetails) i._showDetails = false
      })
      //特殊列增加颜色特性
      // this.items.forEach(i => { if (i.top) i._rowVariant = 'secondary' })
    },
    mounted: function () {
      var that = this
      // 开发调试
      that.$nextTick(() => {
        that.$emit('reloadScroll')
      })
    },
    beforeDestroy: function () {
      if (this.editMode)
        this.$refs.tinymceNews.destroy()
    }
  }
</script>
