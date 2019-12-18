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
              :state="!errors.has('form-picture.图片地址') "
              v-validate="'required'"
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
      ok-only
      :ok-title="'确认'"
      title="选择栏目"
      @hidden="groupModalHide"
    >
      <b-alert show dismissible>
        <b>Info:</b> 请双击选择关联的栏目，或者双击《清除选择》以取消关联任何
      </b-alert>
      <section class="tree-item">
        <ul>
          <tree-item
            v-for="(item,index) in treeData"
            :key="index"
            :item="item"
            :currentPageGroup="currentPageGroup"
            @catalogChoose="catalogChoose"
          ></tree-item>
          <li>
            <div @dblclick="catalogChoose(null)">
              <i class="fas fa-times-circle"></i>
              清除选择
            </div>
          </li>
        </ul>
      </section>
    </b-modal>
    <section class="home-page-setting">
      <ul>
        <li>
          <dl>
            <dt class="bg-warning">广告类栏目</dt>
            <dd
              :class="item.noActive?'notActive':'img'"
              v-for="(item,index) in blocks"
              :key="index"
              @click="openBlockModal(item,index,item.noActive)"
            >
              <i
                v-if="!item.noActive"
                class="fas fa-times fa-delete"
                @click.stop="blockDelete(item,index)"
              ></i>
              <span v-if="!item.noActive">
                <img :src="item.img" />
              </span>
              <span v-else>{{index+1}}</span>
            </dd>
          </dl>
        </li>
        <li>
          <dl>
            <dt class="bg-primary">文字类栏目</dt>
            <dd
              :class="item.noActive?'notActive':''"
              v-for="(item,index) in words"
              :key="index"
              @click="openGroupModal(item,index,item.noActive,1)"
            >
              <i
                v-if="!item.noActive"
                class="fas fa-times fa-delete"
                @click.stop="groupDelete(item)"
              ></i>
              <span v-if="!item.noActive">
                <i class="fas fa-check"></i>
                {{item.catalogGroup?item.catalogGroup.displayName:null}}
              </span>
              <span v-else>{{index+1}}</span>
            </dd>
          </dl>
        </li>
        <li>
          <dl>
            <dt class="bg-info">图片类栏目</dt>
            <dd
              :class="item.noActive?'notActive':''"
              v-for="(item,index) in pictures"
              :key="index"
              @click="openGroupModal(item,index,item.noActive,2)"
            >
              <i
                v-if="!item.noActive"
                class="fas fa-times fa-delete"
                @click.stop="groupDelete(item)"
              ></i>
              <span v-if="!item.noActive">
                <i class="fas fa-check"></i>
                {{item.catalogGroup?item.catalogGroup.displayName:null}}
              </span>
              <span v-else>{{index+1}}</span>
            </dd>
          </dl>
        </li>
        <li>
          <dl>
            <dt class="bg-success">产品类栏目</dt>
            <dd
              :class="item.noActive?'notActive':''"
              v-for="(item,index) in products"
              :key="index"
              @click="openGroupModal(item,index,item.noActive,3)"
            >
              <i
                v-if="!item.noActive"
                class="fas fa-times fa-delete"
                @click.stop="groupDelete(item)"
              ></i>
              <span v-if="!item.noActive">
                <i class="fas fa-check"></i>
                {{item.catalogGroup?item.catalogGroup.displayName:null}}
              </span>
              <span v-else>{{index+1}}</span>
            </dd>
          </dl>
        </li>
      </ul>
    </section>
  </section>
</template>
<script>
import swal from 'sweetalert'
import file from '@/components/custom/tankFiler'
import AppConsts from '../utiltools/appconst'
import treeItem from '@/components/custom/treeItem'
export default {
    data() {
        return {
            homePage: {},
            treeData: {},
            blocks: [],
            blocksCrude: [],
            groupsCrude: [],
            words: [],
            pictures: [],
            products: [],

            currentBlockIndex: null,
            currentBlock: {},
            currentBlockIsUpdate: false,
            blockModalName: null,

            attachShow: null,
            attachCallBack: function(x) {},

            currentPageGroup: {},
            currentPageGroupIsUpdate: false
        }
    },
    components: { file, treeItem },
    props: ['contentTitle'],
    methods: {
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
            this.dataMapSign()
        },
        async blockSubmit() {
            if (await this.validate('form-picture')) {
                if (!this.currentBlockIsUpdate) this.blocksCrude.push(this.currentBlock)
                else this.blocksCrude[this.currentBlockIndex] = this.currentBlock
                // this.homePage.blocks = this.blocksCrude
                await this.submit()
                this.dataMapSign()
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
        async openGroupModal(item, index, noActive, type) {
            await this.$http
                .get('/api/services/app/CatalogGroup/GetAll', { params: { catalogType: type } })
                .then(res => {
                    if (res.data.success) {
                        let json = res.data.result
                        this.treeData = json
                    }
                })

            this.currentPageGroupIsUpdate = !noActive
            if (!this.currentPageGroupIsUpdate) this.currentPageGroup.catalogGroupId = 0
            else {
                this.currentPageGroup = JSON.parse(JSON.stringify(item))
            }
            this.$refs.groupModal.show()
        },
        async groupDelete(item) {
            this.groupsCrude.splice(item.crudeIndex, 1)
            await this.submit()
            this.dataMapSign()
        },
        async catalogChoose(item) {
            if (this.currentPageGroupIsUpdate) {
                if (item === null) await this.groupDelete(this.currentPageGroup)
                else {
                    this.currentPageGroup.catalogGroupId = item.id
                    this.groupsCrude[this.currentPageGroup.crudeIndex].catalogGroupId = item.id
                }
            } else if (item !== null) {
                this.currentPageGroup.catalogGroupId = item.id
                this.groupsCrude.push(this.currentPageGroup)
            }
            await this.submit()
            this.dataMapSign()
            this.groupModalHide()
        },
        groupModalHide() {
            this.currentPageGroupIsUpdate = false
            this.currentPageGroup = {}
            this.$refs.groupModal.hide()
        },

        // 一起提交
        async submit() {
            await this.$http.put('/api/services/app/HomePage/Update', this.homePage).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.homePage = json
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
            if (l < 6) {
                for (let i = 0; i < 6 - l; i++) {
                    list.push({ noActive: true })
                }
            }
            return list
        },
        load() {
            this.$http.get('/api/services/app/HomePage/GetOrCreate').then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.homePage = json
                    this.dataMapSign()
                }
            })
        },
        dataMapSign() {
            this.blocksCrude = this.homePage.blocks
            this.groupsCrude = this.homePage.groups
            this.blocks = this.mapSign(this.blocksCrude)
            this.words = this.mapSign(this.groupsCrude, 1)
            this.pictures = this.mapSign(this.groupsCrude, 2)
            this.products = this.mapSign(this.groupsCrude, 3)
        }
    },
    created() {
        this.load()
    }
}
</script>
