import Vue from 'vue'
import Vuex from 'vuex'

import { getList, loadFs, getMeta, diff } from '@/worker'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    fileList: [],
    fsLoaded: false,
    meta: {},
    diff: []
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
    },
    updateDiff(state, diff) {
      state.diff = diff
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
    },
    async loadDiff({ commit }) {
      commit('updateDiff', await diff())
    }
  }
})
