<template>
  <section class="container-fluid">
    <p class="lead">
      <i class="fas fa-bullhorn text-primary mr-1"></i>
      {{contentTitle}}
      <span class="small">
        <b-badge pill variant="info">{{catalogTypeName}}</b-badge>
      </span>
    </p>
    <tank-news
      v-if="hackReset"
      :dataGroup="dataGroupId"
      :dataType="dataType"
      :disableCreate="disableCreate"
      :dataUrl="dataUrl"
      :sortUrl="sortUrl"
      :createUrl="createUrl"
      :updateUrl="updateUrl"
      :deleteUrl="deleteUrl"
      :dragUrl="dragUrl"
      @getMenu="getMenu"
      @refreshScroll="refreshScroll"
      @reloadScroll="reloadScroll"
      :scollMinTop="806"
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
            dragUrl: '/api/services/app/Catalog/Move',
            dataGroupUrl: '/api/services/app/CatalogGroup/Get',
            dataGroupListUrl: '/api/services/app/CatalogGroup/GetAll',
            dataGroupSortUrl: '/api/services/app/CatalogGroup/Move',
            dataGroupCreateUrl: '/api/services/app/CatalogGroup/Create',
            dataGroupUpdateUrl: '/api/services/app/CatalogGroup/Update',
            dataGroupDeleteUrl: '/api/services/app/CatalogGroup/Delete',
            dataGroupId: 0,
            dataGroup: {},
            dataType: 0,
            disableCreate: false
        }
    },
    components: {
        tankNews,
        file
    },
    computed: {
        catalogTypeName() {
            let name = null
            switch (this.dataType) {
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
                this.dataGroupId = parseInt(val.params.id)
                this.getGroupInfo()
                this.getSubGroups()
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
            await this.$http.get(this.dataGroupUrl, { params: { id: this.dataGroupId } }).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    this.dataGroup = json
                    this.dataType = this.dataGroup.catalogType
                }
            })
        },
        async getSubGroups() {
            await this.$http.get(this.dataGroupListUrl, { params: { id: this.dataGroupId } }).then(res => {
                if (res.data.success) {
                    let json = res.data.result
                    if (json.length > 0) this.disableCreate = true
                    else this.disableCreate = false
                }
            })
        }
    },
    created() {
        this.dataGroupId = parseInt(this.$route.params.id)
        this.getGroupInfo()
        this.getSubGroups()
    }
}
</script>
