import Axios from '../../plugins/AxiosPlugin'
import swal from 'sweetalert'

const state = {
    languages: []
}

const mutations = {
    setDefaultLanguage(state, val) {
        state.languages.forEach(x => {
            if (x.isDefault && x.name !== val) x.isDefault = false
            if (x.name === val) x.isDefault = true
        })
    },
    setLanguages(state, val) {
        state.languages = val
    },
    addLanguage(state, val, isDel = false) {
        state.languages.forEach(x => {
            if (x.name === val) {
                x.isDisabled = isDel
                x.enabled = !isDel
            }
        })
    }
}

const actions = {
    async getAllLanguages({ state, commit }) {
        const res = await Axios.get('/api/services/app/Configuration/GetAllLanguages')
        if (res.data.success) {
            commit(
                'setLanguages',
                res.data.result.map(f => {
                    f.enabled = !f.isDisabled
                    return f
                })
            )
        }
    },
    async setDefaultLangeuage({ commit }, params) {
        const res = await Axios.post('/api/services/app/Configuration/SetLanguageDefault', params)
        if (res.data.success) {
            commit('setDefaultLanguage', params.name)
        }
    },
    async addLangeuage({ commit }, params) {
        const res = await Axios.post('/api/services/app/Configuration/AddLanguage', params)
        if (res.data.success) {
            commit('addLanguage', params.name)
        }
    },
    async removeLangeuage({ commit }, params) {
        const res = await Axios.delete('/api/services/app/Configuration/RemoveLanguage', params)
        if (res.data.success) {
            commit('addLanguage', params.name, true)
        }
    },
    async setLanguageDefineByBrower({ commit }, params) {
        const res = await Axios.post('/api/services/app/Configuration/SetLanguageDefineByBrower', params)
    }
}

export default {
    state,
    mutations,
    actions
}
