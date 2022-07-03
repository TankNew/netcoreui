<template>
  <section class="container-fluid">
    <p class="lead">
      <i class="far fa-copy text-primary mr-1"></i>
      {{ contentTitle }}
    </p>
    <b-alert show dismissible>
      <b>Info:</b> 网站多语言本地化设置，开启需要的语言支持，并可选择默认语言模式
    </b-alert>
    <b-aspect :aspect="aspect">
      <div class="lang-panel">
        <div class="lang-list">
          <b-overlay :show="langLoading" rounded="sm">
            <b-list-group>
              <b-list-group-item
                v-for="(item, index) in _app.languages"
                :key="index"
                :class="[
                  'd-flex align-items-center lang-list-item',
                  !item.enabled ? 'color-gray' : ''
                ]"
              >
                <i :class="[item.icon, 'fas', 'mr-3']"></i>
                <span class="mr-auto">
                  {{ item.displayName }}
                  <small class="color-primary" v-if="item.name === 'zh-CN'">系统</small>
                  <b-button
                    pill
                    variant="light"
                    size="sm"
                    v-if="!item.isDefault && item.enabled"
                    class="ml-1 lang-set-default"
                    @click="setDefaultLang(item, index)"
                    >设置为默认</b-button
                  >
                </span>
                <b-badge class="mr-1" v-if="item.isDefault" variant="success">默认语言</b-badge>

                <b-form-checkbox
                  switch
                  :disabled="item.isDefault || item.name === 'zh-CN'"
                  v-model="item.enabled"
                  @change="changeLangState(item, index)"
                ></b-form-checkbox>
              </b-list-group-item>
            </b-list-group>
          </b-overlay>
        </div>
      </div>
    </b-aspect>
  </section>
</template>
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
export default {
  data() {
    return {
      aspect: '4:3',
      langLoading: false
    }
  },
  computed: {
    ...mapState({
      _app: state => state.app
    })
  },
  props: ['contentTitle'],
  created() {
    this.load()
  },
  methods: {
    ...mapActions({
      getAllLanguages: 'getAllLanguages',
      setDefaultLangeuage: 'setDefaultLangeuage',
      addLangeuage: 'addLangeuage',
      removeLangeuage: 'removeLangeuage',
      setLanguageDefineByBrower: 'setLanguageDefineByBrower'
    }),

    async load() {
      await this.getAllLanguages()
    },
    async changeLangState(item, index) {
      this.langLoading = true
      if (!item.enabled) await this.addLangeuage({ name: item.name })
      else await this.removeLangeuage({ params: { name: item.name } })

      await this.load()
      this.langLoading = false
    },

    async setDefaultLang(item, index) {
      await this.setDefaultLangeuage({ name: item.name })

      // 过时设置： 网站语言是否跟随浏览器语言
      if (abp.localization.languageDefineByBrower)
        await this.setLanguageDefineByBrower({ isDefineByBrower: false })
    }
  }
}
</script>
<style lang="less" scoped>
</style>
