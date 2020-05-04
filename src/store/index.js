import Vue from 'vue'
import Vuex from 'vuex'

import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'

import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

//在开发模式下检查语法、调用规范等错误
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  strict: debug,
  //用于记录日志
  plugins: debug ? [createLogger()] : []
})
