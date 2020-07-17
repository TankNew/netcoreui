<template>
  <section class="container-fluid">
    <p class="lead">
      <i class="far fa-copy text-primary mr-1"></i>
      {{contentTitle}}
    </p>
    <section v-show="editMode">
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
      <b-form
        v-if="formShow"
        @submit.stop.prevent="onSubmit"
        @reset="onReset"
        autocomplete="off"
        data-vv-scope="form-update"
      >
        <b-input-group
          size="sm"
          prepend="LOGO"
          class="mb-3 mx-auto info-img-container"
        >
          <div class="info-img">
            <img :src="form.logo" />
          </div>
          <b-input-group-append>
            <b-btn size="sm" variant="primary">
              选择
              <vue-base64-file-upload
                class="v1"
                accept="image/png, image/jpeg"
                image-class="v1-image"
                input-class="v1-file"
                :max-size="customImageMaxSize"
                :disable-preview="true"
                @size-exceeded="onSizeExceeded"
                @file="onFile"
                @load="onLoadCover"
              />
            </b-btn>
          </b-input-group-append>
        </b-input-group>
        <b-form-group label="企业全称:" label-for="p-name">
          <b-form-input
            ref="focusThis"
            id="p-name"
            type="text"
            v-model="form.title"
            name="企业全称"
            placeholder="企业全称"
            :state="!errors.has('form-update.企业全称') "
            v-validate="'required'"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="官网链接:" label-for="p-url">
          <b-form-input
            ref="focusThis"
            id="p-url"
            type="text"
            v-model="form.url"
            name="官网链接"
            placeholder="官网链接"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="是否含有简介:" label-for="p-hasInfo">
          <b-form-checkbox
            id="p-hasInfo"
            switch
            @change="form.hasInfo=!form.hasInfo"
            v-model="form.hasInfo"
          >启用</b-form-checkbox>
        </b-form-group>
        <b-form-group label="正文" label-for="detail" v-show="form.hasInfo">
          <tinymce
            id="detail"
            ref="tinymceNews"
            @refreshScroll="refreshScroll"
            @reloadScroll="reloadScroll"
            :initial="form.info"
            :editorWidth="editModeWidth"
            :scollMinTop="452"
            :scorllTopLength="scorllTopLength"
          ></tinymce>
        </b-form-group>
        <hr />
        <b-button type="submit" variant="primary">确认</b-button>
        <b-button type="reset" variant="light">重置</b-button>
      </b-form>
    </section>
    <section v-show="!editMode">
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
      <div class="mb-3 ml-4">
        <button type="button" class="btn btn-primary btn-sm px-5" @click="_new">
          <i class="fas fa-plus mr-1"></i>新增
        </button>
      </div>
      <div class="news-table">
        <section style="min-height: 300px;">
          <b-table-simple hover responsive bordered>
            <colgroup>
              <col style="width:60px;" />
              <col style="width:120px;" />
              <col />
              <col style="width:70px;" />
              <col style="width:120px;" />
            </colgroup>
            <b-thead head-variant="light">
              <b-tr>
                <b-th class="text-center">ID</b-th>
                <b-th class="text-center">Logo</b-th>
                <b-th class="text-center">企业全称</b-th>
                <b-th class="text-center">含有简介</b-th>
                <b-th class="text-center">操作</b-th>
              </b-tr>
            </b-thead>
            <b-tbody v-if="isBusy">
              <b-tr>
                <b-td colspan="5">
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
                <b-td class="text-center">
                  <span class="news-number">{{parseInt(item.id)}}</span>
                </b-td>
                <b-td class="text-center partner-logo">
                  <img :src="item.logo" />
                </b-td>
                <b-td>{{item.title}}</b-td>
                <b-td class="text-center">{{item.hasInfo}}</b-td>
                <b-td class="text-center">
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
                <b-td colspan="5" variant="light" class="text-left">
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
import tools from '../utiltools/tools'
import swal from 'sweetalert'
import VueBase64FileUpload from 'vue-base64-file-upload'
import tinymce from '@/components/custom/tinymce'
import draggable from 'vuedraggable'

const baseFrom = {
    logo: '',
    title: '',
    url: '',
    hasInfo: false,
    info: ''
}
export default {
    components: {
        tinymce,
        VueBase64FileUpload,
        draggable
    },
    data() {
        return {
            customImageMaxSize: 0.2,
            isUpdate: false, // 是否更新
            editMode: false,
            editorWidths: [640, 800, 900, 1000, 1200],
            editRow: {},
            editRowIndex: null,
            form: {},
            formShow: true,
            /* table设置 start*/
            items: [],
            dragging: false,
            isBusy: true,
            currentPage: 1,
            perPage: 10,
            totalRows: 0,
            pageOptions: [5, 10, 20, 50, 100],
            sortBy: 'number',
            sortDesc: false,
            sortDirection: 'desc',
            keyWord: null,
            filter: null,

            getAllUrl: '/api/services/app/Partner/GetAll',
            deleteUrl: `/api/services/app/Partner/Delete`,
            createUrl: `/api/services/app/Partner/Create`,
            updateUrl: `/api/services/app/Partner/Update`,
            dragUrl: `/api/services/app/Partner/Move`
        }
    },
    props: {
        contentTitle: String,
        scorllTopLength: Number
    },
    watch: {
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
        editMode(val) {
            var that = this
            if (val === true) {
                this.formShow = true
                that.$nextTick(() => {
                    this.$refs.tinymceNews.init()
                    this.$refs.tinymceNews.setVal(this.form.info)
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
            return abp.page.width
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
                    key: 'number',
                    label: '顺序号',
                    sortable: true,
                    sortDirection: 'desc'
                },
                {
                    key: 'logo',
                    label: 'Logo'
                },
                { key: 'title', label: '企业全称', sortable: true, sortDirection: 'desc' },
                { key: 'hasInfo', label: '含有简介', class: 'text-center' },
                { key: 'actions', label: '操作', class: 'text-center w25' }
            ]

            return fields
        }
    },
    methods: {
        onMove(e) {
            if (this.dragging || this.sortBy !== 'number' || this.sortDesc) {
                return false
            }
        },
        async handleChange(e) {
            let toIndex = e.moved.newIndex - 1
            if (e.moved.oldIndex > e.moved.newIndex) toIndex = e.moved.newIndex + 1

            let draged = e.moved.element
            let to = this.items[toIndex]
            let json = {
                id: draged.id,
                toId: to.id,
                above: to.number < draged.number
            }
            this.dragging = true
            await this.$http.post(this.dragUrl, json).then(res => {
                this.items[e.moved.newIndex].number = res.data.result.number
                this.dragging = false
                this.dragUpdate = null
            })
        },
        onFile(file) {},
        onLoadCover(dataUri) {
            this.form.logo = dataUri
        },
        onSizeExceeded(size) {
            swal({
                title: '请上传200K以内的图片',
                icon: 'error'
            })
        },
        refreshScroll() {
            this.$emit('refreshScroll')
        },
        reloadScroll() {
            this.$emit('reloadScroll')
        },

        /**Table methods */
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
            this.$http
                .get(this.getAllUrl, params)
                .then(res => {
                    if (res.data.success) {
                        let json = res.data.result
                        this.items = json.items
                        this.items.forEach(i => (i._showDetails = false))
                        this.totalRows = json.totalCount
                        this.isBusy = false
                    }
                })
                .catch(() => {
                    this.isBusy = false
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
        // 编辑模式
        outEditMode() {
            this.editMode = false
            this.isUpdate = false
            this.form = {}
            this.editRow = {}
        },
        //编辑
        _edit(item, index, button) {
            this.isUpdate = true
            this.editRow = item
            this.form = JSON.parse(JSON.stringify(item))
            this.editMode = true
        },
        //新增
        _new() {
            this.isUpdate = false
            this.editRow = {}
            this.form = JSON.parse(JSON.stringify(baseFrom))
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
                            this.$root.$emit('bv::refresh::table', 'my-table')
                        }
                    })
                }
            })
        },
        //重置
        onReset(evt) {
            evt.preventDefault()
            /* Reset our form values */
            this.form = JSON.parse(JSON.stringify(this.editRow))
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
            if (await this.validate('form-update')) {
                this.form.info = this.$refs.tinymceNews.getVal()
                this.editRow = JSON.parse(JSON.stringify(this.form))
                if (!this.isUpdate) {
                    await this.$http.post(this.createUrl, this.editRow).then(res => {
                        if (res.data.success) {
                            let json = res.data.result
                            this.$root.$emit('bv::refresh::table', 'my-table')
                        }
                    })
                } else {
                    await this.$http.put(this.updateUrl, this.editRow).then(res => {
                        if (res.data.success) {
                            this.$root.$emit('bv::refresh::table', 'my-table')
                        }
                    })
                }
                swal('操作成功!', '', 'success').then(() => this.outEditMode())
            } else {
                swal({
                    title: '请填写必要的选项!',
                    icon: 'warning'
                })
            }
        },
        async validate(scope) {
            let res
            await this.$validator.validateAll(scope).then(async result => {
                res = result
            })
            return res
        },
        async update(item) {
            await this.$http.put(this.updateUrl, item).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    return json
                }
            })
        },
        async create(item) {
            await this.$http.post(this.createUrl, item).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    return json
                }
            })
        }
    },
    created() {
        this.load()
    },

    beforeDestroy: function() {
        if (this.editMode) this.$refs.tinymceNews.destroy()
    }
}
</script> 
