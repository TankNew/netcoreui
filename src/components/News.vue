<template>
  <news-manage :data="items" @refreshScroll="refreshScroll" @reloadScroll="reloadScroll"
               :scorllTopLength="scorllTopLength"></news-manage>
</template>
<script>
  import newsManage from '@/components/custom/newsManage'
  const items = [
    {
      id: 3,
      category: '重要通知',
      title: '一图看懂习近平对宣传思想工作的新要求3',
      content: '',
      topnum: 3,
      top: false,
      isfile: true,
      files: [
        { name: 'aaaaaaaaaaa', url: 'bbbbbbbbbbb' },
        { name: 'aaaaaaaaaaa', url: 'bbbbbbbbbbb' },
        { name: 'aaaaaaaaaaa', url: 'bbbbbbbbbbb' },
        { name: 'aaaaaaaaaaa', url: 'bbbbbbbbbbb' }
      ],
      createtime: '2017-8-10',
      modifytime: '2018-8-8'
    },
    {
      id: 2,
      category: '特别公告',
      title: '一图看懂习近平对宣传思想工作的新要求1',
      content: '',
      topnum: 2,
      top: false,
      isfile: false,
      files: [],
      createtime: '2017-8-10',
      modifytime: '2018-8-8'
    },
    {
      id: 1,
      category: '公告',
      title: '一图看懂习近平对宣传思想工作的新要求2',
      content: '',
      topnum: 1,
      top: true,
      isfile: false,
      files: [],
      createtime: '2017-8-10',
      modifytime: '2018-8-8'
    }
  ]
  export default {
    name: 'news',
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
      this.items = items
    }
  }
</script>
