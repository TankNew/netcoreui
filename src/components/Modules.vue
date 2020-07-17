<template>
  <section class="container-fluid">
    <p class="lead">
      <i class="far fa-copy text-primary mr-1"></i>
      {{contentTitle}}
    </p>
    <file
      :fileShow="fileShow"
      :fileCallBack="fileCallBack"
      @fileClose="fileClose"
    ></file>
    <!--模块总览-->

    <section>
      <div ref="ctxMenuContainer">
        <context-menu
          id="context-menu"
          ref="ctxMenu"
          @ctx-open="onCtxOpen"
          @ctx-cancel="onCtxClose"
          @ctx-close="onCtxClose"
        >
          <li @contextmenu.prevent @click="edit(menuData,menuIsPage)">
            <i class="fas color-primary fa-pencil-alt mr-1"></i>
            编辑模块
          </li>
          <li
            v-if="!menuIsPage"
            @contextmenu.prevent
            @click="add(menuData,menuIsPage)"
          >
            <i class="fas color-success fa-plus mr-1"></i>
            增加子模块
          </li>
          <li
            @contextmenu.prevent
            @click="del(menuData,menuIndex,menuIsPage,menuArray)"
          >
            <i class="fas color-danger fa-minus mr-1"></i>
            删除模块
          </li>
        </context-menu>
      </div>
      <div @contextmenu.prevent>
        <b-card class="module-body" no-body>
          <b-card-header header-tag="nav">
            <b-nav card-header tabs>
              <b-nav-item
                :active="currentSection===1"
                @click="changeCurrentSection(1)"
              >列表模块</b-nav-item>
              <b-nav-item
                :active="currentSection===2"
                @click="changeCurrentSection(2)"
              >设计模块</b-nav-item>
              <b-nav-item
                :active="currentSection===3"
                @click="changeCurrentSection(3)"
              >预设模块</b-nav-item>
            </b-nav>
          </b-card-header>

          <b-card-body>
            <section class="px-3" v-show="currentSection===1">
              <b-alert show dismissible>
                <b>Info:</b>单击左侧列表图标或者直接双击列表标题展开列表，单击列表标题在右侧进行编辑
              </b-alert>
              <div v-if="loading" class="text-center">
                <b-spinner variant="primary" label="Loading"></b-spinner>
              </div>
              <div v-else class="mb-5 group-module">
                <div class="list p-3">
                  <p class="lead mb-3">列表模块</p>
                  <section class="group-tree">
                    <ul>
                      <group-tree
                        v-for="(item,index) in catalogGroups"
                        :key="index"
                        :item="item"
                        :items="catalogGroups"
                        :itemIndex="index"
                        :isPage="false"
                        :isUpdate="isUpdate"
                        :module="module"
                        @ctxMenuOpen="ctxMenuOpen"
                        @catalogAdd="add"
                        @catalogChoose="edit"
                      />
                      <li>
                        <div @click="add(null,false)">
                          <span>
                            <i class="fas fa-plus"></i>
                            新增
                          </span>
                        </div>
                      </li>
                    </ul>
                  </section>
                </div>
                <div class="detail p-3">
                  <div class="no-action" v-if="!editMode">选择左侧模块进行编辑</div>
                  <div v-else>
                    <p class="tips">
                      <i class="fas fa-edit path" v-if="isUpdate"></i>
                      <i class="fas fa-plus path" v-else></i>
                      <span class="path">
                        <span>{{isUpdate?`编辑`:`新增`}}</span>
                        <span
                          class="action"
                        >{{isUpdate?module.displayName:parent?parent.displayName:``}}</span>
                        {{!isUpdate?'子模块':''}}
                      </span>
                    </p>
                    <b-form @submit.stop.prevent="onSubmit" autocomplete="off">
                      <div v-if="!isUpdate" class="mb-3">
                        <b-button
                          variant="outline-info"
                          :class="module.catalogType==1?'active':''"
                          @click="module.catalogType=1"
                        >
                          <i class="fas fa-quote-left mr-1"></i>文字类
                        </b-button>
                        <b-button
                          variant="outline-success"
                          :class="module.catalogType==2?'active':''"
                          @click="module.catalogType=2"
                        >
                          <i class="fas fa-images mr-1"></i>图片类
                        </b-button>
                        <b-button
                          variant="outline-primary"
                          :class="module.catalogType==3?'active':''"
                          @click="module.catalogType=3"
                        >
                          <i class="fas fa-luggage-cart mr-1"></i>产品类
                        </b-button>
                      </div>
                      <b-input-group size="sm" prepend="图标SVG" class="mb-3">
                        <div class="module-icon-img">
                          <img :src="module.icon" />
                        </div>
                        <b-input-group-append>
                          <b-btn size="sm" variant="info" @click="iconOpen">选择</b-btn>
                        </b-input-group-append>
                      </b-input-group>
                      <b-form-group
                        label="标识名称:"
                        description="设置一个便于您识别的标识名称，该名称不会显示在任何前端页面中."
                      >
                        <b-form-input
                          type="text"
                          v-model="module.displayName"
                          placeholder="输入一个标识名称"
                          required
                        ></b-form-input>
                      </b-form-group>
                      <b-input-group size="sm" prepend="封面" class="mb-3">
                        <div class="info-img">
                          <img :src="module.cover" />
                        </div>
                        <b-input-group-append>
                          <b-btn
                            size="sm"
                            variant="primary"
                            @click="coverOpen"
                          >选择</b-btn>
                        </b-input-group-append>
                      </b-input-group>
                      <b-form-group
                        label="简介:"
                        description="简单的文字描述，不允许换行以及链接."
                      >
                        <b-form-textarea
                          v-model="module.info"
                          placeholder="模块简介"
                          rows="5"
                          max-rows="10"
                        ></b-form-textarea>
                      </b-form-group>
                      <hr />
                      <b-button type="submit" variant="primary">确认</b-button>
                    </b-form>
                  </div>
                </div>
              </div>
            </section>
            <section class="px-3" v-show="currentSection===2">
              <b-alert show dismissible>
                <b>Info:</b>单击左侧列表图标或者直接双击列表标题展开列表，单击列表标题在右侧进行编辑
              </b-alert>
              <div class="mb-5 group-module">
                <div class="list p-3">
                  <p class="lead mb-3">设计模块</p>
                  <section class="group-tree">
                    <ul>
                      <group-tree
                        v-for="(item,index) in pages"
                        :key="index"
                        :item="item"
                        :items="pages"
                        :itemIndex="index"
                        :isPage="true"
                        :isUpdate="isUpdate"
                        :module="module"
                        @ctxMenuOpen="ctxMenuOpen"
                        @catalogAdd="add"
                        @catalogChoose="edit"
                      />
                      <li>
                        <div @click="add(null,true)">
                          <span>
                            <i class="fas fa-plus"></i>
                            新增
                          </span>
                        </div>
                      </li>
                    </ul>
                  </section>
                </div>

                <div class="p-3 detail">
                  <div class="no-action" v-if="!editMode">选择左侧模块进行编辑</div>
                  <div v-else>
                    <p class="tips">
                      <i class="fas fa-edit path" v-if="isUpdate"></i>
                      <i class="fas fa-plus path" v-else></i>
                      <span class="path">
                        <span>{{isUpdate?`编辑`:`新增`}}</span>
                        <span
                          class="action"
                        >{{isUpdate?module.displayName:parent?parent.displayName:``}}</span>
                        {{!isUpdate?'子模块':''}}
                      </span>
                    </p>
                    <b-form @submit.stop.prevent="onSubmit" autocomplete="off">
                      <div v-if="!isUpdate" class="mb-3">
                        <b-button variant="outline-info" class="active">
                          <i class="fas fa-pen-nib mr-1"></i>
                          设计模块
                        </b-button>
                      </div>
                      <b-input-group size="sm" prepend="图标SVG" class="mb-3">
                        <div class="module-icon-img">
                          <img :src="module.icon" />
                        </div>
                        <b-input-group-append>
                          <b-btn size="sm" variant="info" @click="iconOpen">选择</b-btn>
                        </b-input-group-append>
                      </b-input-group>
                      <b-form-group
                        label="标识名称:"
                        description="设置一个便于您识别的标识名称，该名称不会显示在任何前端页面中."
                      >
                        <b-form-input
                          type="text"
                          v-model="module.displayName"
                          placeholder="输入一个标识名称"
                          required
                        ></b-form-input>
                      </b-form-group>
                      <b-input-group size="sm" prepend="封面" class="mb-3">
                        <div class="info-img">
                          <img :src="module.cover" />
                        </div>
                        <b-input-group-append>
                          <b-btn
                            size="sm"
                            variant="primary"
                            @click="coverOpen"
                          >选择</b-btn>
                        </b-input-group-append>
                      </b-input-group>
                      <b-form-group
                        label="简介:"
                        description="简单的文字描述，不允许换行以及链接."
                      >
                        <b-form-textarea
                          v-model="module.info"
                          placeholder="模块简介"
                          rows="5"
                          max-rows="10"
                        ></b-form-textarea>
                      </b-form-group>
                      <hr />
                      <b-button type="submit" variant="primary">确认</b-button>
                    </b-form>
                  </div>
                </div>
              </div>
            </section>
            <section class="px-3" v-show="currentSection===3">
              <b-alert show variant="success" dismissible>
                <b>Info:</b>预设模块是系统初始内置给企业的模块，无法删除可修改.
              </b-alert>
              <p class="lead mb-3">预设模块</p>
              <div class="mb-3">
                <button
                  class="btn btn-sm btn-outline-info mr-3 py-3 px-5 mb-3"
                  v-for="(item,index) in webModules"
                  :key="index"
                >{{item.displayName}}</button>
              </div>
            </section>
          </b-card-body>
        </b-card>
      </div>
    </section>
  </section>
</template>
<script>
import swal from 'sweetalert'
import tools from '../utiltools/tools'
import file from '@/components/custom/tankFiler'
import groupTree from '@/components/custom/groupTree'
import contextMenu from 'vue-context-menu'

export default {
    components: {
        file,
        groupTree,
        contextMenu
    },
    data() {
        return {
            loading: true,
            fileShow: false,
            fileCallBack: function(x) {},
            module: {}, // 可操作数据
            editRow: {}, // 原始数据
            editMode: false,
            isUpdate: false,
            isPage: false,
            menuIsPage: false,
            parent: null,

            menuData: {},
            menuIndex: 0,
            menuArray: [],

            currentSection: 1,
            webModules: [],
            catalogGroups: [],
            pages: [],

            dataGroupUrl: '/api/services/app/CatalogGroup/Get',
            dataGroupListUrl: '/api/services/app/CatalogGroup/GetAll',
            dataGroupSortUrl: '/api/services/app/CatalogGroup/Move',
            dataGroupCreateUrl: '/api/services/app/CatalogGroup/Create',
            dataGroupUpdateUrl: '/api/services/app/CatalogGroup/Update',
            dataGroupDeleteUrl: '/api/services/app/CatalogGroup/Delete',

            dataPageUrl: '/api/services/app/Page/Get',
            dataPageListUrl: '/api/services/app/Page/GetAll',
            dataPageSortUrl: '/api/services/app/Page/Move',
            dataPageCreateUrl: '/api/services/app/Page/Create',
            dataPageUpdateUrl: '/api/services/app/Page/Update',
            dataPageDeleteUrl: '/api/services/app/Page/Delete'
        }
    },

    props: ['contentTitle'],

    methods: {
        changeCurrentSection(val) {
            this.outEditMode()
            this.parent = null
            this.editMode = false
            this.currentSection = val
        },
        // 当右键菜单打开时
        onCtxOpen(locals) {},
        onCtxClose(locals) {},
        // 打开右键
        ctxMenuOpen(e, item, isPage, index, array) {
            this.menuData = item
            this.menuIsPage = isPage
            this.menuIndex = index
            this.menuArray = array
            this.$refs.ctxMenu.open(e, item)
        },
        iconOpen() {
            this.fileShow = true
            this.fileCallBack = this.iconSet
        },
        iconSet(fileUrl) {
            this.module.icon = fileUrl
        },
        coverOpen() {
            this.fileShow = true
            this.fileCallBack = this.coverSet
        },
        coverSet(fileUrl) {
            this.module.cover = fileUrl
        },
        fileClose() {
            this.fileShow = false
        },
        formatTime(val) {
            return tools.date(val)
        },
        outEditMode() {
            this.module = {}
            this.editRow = {}
            this.isUpdate = false
            this.menuData = {}
            this.menuIndex = 0
            this.menuArray = []
        },
        async onSubmit(evt) {
            evt.preventDefault()
            if (!this.isUpdate) {
                if (this.isPage)
                    await this.$http.post('/api/services/app/Page/Create', this.module).then(res => {
                        if (res.data.success) {
                            let json = res.data.result
                            if (this.parent != null) this.parent.children.push(json)
                            else this.pages.push(json)
                        }
                    })
                else
                    await this.$http.post('/api/services/app/CatalogGroup/Create', this.module).then(res => {
                        if (res.data.success) {
                            let json = res.data.result
                            if (this.parent != null) this.parent.children.push(json)
                            else this.catalogGroups.push(json)
                        }
                    })
            } else {
                if (this.isPage)
                    await this.$http.put('/api/services/app/Page/Update', this.module).then(res => {
                        if (res.data.success) {
                            this.editRow.displayName = this.module.displayName
                            this.editRow.cover = this.module.cover
                            this.editRow.info = this.module.info
                            this.editRow.icon = this.module.icon
                        }
                    })
                else
                    await this.$http.put('/api/services/app/CatalogGroup/Update', this.module).then(res => {
                        if (res.data.success) {
                            this.editRow.displayName = this.module.displayName
                            this.editRow.cover = this.module.cover
                            this.editRow.info = this.module.info
                            this.editRow.icon = this.module.icon
                        }
                    })
            }
            this.$emit('getMenu')
            swal('操作成功!', '', 'success').then(() => (this.isUpdate ? '' : this.outEditMode()))
        },

        add(parent, isPage) {
            let basicPage = { parentId: null, displayName: '', catalogType: null, cover: '', info: '' }
            if (!isPage) {
                basicPage.catalogType = 1
            }
            if (parent) basicPage.parentId = parent.id
            this.editMode = true
            this.isPage = isPage
            this.parent = parent
            this.isUpdate = false
            this.module = JSON.parse(JSON.stringify(basicPage))
        },
        edit(val, isPage) {
            this.isPage = isPage
            this.editMode = true
            this.isUpdate = true
            this.editRow = val
            this.module = JSON.parse(JSON.stringify(val))
        },
        del(item, index, isPage, menuArray = []) {
            swal({
                title: '确认吗?',
                text: '被删除数据可能无法恢复，请您再次确认!',
                icon: 'warning',
                buttons: ['取消', '确认'],
                dangerMode: true
            }).then(async confirm => {
                if (confirm) {
                    var params = { params: { id: item.id } }
                    if (isPage)
                        this.$http.delete('/api/services/app/Page/Delete', params).then(res => {
                            if (res.data.success) {
                                menuArray.splice(index, 1)
                                this.$emit('getMenu')
                            }
                        })
                    else
                        this.$http.delete('/api/services/app/CatalogGroup/Delete', params).then(res => {
                            if (res.data.success) {
                                menuArray.splice(index, 1)
                                this.$emit('getMenu')
                            }
                        })
                }
            })
        },
        async load() {
            await this.$http.get('/api/services/app/WebModule/GetAll').then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.webModules = json
                }
            })
            await this.$http.get('/api/services/app/CatalogGroup/GetAll').then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.catalogGroups = json
                }
            })

            await this.$http.get('/api/services/app/Page/GetAll').then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.pages = json.items
                }
            })
            this.loading = false
        }
    },
    created() {
        this.load()
    },
    mounted() {
        this.$nextTick(() => {
            let moveNodeRef = this.$refs.ctxMenuContainer
            document.body.appendChild(moveNodeRef)
        })
    }
}
</script> 
