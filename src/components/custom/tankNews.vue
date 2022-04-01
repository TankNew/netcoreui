<template>
  <section>
    <section v-show="editMode" class="news-edit-editmode">
      <div class="alert alert-success" role="alert">
        <i class="far fa-bell mx-1"></i>
        您当前正处于{{editModeTitle}}模式
        <button
          type="button"
          class="btn btn-secondary btn-sm mx-1 float-right"
          @click="outEditMode"
        >退出{{editModeTitle}}模式</button>
      </div>
      <div class="mb-3 center isTop isHot">
        <b-button-group>
          <b-button
            class="px-5"
            :variant="form.isTop?'primary':'light'"
            @click="form.isTop=!form.isTop"
          >置顶</b-button>
          <b-button
            class="px-5"
            :variant="form.isHot?'warning':'light'"
            @click="form.isHot=!form.isHot"
          >热门</b-button>
        </b-button-group>
      </div>
      <div class="mb-3 center" v-if="hasCover">
        <div class="news-cover">
          <img :src="getCover()" @click="coverOpen" />
        </div>
      </div>
      <file
        v-if="hasCover"
        :fileShow="fileShow"
        :fileCallBack="fileCallBack"
        @fileClose="fileClose"
      ></file>
      <b-form
        v-if="formShow"
        @submit.stop.prevent="onSubmit"
        @reset="onReset"
        autocomplete="off"
        data-vv-scope="form-update"
      >
        <b-form-group
          id="InputGroup1"
          label="标题:"
          label-for="title"
          description="请填写5-30个字的标题."
        >
          <b-form-input
            id="title"
            type="text"
            v-model="form.title"
            name="标题"
            :state="!errors.has('form-update.标题') "
            v-validate="'required'"
            placeholder="标题"
          ></b-form-input>
        </b-form-group>

        <b-form-group id="InputGroup3" label="类型" label-for="mark">
          <b-form-select id="mark" :options="marks" v-model="form.mark">
            <option slot="first" :value="null">无</option>
          </b-form-select>
        </b-form-group>

        <b-form-group
          label="标签"
          label-for="tags"
          description="多个标签用英文逗号”,“隔开"
        >
          <b-form-input
            id="title"
            type="text"
            v-model="form.tagsStr"
            name="标签"
            placeholder="标签1,标签2,标签3"
          ></b-form-input>
        </b-form-group>

        <div v-if="hasAttach" class="news-img-with-info">
          <label>图片组</label>
          <draggable
            tag="ul"
            :disabled="dragging"
            v-model="form.pictureWithInfos"
            :animation="200"
            :group="{ name: `pictureWithInfosDrag`}"
            :ghost-class="'ghost'"
          >
            <li
              v-for="(f,i) in form.pictureWithInfos"
              :key="i"
              @click="editPicture(f,i)"
            >
              <img :src="f.picUrl" />
              <i class="fas fa-times fa-lg" @click.stop="attachDelete(i)"></i>
            </li>
            <li class="add" @click="addPicture">
              <span>
                <i class="fas fa-plus mr-1"></i>添加图片
              </span>
            </li>
          </draggable>
        </div>
        <label>正文</label>
        <b-form-group>
          <!--正文-->
          <tinymce
            ref="tinymceNews"
            @refreshScroll="refreshScroll"
            @reloadScroll="reloadScroll"
            :editorTop="editorTop"
            :initial="form.content"
            :editorWidth="editModeWidth"
            :scollMinTop="scollMinTop"
            :scorllTopLength="scorllTopLength"
          ></tinymce>
        </b-form-group>

        <hr />
        <b-button type="submit" variant="primary">确认</b-button>
        <b-button type="reset" variant="light">重置</b-button>
      </b-form>
      <b-modal
        v-if="hasAttach"
        ref="attachModal"
        size="lg"
        scrollable
        :ok-title="'确认'"
        :cancel-title="'取消'"
        :title="attachModalName"
        @ok="attachModalOk"
        @hidden="attachModalHide"
      >
        <file
          :fileShow="attachShow"
          :fileCallBack="attachCallBack"
          @fileClose="attachClose"
        ></file>
        <div class="mb-3 center">
          <div class="news-cover" @click="attachOpen">
            <img :src="getPicture()" />
          </div>
        </div>
        <b-form
          @submit.stop.prevent="attachModalSubmit"
          autocomplete="off"
          data-vv-scope="form-picture"
        >
          <b-form-group
            label="图片地址:"
            label-for="p-url"
            description="选取图片库自动生成链接，或者手动填写外链."
          >
            <b-form-input
              id="p-url"
              type="text"
              v-model="currentPicture.picUrl"
              name="图片地址"
              :state="!errors.has('form-picture.图片地址') "
              v-validate="'required'"
              placeholder="图片地址"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="标题:"
            label-for="p-title"
            description="请填写5-30个字的标题."
          >
            <b-form-input
              id="p-title"
              type="text"
              v-model="currentPicture.picTitle"
              name="图片标题"
              placeholder="图片标题"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="描述:"
            label-for="p-content"
            description="简单的文字描述，不允许换行以及链接."
          >
            <b-form-textarea
              id="p-content"
              v-model="currentPicture.picContent"
              placeholder="文字描述"
            ></b-form-textarea>
          </b-form-group>
        </b-form>
      </b-modal>
    </section>
    <section v-show="!editMode">
      <!-- Info modal -->
      <b-modal
        id="modalInfo"
        size="lg"
        ok-only
        :title="modalInfo.title"
        @shown="modalInfoShow"
        @hidden="modalInfoHide"
      >
        <section class="scroll-container">
          <smooth-scroll ref="modalInfoView" :autoScroll="false">
            <div ref="focusThis" v-html="modalInfo.content"></div>
          </smooth-scroll>
        </section>
      </b-modal>
      <div>
        <b-alert show dismissible>
          <b>Info:</b> 拖动条目即可排序（稍后上线）。选择快捷工具‘单页显示条目’可改变显示的条目总数。
        </b-alert>
      </div>
      <label>
        <i class="fas fa-wrench mx-2 text-info"></i>快捷工具
      </label>
      <!-- User Interface controls -->
      <dl class="news-bar">
        <dd>
          <b-input-group size="sm">
            <b-form-input
              v-model="keyWord"
              placeholder="关键词"
              @keyup.enter.prevent="search(keyWord)"
            />
            <b-input-group-append>
              <b-btn @click="search(keyWord)">查找</b-btn>
            </b-input-group-append>
          </b-input-group>
        </dd>
        <dd>
          <b-input-group size="sm">
            <b-form-select v-model="sortBy" :options="sortOptions">
              <option slot="first" :value="null">-- 排序依据 --</option>
            </b-form-select>
            <b-form-select
              size="sm"
              :disabled="!sortBy"
              v-model="sortDesc"
              slot="append"
            >
              <option :value="false">正序</option>
              <option :value="true">倒序</option>
            </b-form-select>
          </b-input-group>
        </dd>
        <dd>
          <b-input-group size="sm" append="单页条目">
            <b-form-select size="sm" :options="pageOptions" v-model="perPage" />
          </b-input-group>
        </dd>
      </dl>
      <div class="mb-3 ml-4" v-if="(hasGroup&&!disableCreate)||!hasGroup">
        <button type="button" class="btn btn-primary btn-sm px-5" @click="_new">
          <i class="fas fa-plus mr-1"></i>新增
        </button>
      </div>
      <!-- Main table element -->
      <div class="news-table">
        <section style="min-height: 300px;">
          <b-table-simple hover responsive bordered>
            <colgroup>
              <col style="width:4rem;" />
              <col style="width:4rem;" />
              <col />
              <col v-if="hasGroup" style="width:8rem;" />
              <col style="width:6rem;" />
              <col style="width:12rem;" />
            </colgroup>
            <b-thead head-variant="light">
              <b-tr>
                <b-th class="text-center">置顶</b-th>
                <b-th class="text-center">序列号</b-th>
                <b-th class="text-center">标题</b-th>
                <b-th v-if="hasGroup" class="text-center">评分</b-th>
                <b-th v-if="hasGroup" class="text-center">分组</b-th>
                <b-th class="text-center">发布时间</b-th>
                <b-th class="text-center">操作</b-th>
              </b-tr>
            </b-thead>
            <b-tbody v-if="isBusy">
              <b-tr>
                <b-td colspan="12">
                  <div class="text-center text-info my-2">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong>Loading...</strong>
                  </div>
                </b-td>
              </b-tr>
            </b-tbody>

            <draggable
              v-else
              tag="b-tbody"
              :disabled="dragging"
              :list="items"
              :animation="200"
              :group="{ name: `news`}"
              :ghost-class="'ghost'"
              :move="onMove"
              @change="handleChange"
            >
              <b-tr v-for="(item,index) in items" :key="index">
                <b-th class="text-center">
                  <button
                    type="button"
                    @click.stop="_putTop(item)"
                    :class="['btn','btn-sm',item.isTop?'btn-primary':'btn-light']"
                  >{{item.isTop?'取消':"置顶"}}</button>
                </b-th>
                <b-td class="text-center">
                  <span class="news-number">{{parseInt(item.id)}}</span>
                </b-td>
                <b-td class="text-limit">
                  <span >{{item.title}}</span>
                </b-td>
                <b-td v-if="hasGroup" class="text-center">{{item.star}}</b-td>
                <b-td
                  v-if="hasGroup"
                  class="text-center"
                >{{item.catalogGroup.displayName}}</b-td>
                <b-td class="text-center">{{formatTime(item.creationTime)}}</b-td>
                <b-td class="text-center">
                  <b-button
                    size="sm"
                    @click.stop="rowClicked(item, item.index, $event.target)"
                    class="mr-1"
                    variant="light"
                  >预览</b-button>
                  <b-button
                    size="sm"
                    @click.stop="_edit(item, item.index, $event.target)"
                    class="mr-1"
                    variant="info"
                  >编辑</b-button>
                  <b-button
                    size="sm"
                    @click.stop="_delete(item, item.index, $event.target)"
                    variant="dark"
                  >删除</b-button>
                </b-td>
              </b-tr>
            </draggable>
            <b-tfoot>
              <b-tr>
                <b-td colspan="12" variant="light" class="text-left">
                  Total Rows:
                  <b>{{totalRows}}</b>
                </b-td>
              </b-tr>
            </b-tfoot>
          </b-table-simple>
        </section>
        <b-pagination
          pills
          align="center"
          :total-rows="totalRows"
          :per-page="perPage"
          v-model="currentPage"
          @change="pageChange"
          class="my-0"
        />
      </div>
    </section>
  </section>
</template>
<script>
import file from '@/components/custom/tankFiler'
import tinymce from '@/components/custom/tinymce'
import swal from 'sweetalert'
//import Editor from '@tinymce/tinymce-vue'
import smoothScroll from './smoothScroll'
import tools from '../../utiltools/tools'
import draggable from 'vuedraggable'

const baseFrom = {
    title: '',
    content: '',
    isTop: false,
    isHot: false,
    mark: null,
    pictureWithInfos: []
}
export default {
    name: 'tankNews',
    components: {
        //'editor': Editor,
        file: file,
        smoothScroll: smoothScroll,
        tinymce: tinymce,
        draggable: draggable
    },
    data() {
        return {
            marks: [],
            modalInfo: {},
            // isChangeTopNum: false, // 可编辑顺序号
            /**编辑模式设置 */
            isUpdate: false,
            editMode: false,
            editorWidths: [640, 800, 900, 1000, 1200],
            editRow: {},
            form: {},
            formShow: false,
            //无用设置tinymce
            editorInit: {
                selector: 'editor',
                inline: true
            },
            fileShow: false,
            fileCallBack: function(x) {},

            /*图片组设置*/
            attachModalName: '',
            currentPictureIsUpdate: false, //新增或者更新
            currentPicture: {}, //当前编辑的图片
            currentPictureIndex: 0, //当前编辑图片的INDEX
            attachShow: false, // 打开/关闭文件管理器
            attachCallBack: function(x) {},
            /* table设置 start*/
            items: [],
            dragging: false,
            isBusy: true,
            currentPage: 1,
            perPage: 10,
            totalRows: 0,
            pageOptions: [5, 10, 20, 50, 100],
            sortBy: 'number',
            sortDesc: true,
            sortDirection: 'desc',
            keyWord: null,
            filter: null
        }
    },
    props: {
        dataUrl: {
            required: true,
            type: String
        },
        sortUrl: {
            required: true,
            type: String
        },
        updateUrl: {
            required: true,
            type: String
        },
        createUrl: {
            required: true,
            type: String
        },
        deleteUrl: {
            required: true,
            type: String
        },
        dragUrl: {
            required: true,
            type: String
        },
        hasAttach: {
            type: Boolean,
            default: true
        },
        hasCover: {
            type: Boolean,
            default: true
        },
        hasGroup: {
            type: Boolean,
            default: true
        },
        dataGroup: Number,
        dataType: Number,
        disableCreate: {
            type: Boolean,
            default: false
        },
        editorTop: Number,
        scollMinTop: Number,
        scorllTopLength: Number
    },

    watch: {
        // form: {
        //     handler(newVal) {
        //         this.isEditRowChange = true
        //     },
        //     deep: true,
        //     immediate: true
        // },
        sortBy(val) {
            this.load()
        },
        sortDesc(val) {
            this.load()
        },
        perPage() {
            this.load()
            this.refreshScroll()
        },
        //监测是否出于编辑状态
        editMode(val) {
            var that = this
            if (val === true) {
                this.formShow = true
                that.$nextTick(() => {
                    this.$refs.tinymceNews.init()
                    this.$refs.tinymceNews.setVal(this.form.content)
                })
            } else {
                this.$refs.tinymceNews.destroy()
                this.formShow = false
            }

            //刷新滚动轴
            that.refreshScroll()
        }
    },
    computed: {
        editModeTitle() {
            return this.isUpdate ? '编辑' : '新增'
        },
        editModeWidth() {
            return abp.catalogItem.width
        },
        sortOptions() {
            // Create an options list from our fields
            return this.fields
                .filter(f => f.sortable)
                .map(f => {
                    return { text: f.label, value: f.key }
                })
        },
        fields() {
            let fields = [
                {
                    key: 'isTop',
                    label: '置顶',
                    class: 'text-center'
                },
                {
                    key: 'number',
                    label: '顺序号',
                    sortable: true,
                    sortDirection: 'desc',
                    class: 'text-center'
                },
                { key: 'mark', label: '标签', class: 'text-center' },
                { key: 'title', label: '标题', sortable: true, sortDirection: 'desc' },
                // {
                //     key: 'star',
                //     label: '评分',
                //     sortable: true,
                //     class: 'text-center'
                // },
                {
                    key: 'creationTime',
                    label: '发布时间',
                    sortable: true,
                    class: 'text-center'
                },
                { key: 'actions', label: '操作', class: 'text-center' }
            ]
            var group = {
                key: 'catalogGroupId',
                label: '分组',
                class: 'text-center',
                sortable: true,
                sortDirection: 'desc'
            }
            if (this.hasGroup) fields.splice(4, 0, group)
            return fields
        }
    },
    methods: {
        onMove(e) {
            if (this.dragging || this.sortBy !== 'number' || !this.sortDesc) {
                return false
            }
        },
        async handleChange(e) {
            console.log(e)
            let toIndex = e.moved.newIndex - 1
            if (e.moved.oldIndex > e.moved.newIndex) toIndex = e.moved.newIndex + 1

            let draged = e.moved.element
            let to = this.items[toIndex]
            let json = {
                id: draged.id,
                toId: to.id,
                above: to.number > draged.number
            }
            this.dragging = true
            await this.$http.post(this.dragUrl, json).then(res => {
                this.items[e.moved.newIndex].number = res.data.result.number
                this.dragging = false
                this.dragUpdate = null
            })
        },
        addPicture() {
            this.currentPictureIsUpdate = false
            this.currentPicture = {
                picUrl: '',
                picTitle: '',
                picContent: ''
            }
            this.attachModalName = ` 添加图片：`
            this.$refs.attachModal.show()
        },
        editPicture(item, index) {
            this.currentPictureIsUpdate = true
            this.currentPicture = JSON.parse(JSON.stringify(item))
            this.currentPictureIndex = index
            this.attachModalName = ` 编辑图片`
            this.$refs.attachModal.show()
        },
        attachModalHide() {
            this.currentPictureIsUpdate = false
            this.currentPicture = {}
            this.attachModalName = null
        },
        attachModalOk(e) {
            e.preventDefault()
            this.attachModalSubmit()
        },
        async attachModalSubmit() {
            if (await this.validate('form-picture')) {
                if (!this.currentPictureIsUpdate) {
                    this.form.pictureWithInfos.push(JSON.parse(JSON.stringify(this.currentPicture)))
                } else {
                    this.form.pictureWithInfos[this.currentPictureIndex] = JSON.parse(
                        JSON.stringify(this.currentPicture)
                    )
                }
                this.$refs.attachModal.hide()
            } else
                swal({
                    title: '请填写必要的选项!',
                    icon: 'warning'
                })
        },
        search(val) {
            this.filter = val
            this.load()
        },
        formatTime(val) {
            return tools.date(val)
        },
        pageChange(val) {
            this.currentPage = val
            this.load()
        },
        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },
        load() {
            // Here we don't set isBusy prop, so busy state will be
            // handled by table itself
            this.isBusy = true
            let sorts = ['IsTop DESC']
            let sort = String(this.sortBy)
            if (sort !== null && sort !== undefined && sort !== '') {
                sort = sort.replace(sort[0], sort[0].toUpperCase())
                sort += ' '
                sort += this.sortDesc ? 'DESC' : 'ASC'
                sorts.push(sort)
            }
            let params = {
                params: {
                    Keyword: this.filter,
                    IsActive: true,
                    SkipCount: (this.currentPage - 1) * this.perPage,
                    MaxResultCount: this.perPage,
                    Sorting: sorts.toString()
                }
            }

            if (this.hasGroup) params.params.catalogGroupId = this.dataGroup
            this.$http
                .get(this.dataUrl, params)
                .then(res => {
                    if (res.data.success) {
                        let json = res.data.result
                        this.totalRows = json.totalCount
                        this.items = json.items
                        this.items.forEach(i => (i._showDetails = false))
                        //_rowVariant用来定义行颜色
                        // items.forEach(i => { if (i.isTop) i._rowVariant = 'success' })
                        this.isBusy = false
                    }
                })
                .catch(() => {
                    // Here we could override the busy sta
                    // Returning an empty array, allows table to correctly handle
                    // internal busy state in case of errorte, setting isBusy to false
                    this.isBusy = false
                })
        },
        //查看
        rowClicked(item, index, event) {
            var that = this
            this.modalInfo = JSON.parse(JSON.stringify(item))
            this.$root.$emit('bv::show::modal', 'modalInfo')
            that.$nextTick(() => {
                setTimeout(() => {
                    that.$refs.modalInfoView.refresh()
                }, 20)
            })
        },
        //重置查看
        modalInfoHide() {
            this.modalInfo = {}
        },
        //modal打开时焦点设置
        modalInfoShow(e) {
            this.$refs.focusThis.focus()
        },
        //刷新滚动轴
        refreshScroll() {
            this.$emit('refreshScroll')
        },
        reloadScroll() {
            this.$emit('reloadScroll')
        },
        // 置顶
        _putTop(item) {
            item.isTop = !item.isTop
        },
        //编辑
        _edit(item, index, button) {
            this.isUpdate = true
            this.editRow = item
            this.form = JSON.parse(JSON.stringify(item))
            if (this.form.tags && this.form.tags.length > 0) {
              this.form.tagsStr = this.form.tags.join(',')
            }
            this.editMode = true
        },
        //新增
        _new() {
            this.isUpdate = false
            this.editRow = {}
            this.form = JSON.parse(JSON.stringify(baseFrom))
            this.form.pictureWithInfos = []
            this.editMode = true
        },
        _delete(item, index, button) {
            swal({
                title: '确认吗?',
                text: '被删除数据可能无法恢复，请您再次确认!',
                icon: 'warning',
                buttons: ['取消', '确认'],
                dangerMode: true
            }).then(async confirm => {
                if (confirm) {
                    this.$http.delete(this.deleteUrl, { params: { id: item.id } }).then(res => {
                        if (res.data.success) {
                            this.load()
                        }
                    })
                }
            })
        },

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
        /**封面管理 */
        coverOpen() {
            this.fileShow = true
            this.fileCallBack = this.coverSet
        },
        coverSet(fileUrl) {
            this.form.cover = fileUrl
            this.form.miniCover = fileUrl
        },
        getCover() {
            if (this.form.cover !== null && this.form.cover !== '' && this.form.cover !== undefined) {
                return this.form.cover
            } else return `/static/imgs/addCover.jpg`
        },
        fileClose() {
            this.fileShow = false
        },
        /**附件管理 */
        getPicture() {
            if (
                this.currentPicture.picUrl !== null &&
                this.currentPicture.picUrl !== '' &&
                this.currentPicture.picUrl !== undefined
            ) {
                return this.currentPicture.picUrl
            } else return `/static/imgs/addPicture.jpg`
        },
        attachOpen() {
            this.attachShow = true
            this.attachCallBack = this.attachSet
        },
        attachSet(fileUrl) {
            // var fileType = fileUrl.substring(fileUrl.lastIndexOf('.') + 1, fileUrl.length).toLowerCase()
            // var decodeFileUrl = decodeURIComponent(fileUrl)
            // var fileName = decodeFileUrl.substring(decodeFileUrl.lastIndexOf('/') + 1, decodeFileUrl.lastIndexOf('.'))
            this.currentPicture.picUrl = fileUrl
        },
        attachDelete(index) {
            swal({
                title: '确认吗?',
                text: '被删除数据可能无法恢复，请您再次确认!',
                icon: 'warning',
                buttons: ['取消', '确认'],
                dangerMode: true
            }).then(async confirm => {
                if (confirm) {
                    this.form.pictureWithInfos.splice(index, 1)
                }
            })
        },
        attachClose() {
            this.attachShow = false
        },
        // 编辑模式
        outEditMode() {
            this.editMode = false
            this.isUpdate = false
            this.form = {}
            this.editRow = {}
        },
        async validate(scope) {
            let res
            await this.$validator.validateAll(scope).then(async result => {
                res = result
            })
            return res
        },
        //重置
        onReset(evt) {
            evt.preventDefault()
            /* Reset our form values */
            this.form = JSON.parse(JSON.stringify(this.editRow))
            if (this.form.tags && this.form.tags.length > 0) {
              this.form.tagsStr = this.form.tags.join(',')
            }
            /* 重置或者清除浏览器的验证状态 */
            this.$refs.tinymceNews.destroy()
            this.formShow = false
            this.$nextTick(() => {
                this.formShow = true
                setTimeout(() => {
                    this.$refs.tinymceNews.init()
                }, 20)
            })
        },
        async onSubmit(evt) {
            evt.preventDefault()
            // console.log(this.form)
            // return
            if (await this.validate('form-update')) {
                this.form.content = this.$refs.tinymceNews.getVal()
                this.form.tags = this.form.tagsStr.split(',')
                this.editRow = JSON.parse(JSON.stringify(this.form))
                this.editRow.catalogGroupId = this.dataGroup

                if (!this.isUpdate) {
                    await this.$http.post(this.createUrl, this.editRow).then(res => {
                        if (res.data.success) {
                            let json = res.data.result
                            this.load()
                        }
                    })
                } else {
                    await this.$http.put(this.updateUrl, this.editRow).then(res => {
                        if (res.data.success) {
                            this.load()
                        }
                    })
                }
                this.outEditMode()
            } else {
                swal({
                    title: '请填写必要的选项!',
                    icon: 'warning'
                })
            }
        }
        // onpopstate() {
        //     if (window.history && window.history.pushState) {
        //         history.pushState(null, null, document.URL)
        //         window.addEventListener('popstate', this.closeViews, false)
        //         window.addEventListener('beforeunload', this.beforeunloadFn, false)
        //     }
        // },
        // afterpopstate() {
        //     window.removeEventListener('popstate', this.closeViews, false)
        //     window.removeEventListener('beforeunload', this.beforeunloadFn, false)
        // },
        // beforeunloadFn(e) {
        //     e.returnValue = ''
        // },
        // closeViews() {
        //     if (this.editMode) {
        //         if (this.isEditRowChange)
        //             swal({
        //                 title: '确认吗?',
        //                 text: '您输入的内容尚未保存，确定离开此页面吗？',
        //                 icon: 'warning',
        //                 buttons: ['取消', '确认'],
        //                 dangerMode: true
        //             }).then(async confirm => {
        //                 if (confirm) this.outEditMode()
        //                 else history.pushState(null, null, document.URL)
        //             })
        //         else this.outEditMode()
        //     } else history.back()
        // }
    },
    created() {
        var that = this
        // 增加预置的标签
        abp.custom.news_marks.forEach(i => this.marks.push(i))
        this.form = JSON.parse(JSON.stringify(baseFrom))
        this.load()
    },
    beforeDestroy: function() {
        if (this.editMode) this.$refs.tinymceNews.destroy()
    },
    destroyed() {
        // this.afterpopstate()
    }
}
</script>
