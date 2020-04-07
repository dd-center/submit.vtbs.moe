import Vue from 'vue'
import Vuex from 'vuex'

import { getList, loadFs } from '@/worker'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    fileList: [],
    fsLoaded: false
  },
  mutations: {
    loadedFs(state) {
      state.fsLoaded = true
    },
    updateFileList(state, newList) {
      state.fileList = newList
    }
  },
  actions: {
    async loadFileList({ commit }) {
      const newList = await getList()
      commit('updateFileList', newList)
    },
    async loadFs({ commit }) {
      await loadFs()
      commit('loadedFs')
    }
  }
})
