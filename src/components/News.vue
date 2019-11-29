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
            :scorllTopLength="scorllTopLength"
        ></tank-news>
    </section>
</template>
<script>
import tankNews from '@/components/custom/tankNews'

export default {
    name: 'news',
    data() {
        return {
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
        tankNews
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
                    console.log(json)
                    this.currentGroup = json
                    this.currentGroupType = this.currentGroup.catalogType
                }
            })
        }
    },
    async created() {
        this.dataGroup = parseInt(this.$route.params.id)
        await this.getGroupInfo()
    }
}
</script>
