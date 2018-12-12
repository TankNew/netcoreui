<template>
  <section class="container-fluid">
    <tinymce ref="tinymce" @refreshScroll="refreshScroll" @reloadScroll="reloadScroll"
             :editorTop="70"
             :editorWidth="800"
             :scorllTopLength="scorllTopLength"></tinymce>
    <button type="button" class="btn btn-success" @click="getContent">获取</button>
    <button type="button" class="btn btn-success" @click="setContent">设置</button>
  </section>
</template>
<script>
  import tinymce from '@/components/custom/tinymce'
  export default {
    name: 'setting',
    data() {
      return {
      }
    },
    props: ['scorllTopLength'],
    components: { tinymce },
    methods: {
      getContent() {
        console.log(this.$refs.tinymce.getVal())
      },
      setContent() {
        this.$refs.tinymce.setVal('春天画画')
      },
      refreshScroll() {
        this.$emit('refreshScroll')
      },
      reloadScroll() {
        this.$emit('reloadScroll')
      }
    }
  }
</script>
