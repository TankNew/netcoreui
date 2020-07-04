<template>
  <section class="container-fluid">
    <p class="lead">
      <i class="far fa-copy text-primary mr-1"></i>
      {{contentTitle}}
    </p>
    <b-alert show dismissible>
      <b>Info:</b> 网站多语言本地化设置，开启需要的语言支持，并可选择默认语言模式
    </b-alert>
    <b-card>
      <b-aspect :aspect="aspect">
        <div class="lang-panel">
          <div class="lang-edit-panel">
            <b-list-group>
              <b-list-group-item
                href="#"
                :active="languageDefineByBrower"
                @click="setLanguageDefine(true)"
                class="flex-column align-items-start"
              >
                <div class="d-flex w-100 justify-content-between">
                  <h6 class="mb-1">默认语言-自动适配</h6>
                </div>

                <p class="mb-1 small">根据访客的地区进行自动语言适配</p>
              </b-list-group-item>
              <b-list-group-item
                href="#"
                :active="!languageDefineByBrower"
                @click="setLanguageDefine(false)"
                class="flex-column align-items-start"
              >
                <div class="d-flex w-100 justify-content-between">
                  <h6 class="mb-1">默认语言-手动选择</h6>
                </div>
              </b-list-group-item>
            </b-list-group>
          </div>
          <div class="lang-list">
            <b-overlay :show="langLoading" rounded="sm">
              <b-list-group>
                <b-list-group-item
                  href="#"
                  active
                  class="flex-column align-items-start"
                >
                  <h6 class="mb-1">多语言支持列表</h6>
                </b-list-group-item>
                <b-list-group-item
                  v-for="(item,index) in app.languages"
                  :key="index"
                  :class="['d-flex align-items-center lang-list-item',!item.enabled?'color-gray':'']"
                >
                  <i :class="[item.icon, 'fas','mr-3']"></i>
                  <span class="mr-auto">
                    {{item.displayName}}
                    <small
                      class="color-primary"
                      v-if="item.name==='zh-CN'"
                    >系统</small>
                    <b-button
                      pill
                      variant="light"
                      size="sm"
                      v-if="!item.isDefault&&item.enabled"
                      class="ml-1 lang-set-default"
                      @click="setDefaultLang(item,index)"
                    >设置为默认</b-button>
                  </span>
                  <b-badge
                    class="mr-1"
                    v-if="item.isDefault"
                    variant="success"
                  >默认语言</b-badge>

                  <b-form-checkbox
                    switch
                    :disabled="item.isDefault||item.name==='zh-CN'"
                    v-model="item.enabled"
                    @change="changeLangState(item,index)"
                  ></b-form-checkbox>
                </b-list-group-item>
              </b-list-group>
            </b-overlay>
          </div>
        </div>
      </b-aspect>
    </b-card>
  </section>
</template>
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
export default {
    data() {
        return {
            app: {},
            languageDefineByBrower: true,
            aspect: '16:9',
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
        syncApp() {
            this.app = JSON.parse(JSON.stringify(this._app))
        },
        async load() {
            this.languageDefineByBrower = abp.localization.languageDefineByBrower
            await this.getAllLanguages()
            this.syncApp()
        },
        async changeLangState(item, index) {
            this.langLoading = true
            if (!item.enabled) await this.addLangeuage({ name: item.name })
            else await this.removeLangeuage({ params: { name: item.name } })

            await this.load()
            this.langLoading = false
        },
        async setLanguageDefine(bool) {
            await this.setLanguageDefineByBrower({ isDefineByBrower: bool })
            abp.localization.setLanguageDefineByBrower(bool)
            this.languageDefineByBrower = abp.localization.languageDefineByBrower
        },
        async setDefaultLang(item, index) {
            await this.setDefaultLangeuage({ name: item.name })
            this.syncApp()
        }
    }
}
</script>
<style lang="less" scoped>
</style>
