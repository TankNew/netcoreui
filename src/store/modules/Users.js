export default {
  state: {
    token: null,
    currentUser: null,
    macAddress: null
  },
  mutations: {
    setUser(state, val) {
      state.currentUser = val || null
    },
    setMacAddress(state, val) {
      state.macAddress = val || null
    },
    setToken(state, val) {
      state.token = val || null
    }
  },
  getters: {
    isAuthenticated(state) {
      //用两个!!就可以将变量转化为对应布尔值
      //，如果明确设置了o中flag的值（非 null/undefined/0""/等值），自然test就会取跟o.flag一样的值；如果没有设置，test就会默认为false，而不是 null或undefined。
      return !!state.currentUser
    },
    currentUser(state) {
      return state.currentUser
    },
    macAddress(state) {
      return state.macAddress
    },
    token(state) {
      return state.token || { AccessToken: null, EncryptedAccessToken: null, ExpireInSeconds: null, RefreshToken: null }
    }
  },
  actions: {}
}
