import Vue from 'vue'
import Vuex from 'vuex'

import { getList } from '@/worker'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    fileList: []
  },
  mutations: {
    updateFileList(state, newList) {
      state.fileList = newList
    }
  },
  actions: {
    async loadFileList({ commit }) {
      const newList = await getList()
      commit('updateFileList', newList)
    }
  }
})
