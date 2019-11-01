const pkg = require('~/package')

const state = () => ({
  pathName: null
})

const mutations = {
  set(state, text) {
    state.pathName = text
  }
}
const getters = {
  currentPath(state) {
    return state.pathName || 'e德互联手机客服 - ' + pkg.name
  }
}

export default {
    state,
    mutations,
    getters
}
