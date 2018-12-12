<template>
  <news-manage :data="items" @refreshScroll="refreshScroll" @reloadScroll="reloadScroll" :scorllTopLength="scorllTopLength"></news-manage>
</template>
<script>
import newsManage from '@/components/custom/newsManage'
export default {
  name: 'announce',
  data() {
    return {
      items: []
    }
  },
  components: {
    newsManage
  },
  props: ['scorllTopLength'],
  methods: {
    refreshScroll() {
      this.$emit('refreshScroll')
    },
    reloadScroll() {
      this.$emit('reloadScroll')
    }
  },
  created() {
    //this.items = items
  }
}
</script>
