<template>
  <section class="container-fluid">
    <p class="lead">
      <i class="fas fa-bullhorn text-primary mr-1"></i>
      {{contentTitle}}
    </p>
    <tank-news
      :dataUrl="dataUrl"
      :sortUrl="sortUrl"
      :createUrl="createUrl"
      :updateUrl="updateUrl"
      :deleteUrl="deleteUrl"
      :dragUrl="dragUrl"
      :hasAttach="false"
      :hasCover="true"
      :hasGroup="false"
      @refreshScroll="refreshScroll"
      @reloadScroll="reloadScroll"
      :scollMinTop="322"
      :scorllTopLength="scorllTopLength"
    ></tank-news>
  </section>
</template>
<script>
import tankNews from '@/components/custom/tankNews'
export default {
    name: 'announce',
    data() {
        return {
            dataUrl: '/api/services/app/Announce/GetAll',
            sortUrl: '',
            createUrl: '/api/services/app/Announce/Create',
            updateUrl: '/api/services/app/Announce/Update',
            deleteUrl: '/api/services/app/Announce/Delete',
            dragUrl: '/api/services/app/Announce/Move'
        }
    },
    components: {
        tankNews
    },
    props: ['scorllTopLength', 'contentTitle'],
    methods: {
        refreshScroll() {
            this.$emit('refreshScroll')
        },
        reloadScroll() {
            this.$emit('reloadScroll')
        }
    },
    created() {}
}
</script>
