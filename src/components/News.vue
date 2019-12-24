<template>
  <section class="container-fluid">
    <p class="lead">
      <i class="fas fa-bullhorn text-primary mr-1"></i>
      {{contentTitle}}
      <span class="small">
        <b-badge pill variant="info">{{catalogTypeName}}</b-badge>
      </span>
      <span class="small">
        <b-button
          v-if="!editMode"
          size="sm"
          variant="outline-info"
          @click="formOpen"
        >编辑</b-button>
        <b-button
          v-else
          size="sm"
          variant="outline-secondary"
          @click="formHide"
        >取消编辑</b-button>
      </span>
    </p>
    <section class="catalog-group-info mb-3" v-if="editMode">
      <file
        :fileShow="fileShow"
        :fileCallBack="fileCallBack"
        @fileClose="fileClose"
      ></file>
      <b-form
        v-if="formShow"
        @submit.stop.prevent="onSubmit"
        @reset="onReset"
        autocomplete="off"
      >
        <b-input-group size="sm" prepend="封面" class="mb-3 info-img-container">
          <div class="info-img">
            <img :src="form.cover" />
          </div>
          <b-input-group-append>
            <b-btn size="sm" variant="primary" @click="coverOpen">选择</b-btn>
          </b-input-group-append>
        </b-input-group>
        <p class="px-5">
          <b-form-textarea
            id="p-content"
            v-model="form.info"
            placeholder="模块简介"
          ></b-form-textarea>
        </p>
        <hr />
        <p class="center">
          <b-button type="submit" variant="primary">确认</b-button>
          <b-button type="reset" variant="light">重置</b-button>
        </p>
      </b-form>
    </section>
    <tank-news
      v-if="hackReset"
      :dataGroup="dataGroup"
      :dataType="currentGroupType"
      :dataUrl="dataUrl"
      :sortUrl="sortUrl"
      :createUrl="createUrl"
      :updateUrl="updateUrl"
      :deleteUrl="deleteUrl"
      :dataGroupListUrl="dataGroupListUrl"
      :dataGroupSortUrl="dataGroupSortUrl"
      :dataGroupCreateUrl="dataGroupCreateUrl"
      :dataGroupUpdateUrl="dataGroupUpdateUrl"
      :dataGroupDeleteUrl="dataGroupDeleteUrl"
      @getMenu="getMenu"
      @refreshScroll="refreshScroll"
      @reloadScroll="reloadScroll"
      :scollMinTop="680"
      :scorllTopLength="scorllTopLength"
    ></tank-news>
  </section>
</template>
<script>
import tankNews from '@/components/custom/tankNews'
import file from '@/components/custom/tankFiler'

export default {
    name: 'news',
    data() {
        return {
            fileShow: false,
            fileCallBack: function(x) {},

            editMode: false,
            form: {},
            formShow: true,
            hackReset: true,
            dataUrl: '/api/services/app/Catalog/GetAll',
            sortUrl: '/api/services/app/Catalog/Move',
            createUrl: '/api/services/app/Catalog/Create',
            updateUrl: '/api/services/app/Catalog/Update',
            deleteUrl: '/api/services/app/Catalog/Delete',
            dataGroup: 0,
            dataGroupUrl: '/api/services/app/CatalogGroup/Get',
            dataGroupListUrl: '/api/services/app/CatalogGroup/GetAll',
            dataGroupSortUrl: '/api/services/app/CatalogGroup/Move',
            dataGroupCreateUrl: '/api/services/app/CatalogGroup/Create',
            dataGroupUpdateUrl: '/api/services/app/CatalogGroup/Update',
            dataGroupDeleteUrl: '/api/services/app/CatalogGroup/Delete',
            currentGroup: {},
            currentGroupType: 0
        }
    },
    components: {
        tankNews,
        file
    },
    computed: {
        catalogTypeName() {
            let name = null
            switch (this.currentGroupType) {
                case 1:
                    name = '文字类'
                    break
                case 2:
                    name = '图片类'
                    break
                case 3:
                    name = '产品类'
                    break
            }
            return name
        }
    },
    watch: {
        $route(val) {
            this.hackReset = false
            this.$nextTick(() => {
                this.hackReset = true
                this.dataGroup = parseInt(val.params.id)
                this.getGroupInfo()
            })
        }
    },
    props: ['scorllTopLength', 'contentTitle'],
    methods: {
        coverOpen() {
            this.fileShow = true
            this.fileCallBack = this.coverSet
        },
        coverSet(fileUrl) {
            this.form.cover = fileUrl
        },
        fileClose() {
            this.fileShow = false
        },
        refreshScroll() {
            this.$emit('refreshScroll')
        },
        reloadScroll() {
            this.$emit('reloadScroll')
        },
        getMenu() {
            this.$emit('getMenu')
        },
        async getGroupInfo() {
            await this.$http.get(this.dataGroupUrl, { params: { id: this.dataGroup } }).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.currentGroup = json
                    this.currentGroupType = this.currentGroup.catalogType
                }
            })
        },
        //重置
        onReset(evt) {
            evt.preventDefault()
            this.formShow = false
            this.form = JSON.parse(JSON.stringify(this.currentGroup))
            this.$nextTick(() => {
                this.formShow = true
            })
        },
        onSubmit() {
            this.$http.put(this.dataGroupUpdateUrl, this.form).then(res => {
                if (res.data.success) {
                    this.currentGroup = res.data.result
                    this.formHide()
                }
            })
        },
        formOpen() {
            this.editMode = true
            this.form = JSON.parse(JSON.stringify(this.currentGroup))
        },
        formHide() {
            this.editMode = false
            this.form = {}
        }
    },
    async created() {
        this.dataGroup = parseInt(this.$route.params.id)
        await this.getGroupInfo()
    }
}
</script>
