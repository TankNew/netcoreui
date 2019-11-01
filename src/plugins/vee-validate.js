import Vue from 'vue'
import VeeValidate from 'vee-validate'
import './Validator.config'

const Veeconfig = {
  errorBagName: 'errors', // change if property conflicts.
  fieldsBagName: 'vvFields',
  delay: 0,
  events: 'input|blur',
  locale: 'zh_CN',
  strict: true
}

Vue.use(VeeValidate, Veeconfig)
