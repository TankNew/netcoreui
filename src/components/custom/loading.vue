<template>
  <div :class="['loading-bg',isLoading?'':'d-none']">
    <i class="fas fa-spinner fa-spin fa-fw" style="font-size:80px;"></i>
  </div>
</template>
<style scoped>
  .loading-bg { position: absolute; left: 50%; top: 50%; background-color: rgba(0,0,0,.3); width: 100%; height: 100%; border-radius: 8px; z-index: 2; -webkit-transform: translate(-50%,-50%); -moz-transform: translate(-50%,-50%); -ms-transform: translate(-50%,-50%); -o-transform: translate(-50%,-50%); transform: translate(-50%,-50%); display: flex; justify-content: center; align-items: center; color: #fff; }
</style>
<script>
  export default {
    props: {
      isLoading: {
        type: Boolean,
        default: false
      }
    }
  }
</script>
