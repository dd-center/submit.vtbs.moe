import Vue from 'vue'
import Vuex from 'vuex'

import { getList, loadFs, getMeta } from '@/worker'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    fileList: [],
    fsLoaded: false,
    meta: {}
  },
  mutations: {
    loadedFs(state) {
      state.fsLoaded = true
    },
    updateFileList(state, newList) {
      state.fileList = newList
    },
    updateMeta(state, meta) {
      state.meta = meta
    }
  },
  actions: {
    async loadFileList({ commit }) {
      const newList = await getList()
      commit('updateFileList', newList)
    },
    async loadFs({ commit }) {
      await loadFs()
      commit('updateMeta', await getMeta())
      commit('loadedFs')
    }
  }
})
