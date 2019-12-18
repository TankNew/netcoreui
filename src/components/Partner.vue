<template>
  <section class="container-fluid">
    <p class="lead">
      <i class="far fa-copy text-primary mr-1"></i>
      {{contentTitle}}
    </p>
    <section v-show="editMode" style="height:100%; position:relative;">
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
        <b-form-group label="是否含有简介:" label-for="p-hasInfo">
          <b-form-checkbox
            id="p-hasInfo"
            switch
            @change="form.hasInfo=!form.hasInfo"
            v-model="form.hasInfo"
          >启用</b-form-checkbox>
        </b-form-group>

        <div class="news-edit-editmode" v-show="form.hasInfo">
          <label>编辑模式:</label>
          <button
            v-for="(ew,index) in editorWidths"
            :key="index"
            type="button"
            :class="['btn',editModeWidth==ew?'btn-secondary':'btn-light']"
            @click="putEditModeWidth(ew)"
          >{{ew}}</button>
        </div>

        <b-form-group label="正文" label-for="detail" v-show="form.hasInfo">
          <tinymce
            id="detail"
            ref="tinymceNews"
            @refreshScroll="refreshScroll"
            @reloadScroll="reloadScroll"
            :initial="form.info"
            :editorWidth="editModeWidth"
            :scollMinTop="238"
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
      <!-- Main table element -->
      <div class="news-table">
        <section style="min-height: 300px;">
          <b-table
            id="my-table"
            show-empty
            stacked="md"
            primary-key="id"
            :head-variant="'bTable'"
            :hover="true"
            :busy.sync="isBusy"
            :bordered="true"
            :items="myProvider"
            :fields="fields"
            :current-page="currentPage"
            :per-page="perPage"
            :filter="filter"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :sort-direction="sortDirection"
            @filtered="onFiltered"
          >
            <template v-slot:cell(logo)="row">
              <img :src="row.value" />
            </template>
            <template v-slot:cell(actions)="row">
              <!-- We use @click.stop here to prevent a 'row-clicked' event from also happening -->
              <b-button
                size="sm"
                @click.stop="_edit(row.item, row.index, $event.target)"
                class="mr-1"
                variant="info"
              >编辑</b-button>
              <b-button
                size="sm"
                @click.stop="_delete(row.item, row.index, $event.target)"
                variant="dark"
              >删除</b-button>
            </template>
          </b-table>
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

const baseFrom = {
    logo: '',
    title: '',
    hasInfo: false,
    info: ''
}
export default {
    components: {
        tinymce,
        VueBase64FileUpload
    },
    data() {
        return {
            customImageMaxSize: 0.2,
            isUpdate: false, // 是否更新
            editMode: false,
            editModeWidth: 800,
            editorWidths: [640, 800, 900, 1000, 1200],
            editRow: {},
            editRowIndex: null,
            form: {},
            formShow: true,
            /* table设置 start*/
            isBusy: false,
            currentPage: 1,
            perPage: 10,
            totalRows: 1,
            pageOptions: [5, 10, 20, 50, 100],
            sortBy: 'number',
            sortDesc: true,
            sortDirection: 'desc',
            keyWord: null,
            filter: null,

            getAllUrl: '/api/services/app/Partner/GetAll',
            deleteUrl: `/api/services/app/Partner/Delete`,
            createUrl: `/api/services/app/Partner/Create`,
            updateUrl: `/api/services/app/Partner/Update`
        }
    },
    props: {
        contentTitle: String,
        scorllTopLength: Number
    },
    watch: {
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
        },
        perPage() {
            this.refreshScroll()
        }
    },
    computed: {
        editModeTitle() {
            return this.isUpdate ? '编辑' : '新增'
        },
        editModeCss() {
            return 'width:' + this.editModeWidth + 'px'
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
                    sortDirection: 'desc',
                    class: 'text-center'
                },
                {
                    key: 'logo',
                    label: 'Logo',
                    class: 'text-center table-img'
                },
                { key: 'title', label: '企业全称', sortable: true, sortDirection: 'desc' },
                { key: 'hasInfo', label: '含有简介', class: 'text-center' },
                { key: 'actions', label: '操作', class: 'text-center w25' }
            ]

            return fields
        }
    },
    methods: {
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
        },
        formatTime(val) {
            return tools.date(val)
        },
        pageChange(val) {
            this.currentPage = val
        },
        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },
        myProvider(ctx) {
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
                    Keyword: ctx.filter,
                    IsActive: true,
                    SkipCount: (ctx.currentPage - 1) * ctx.perPage,
                    MaxResultCount: ctx.perPage,
                    Sorting: sorts.toString()
                }
            }

            let promise = this.$http.get(this.getAllUrl, params)
            return promise
                .then(res => {
                    if (res.data.success) {
                        let json = res.data.result
                        let items = json.items
                        items.forEach(i => (i._showDetails = false))
                        this.totalRows = json.totalCount
                        return items
                    }
                })
                .catch(() => {
                    return []
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
            if (
                (await this.validate('form-update')) &&
                this.form.cover !== null &&
                this.form.cover !== '' &&
                this.form.cover !== undefined
            ) {
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
                this.outEditMode()
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
        var that = this
    },

    beforeDestroy: function() {
        if (this.editMode) this.$refs.tinymceNews.destroy()
    }
}
</script> 
