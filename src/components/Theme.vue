<template>
  <section class="container-fluid">
    <p class="lead">
      <i class="far fa-copy text-primary mr-1"></i>
      {{contentTitle}}
    </p>
    <b-jumbotron header="稍后上线" lead="Ednet.CMS 5.2版将包含这个功能">
      <p>期待您的任何建议与建议！</p>
      <b-button variant="primary" href="http://www.ednet.cn">前往官网</b-button>
    </b-jumbotron>
  </section>
</template>
<script>
export default {
    props: ['contentTitle']
}
</script>
