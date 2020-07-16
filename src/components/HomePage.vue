<template>
  <section class="container-fluid">
    <p class="lead">
      <i class="far fa-images text-primary mr-1"></i>
      {{contentTitle}}
    </p>
    <b-alert show dismissible>
      <b>Info:</b> 主页栏目会根据网站模板进行自动匹配，网站模板切换将在未来上线。
    </b-alert>
    <b-modal
      ref="blockModal"
      size="lg"
      scrollable
      :ok-title="'确认'"
      :cancel-title="'取消'"
      :title="blockModalName"
      @ok="blockModalOk"
      @hidden="blockModalHide"
    >
      <template v-slot:modal-header="{ close }">
        <!-- Emulate built in modal header close button action -->
        <h5>
          <i class="fas fa-columns text-info mr-1"></i>
          广告类栏目编辑
        </h5>
        <div>
          <b-form-checkbox
            switch
            @change="currentBlock.isActive=!currentBlock.isActive"
            v-model="currentBlock.isActive"
          >启用</b-form-checkbox>
        </div>
      </template>
      <section>
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
          @submit.stop.prevent="blockSubmit"
          autocomplete="off"
          data-vv-scope="form-picture"
        >
          <b-form-group label="标题:" label-for="p-title" description="广告标题.">
            <b-form-input
              id="p-title"
              type="text"
              v-model="currentBlock.title"
              name="标题"
              :state="!errors.has('form-picture.标题') "
              v-validate="'required'"
              placeholder="标题"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="图片地址:"
            label-for="p-img"
            description="选取图片库自动生成链接，或者手动填写外链."
          >
            <b-form-input
              id="p-img"
              type="text"
              v-model="currentBlock.img"
              name="图片地址"
              placeholder="图片地址"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="广告链接:"
            label-for="p-url"
            description="如果广告无链接，留空即可."
          >
            <b-form-input
              id="p-url"
              type="text"
              v-model="currentBlock.url"
              name="广告链接"
              placeholder="广告链接"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="描述:"
            label-for="p-content"
            description="简单的文字描述，不允许换行以及链接."
          >
            <b-form-textarea
              id="p-content"
              v-model="currentBlock.text"
              placeholder="文字描述"
            ></b-form-textarea>
          </b-form-group>
        </b-form>
      </section>
    </b-modal>
    <b-modal
      ref="groupModal"
      size="lg"
      scrollable
      :ok-title="'确认'"
      :cancel-title="'取消'"
      title="选择分组"
      @ok="groupModalOk"
      @hidden="groupModalHide"
    >
      <b-alert show dismissible>
        <b>Info:</b> 您可以更改默认分组名称
      </b-alert>
      <b-form
        @submit.stop.prevent="groupModalOk"
        autocomplete="off"
        data-vv-scope="form-group"
      >
        <b-form-group
          label="标题:"
          label-for="g-title"
          description="选取分组自动生成，也可以自定义."
        >
          <b-form-input
            id="g-title"
            type="text"
            v-model="currentPageGroup.title"
            name="标题"
            :state="!errors.has('form-group.标题') "
            v-validate="'required'"
            placeholder="标题"
          ></b-form-input>
        </b-form-group>
        <treeselect
          v-model="value"
          name="分组"
          v-validate="'required'"
          :multiple="false"
          :options="treeData"
          :normalizer="normalizer"
          :show-count="true"
          @select="onSelect"
        ></treeselect>
      </b-form>
    </b-modal>
    <section class="home-page-setting">
      <ul>
        <li>
          <div class="alert alert-success text-center">首页广告绑定</div>
          <div v-if="isLoading" class="text-center loading text-info">
            <b-spinner class="align-middle"></b-spinner>
            <strong>Loading...</strong>
          </div>
          <draggable
            v-else
            tag="dl"
            :disabled="dragging"
            v-model="blocks"
            :animation="200"
            :group="{ name: `blocks`}"
            :ghost-class="'ghost'"
            @change="handleChange"
          >
            <dd
              :class="item.noActive?'notActive':'img'"
              v-for="(item,index) in blocks"
              :key="index"
              @click="openBlockModal(item,index,item.noActive)"
            >
              <div v-if="!item.noActive">
                <i
                  class="fas fa-times fa-delete"
                  @click.stop="blockDelete(item,index)"
                ></i>
                <img :src="item.img" />
              </div>
              <div v-else>
                <span>{{index+1}}</span>
              </div>
            </dd>
          </draggable>
          <div class="clear"></div>
        </li>
        <li>
          <div class="alert alert-primary text-center">列表模块绑定</div>
          <div v-if="isLoading" class="text-center loading text-info">
            <b-spinner class="align-middle"></b-spinner>
            <strong>Loading...</strong>
          </div>
          <draggable
            v-else
            tag="dl"
            :disabled="dragging"
            v-model="groups"
            :animation="200"
            :group="{ name: `groups`}"
            :ghost-class="'ghost'"
            @change="handleChange"
          >
            <dd
              :class="item.noActive?'notActive':''"
              v-for="(item,index) in groups"
              :key="index"
              @click="openGroupModal(item,index,item.noActive)"
            >
              <div v-if="!item.noActive">
                <i
                  class="fas fa-times fa-delete"
                  @click.stop="groupDelete(item)"
                ></i>
                <span>{{item.title?item.title:item.catalogGroup.displayName}}</span>
                <i class="fas fa-check"></i>
              </div>
              <div v-else>
                <span>{{index+1}}</span>
              </div>
            </dd>
          </draggable>
          <div class="clear"></div>
        </li>
      </ul>
    </section>
  </section>
</template>
<script>
import swal from 'sweetalert'
import file from '@/components/custom/tankFiler'
import AppConsts from '../utiltools/appconst'
import draggable from 'vuedraggable'
// import the component
import Treeselect from '@riophae/vue-treeselect'
// import the styles
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import VueBase64FileUpload from 'vue-base64-file-upload'

export default {
    data() {
        return {
            homePage: {},
            treeData: [],
            blocks: [],
            groups: [],
            blocksCrude: [],
            groupsCrude: [],
            isLoading: true,
            currentBlockIndex: null,
            currentBlock: {},
            currentBlockIsUpdate: false,
            blockModalName: null,

            attachShow: null,
            attachCallBack: function(x) {},

            currentPageGroup: {},
            currentPageGroupIsUpdate: false,

            dragging: false,
            // define the default value
            value: null
        }
    },
    components: { file, draggable, VueBase64FileUpload, Treeselect },
    props: ['contentTitle'],
    methods: {
        normalizer(node) {
            return {
                id: node.id,
                label: node.displayName,
                children: node.children.length > 0 ? node.children : undefined,
                isDefaultExpanded: true
            }
        },
        async onSelect(node, instanceId) {
            this.currentPageGroup.catalogGroupId = node.id
            this.currentPageGroup.type = node.catalogType
            this.currentPageGroup.title = node.displayName
        },
        getPicture() {
            if (this.currentBlock.img !== null && this.currentBlock.img !== '' && this.currentBlock.img !== undefined) {
                return this.currentBlock.img
            } else return `/static/imgs/addPicture.jpg`
        },
        async validate(scope) {
            let res
            await this.$validator.validateAll(scope).then(async result => {
                res = result
            })
            return res
        },
        attachOpen() {
            this.attachShow = true
            this.attachCallBack = this.attachSet
        },
        attachSet(fileUrl) {
            // var fileType = fileUrl.substring(fileUrl.lastIndexOf('.') + 1, fileUrl.length).toLowerCase()
            // var decodeFileUrl = decodeURIComponent(fileUrl)
            // var fileName = decodeFileUrl.substring(decodeFileUrl.lastIndexOf('/') + 1, decodeFileUrl.lastIndexOf('.'))
            this.currentBlock.img = fileUrl
        },
        attachClose() {
            this.attachShow = false
        },
        // 广告类管理
        openBlockModal(item, index, noActive) {
            this.currentBlockIsUpdate = !noActive
            this.blockModalName = !this.currentBlockIsUpdate ? `添加` : `编辑`
            if (!this.currentBlockIsUpdate) this.currentBlock.isActive = true
            else {
                this.currentBlock = JSON.parse(JSON.stringify(item))
                this.currentBlockIndex = index
            }
            this.$refs.blockModal.show()
        },
        blockModalOk(e) {
            e.preventDefault()
            this.blockSubmit()
        },

        async blockDelete(item, index) {
            this.blocksCrude.splice(index, 1)
            await this.submit()
        },
        async blockSubmit() {
            if (await this.validate('form-picture')) {
                if (!this.currentBlockIsUpdate) this.blocksCrude.push(this.currentBlock)
                else this.blocksCrude[this.currentBlockIndex] = this.currentBlock
                // this.homePage.blocks = this.blocksCrude
                await this.submit()
                this.blockModalHide()
            } else
                swal({
                    title: '请填写必要的选项!',
                    icon: 'warning'
                })
        },
        blockModalHide() {
            this.currentBlockIndex = null
            this.currentBlockIsUpdate = false
            this.currentBlock = {}
            this.blockModalName = null
            this.$refs.blockModal.hide()
        },

        /* 新闻类管理 */
        async openGroupModal(item, index, noActive) {
            const newsGroupsRes = await this.$http.get('/api/services/app/CatalogGroup/GetAll', {
                params: { catalogType: 1 }
            })
            const photoGroupsRes = await this.$http.get('/api/services/app/CatalogGroup/GetAll', {
                params: { catalogType: 2 }
            })
            const productGroupsRes = await this.$http.get('/api/services/app/CatalogGroup/GetAll', {
                params: { catalogType: 3 }
            })

            let json = [] 
            if (newsGroupsRes.data.success) json = newsGroupsRes.data.result
            if (photoGroupsRes.data.success) json = json.concat(photoGroupsRes.data.result)
            if (productGroupsRes.data.success) json = json.concat(productGroupsRes.data.result)

            this.treeData = json
            this.currentPageGroupIsUpdate = !noActive
            if (!this.currentPageGroupIsUpdate) this.currentPageGroup.catalogGroupId = 0
            else {
                this.currentPageGroup = JSON.parse(JSON.stringify(item))
                this.value = item.catalogGroupId
            }
            this.$refs.groupModal.show()
        },
        async groupModalOk(e) {
            e.preventDefault()
            if (await this.validate('form-group')) {
                if (this.value !== undefined && this.value !== null) {
                    if (this.currentPageGroupIsUpdate)
                        this.groupsCrude[this.currentPageGroup.crudeIndex].catalogGroupId = item.id
                    else this.groupsCrude.push(this.currentPageGroup)
                    await this.submit()
                    this.groupModalHide()
                }
            } else
                swal({
                    title: '请填写必要的选项!',
                    icon: 'warning'
                })
        },
        groupModalHide() {
            this.currentPageGroupIsUpdate = false
            this.currentPageGroup = {}
            this.value = null
            this.$refs.groupModal.hide()
        },
        async groupDelete(item) {
            this.groupsCrude.splice(item.crudeIndex, 1)
            await this.submit()
        },
        async handleChange(e) {
            if (!e.moved.element.noActive) {
                this.dragging = true
                this.unMapSign()
                await this.submit()
                this.dragging = false
            }
        },

        // 一起提交
        async submit() {
            this.isLoading = true
            await this.$http.put('/api/services/app/HomePage/Update', this.homePage).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.homePage = json
                    this.dataMapSign()
                    this.isLoading = false
                }
            })
        },
        mapSign(list, ...args) {
            let type = args[0]
            if (typeof type === 'number') {
                list = list.map((x, index) => {
                    x.noActive = false
                    x.crudeIndex = index
                    return x
                })
                list = list.filter(x => x.catalogGroup && x.catalogGroup.catalogType === type)
            } else {
                list = list.map(x => {
                    x.noActive = false
                    return x
                })
            }
            let l = list.length
            if (l < 8) {
                for (let i = 0; i < 8 - l; i++) {
                    list.push({ noActive: true })
                }
            }
            return list
        },
        unMapSign() {
            this.blocksCrude = this.blocks.filter(x => !x.noActive)
            this.groupsCrude = this.groups.filter(x => !x.noActive)

            this.homePage.blocks = this.blocksCrude
            this.homePage.groups = this.groupsCrude
        },
        load() {
            this.isLoading = true
            this.$http.get('/api/services/app/HomePage/GetOrCreate').then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.homePage = json
                    this.dataMapSign()
                    this.isLoading = false
                }
            })
        },
        dataMapSign() {
            this.blocksCrude = this.homePage.blocks
            this.groupsCrude = this.homePage.groups
            this.blocks = this.mapSign(this.blocksCrude)
            this.groups = this.mapSign(this.groupsCrude)
        }
    },
    created() {
        this.load()
    }
}
</script>
