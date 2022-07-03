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
/* 
    默认情况下，模块内部的 action、mutation 和 getter 是注册在全局命名空间的
    ——这样使得多个模块能够对同一 mutation 或 action 作出响应。 
*/
const actions = {
  /* HR操作部分 */
  async getAllHrsAsync(context, params) {
    const res = await Axios.get('/api/services/app/Hr/GetAll', params)
    return res.data
  },
  async getHrAsync(context, params) {
    const res = await Axios.get('/api/services/app/Hr/Get', params)
    return res.data
  },
  async createHrAsync(context, params) {
    const res = await Axios.post('/api/services/app/Hr/Create', params)
    return res.data
  },
  async updateHrAsync(context, params) {
    const res = await Axios.put('/api/services/app/Hr/Update', params)
    return res.data
  },
  async deleteHrAsync(context, params) {
    const res = await Axios.delete('/api/services/app/Hr/Delete', params)
    return res.data
  },
  async moveHrAsync(context, params) {
    const res = await Axios.post('/api/services/app/Hr/Move', params)
    return res.data
  },

  /* 角色部分 */
  async getAllRolesAsync(context, params) {
    const res = await Axios.get('/api/services/app/Role/GetAll', params)
    return res.data
  },
  async getAllPermissionsAsync(context, params) {
    const res = await Axios.get(
      '/api/services/app/Role/GetAllPermissions',
      params
    )
    return res.data
  },
  async getRoleForEditAsync(context, params) {
    const res = await Axios.get('/api/services/app/Role/GetRoleForEdit', params)
    return res.data
  },
  async createRoleAsync(context, params) {
    const res = await Axios.post('/api/services/app/Role/Create', params)
    return res.data
  },
  async updateRoleAsync(context, params) {
    const res = await Axios.put('/api/services/app/Role/Update', params)
    return res.data
  },
  async deleteRoleAsync(context, params) {
    const res = await Axios.delete('/api/services/app/Role/Delete', params)
    return res.data
  },

  /* 成员部分 */
  async getAllUsersAsync(context, params) {
    const res = await Axios.get('/api/services/app/User/GetAll', params)
    return res.data
  },
  async getUserAsync(context, params) {
    const res = await Axios.get('/api/services/app/User/Get', params)
    return res.data
  },
  async createUserAsync(context, params) {
    const res = await Axios.post('/api/services/app/User/Create', params)
    return res.data
  },
  async updateUserAsync(context, params) {
    const res = await Axios.put('/api/services/app/User/Update', params)
    return res.data
  },
  async deleteUserAsync(context, params) {
    const res = await Axios.delete('/api/services/app/User/Delete', params)
    return res.data
  },
  async activeUserAsync(context, params) {
    const res = await Axios.post('/api/services/app/User/Active', params)
    return res.data
  },
  async deActiveUserAsync(context, params) {
    const res = await Axios.post('/api/services/app/User/DeActive', params)
    return res.data
  },
  async getRolesAsync(context, params) {
    const res = await Axios.get('/api/services/app/User/GetRoles', params)
    return res.data
  },
  async getUserLessAsync(context, params) {
    const res = await Axios.get(
      '/api/services/app/User/GetUserLessInfo',
      params
    )
    return res.data
  },
  async getAllUserLessesAsync(context, params) {
    const res = await Axios.get(
      '/api/services/app/User/GetAllUserLesses',
      params
    )
    return res.data
  },
  async moveUserAsync(context, params) {
    const res = await Axios.post('/api/services/app/User/Move', params)
    return res.data
  },

  /* 动态属性 */
  async getAllPropertyAsync(context, params) {
    const res = await Axios.get(`/api/services/app/User/GetAllProperty`, params)
    return res.data
  },
  async deletePropertyAsync(context, params) {
    const res = await Axios.delete(
      `/api/services/app/User/DeleteProperty`,
      params
    )
    return res.data
  },
  async createPropertyAsync(context, params) {
    const res = await Axios.post(
      `/api/services/app/User/CreateProperty`,
      params
    )
    return res.data
  },
  async updatePropertyAsync(context, params) {
    const res = await Axios.put(`/api/services/app/User/UpdateProperty`, params)
    return res.data
  },
  /* Language操作部分 */
  async getAllLanguages({ commit }) {
    const res = await Axios.get('/api/services/app/settings/GetAllLanguages')
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
    const res = await Axios.post(
      '/api/services/app/settings/SetLanguageDefault',
      params
    )
    if (res.data.success) {
      commit('setDefaultLanguage', params.name)
    }
  },
  async addLangeuage({ commit }, params) {
    const res = await Axios.post(
      '/api/services/app/settings/AddLanguage',
      params
    )
    if (res.data.success) {
      commit('addLanguage', params.name)
    }
  },
  async removeLangeuage({ commit }, params) {
    const res = await Axios.delete(
      '/api/services/app/settings/RemoveLanguage',
      params
    )
    if (res.data.success) {
      commit('addLanguage', params.name, true)
    }
  },
  async setLanguageDefineByBrower({ commit }, params) {
    const res = await Axios.post(
      '/api/services/app/settings/SetLanguageDefineByBrower',
      params
    )
  }
}

export default {
  state,
  mutations,
  actions
}
