<template>
  <div v-if="addProperty" class="user-new">
    <div class="user-new-property">
      <h6>{{ isUpdate ? '编辑扩展属性' : '新增扩展属性' }}</h6>
      <hr />
      <b-form
        @submit.stop.prevent=""
        autocomplete="off"
        data-vv-scope="form-property"
      >
        <b-form-group label="属性名（英文）" label-size="sm">
          <b-form-input
            size="sm"
            placeholder="属性定义，例如:job"
            name="属性名"
            v-model="dyProperty.propertyName"
            v-validate="{
              required: addProperty
            }"
            :state="!errors.has('form-property.属性名')"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="显示名（中英文）" label-size="sm">
          <b-form-input
            size="sm"
            placeholder="公开显示名称，例如:工作岗位"
            name="显示名"
            v-model="dyProperty.displayName"
            v-validate="{
              required: addProperty
            }"
            :state="!errors.has('form-property.显示名')"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          label="属性类型"
          label-size="sm"
          v-slot="{ ariaDescribedby }"
        >
          <b-form-radio-group
            size="sm"
            v-model="dyProperty.inputType"
            :options="inputTypes"
            :aria-describedby="ariaDescribedby"
            name="radio-inline"
          ></b-form-radio-group>
        </b-form-group>
        <div v-if="dyProperty.inputType !== `SINGLE_LINE_STRING`">
          <b-form-group
            v-for="(pv, index) in dyProperty.allValuesInputTypeHas"
            :key="index"
            class="user-property"
            label="属性可选值"
            label-size="sm"
          >
            <b-form-input
              size="sm"
              v-model="dyProperty.allValuesInputTypeHas[index]"
              :name="`属性值` + index"
              v-validate="{
                required: dyProperty.inputType !== `SINGLE_LINE_STRING`
              }"
              :state="!errors.has('form-property.属性值' + index)"
            ></b-form-input>
            <i
              class="far fa-times-circle mx-2 pointer"
              @click="removeValueFromProperty(index)"
            ></i>
          </b-form-group>

          <b-button size="sm" @click="pushNewValueToProperty"
            >增加属性可选值</b-button
          >
        </div>
      </b-form>
    </div>
    <div class="user-new-value">
      <b-button size="sm" variant="primary" @click="submitProperty"
        >应用</b-button
      >
      <b-button size="sm" variant="light" @click="outEditMode">取消</b-button>
    </div>
  </div>
</template>
<script>
import { mapActions } from 'vuex'
const baseProperty = {
  propertyId: 0,
  propertyName: '',
  displayName: '',
  inputType: `SINGLE_LINE_STRING`,
  allValuesInputTypeHas: []
}
export default {
  data() {
    return {
      dyProperty: JSON.parse(JSON.stringify(baseProperty)),
      addProperty: false,
      isUpdate: false,
      inputTypes: [
        { text: '单行文本', value: 'SINGLE_LINE_STRING' },
        { text: '单选', value: 'COMBOBOX' },
        { text: '多选', value: 'CHECKBOX' }
      ]
    }
  },
  methods: {
    ...mapActions([`createPropertyAsync`, `updatePropertyAsync`]),
    outEditMode() {
      this.addProperty = false
      this.isUpdate = false
      this.dyProperty = JSON.parse(JSON.stringify(baseProperty))
      this.$emit('closePropertyMode')
    },
    newProperty() {
      this.addProperty = true
      this.isUpdate = false
      this.dyProperty = JSON.parse(JSON.stringify(baseProperty))
    },
    editProperty(property) {
      this.addProperty = true
      this.isUpdate = true
      this.dyProperty = JSON.parse(JSON.stringify(property))
    },
    pushNewValueToProperty() {
      this.dyProperty.allValuesInputTypeHas.push(null)
    },
    removeValueFromProperty(index) {
      this.dyProperty.allValuesInputTypeHas.splice(index, 1)
    },
    async submitProperty() {
      if (await this.validate('form-property')) {
        let data
        if (!this.isUpdate) {
          data = await this.createPropertyAsync(this.dyProperty)
        } else {
          data = await this.updatePropertyAsync(this.dyProperty)
        }
        if (data.success) {
          this.$emit(`reloadUser`) // 重新加载父级当前用户
          this.outEditMode() // 退出动态属性编辑模式
        } else {
          swal('发生错误!', data.error, 'error')
        }
      } else {
        swal({
          title: '请填写必要的选项!',
          icon: 'warning'
        })
      }
    },
    async validate(scope) {
      let res
      await this.$validator.validateAll(scope).then(async result => {
        res = result
      })
      return res
    }
  }
}
</script>
