import { Validator } from 'vee-validate'
import zhCN from 'vee-validate/dist/locale/zh_CN'

Validator.localize('zh_CN', zhCN)

Validator.extend('mobile', {
    getMessage: field => '请输入正确的手机号码',
    validate: value => {
        return value.length === 11 && /^((13|14|15|17|18)[0-9]{1}\d{8})$/.test(value)
    }
})
Validator.extend('id', {
    getMessage: field => field + '必须包含字母和数字，且不小于6位不大于10位',
    validate: value => {
        return /^(?=.*\d)(?=.*[a-z]).{6,10}$/.test(value)
    }
})
Validator.extend('pass6', {
    getMessage: field => field + '必须包含字母和数字，且不小于6位',
    validate: value => {
        return /^(?=.*\d)(?=.*[a-z]).{6,20}$/.test(value)
    }
})
Validator.extend('pass', {
    getMessage: field => field + '必须包含大小写字母和数字，且不小于8位不大于10位',
    validate: value => {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,10}$/.test(value)
    }
})
Validator.extend('title', {
    getMessage: field => field + '只含有汉字、数字、字母、下划线不能以下划线开头和结尾',
    validate: v => /^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(v)
})
