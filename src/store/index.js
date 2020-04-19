import Vue from 'vue'
import Vuex from 'vuex'

import { getList, loadFs, getMeta, diff, loadWorkspaceList } from '@/worker'

import { getUser, saveToken } from '@/components/login/w'

Vue.use(Vuex)

const login = {
  namespaced: true,
  state: {
    username: undefined,
    name: undefined,
    token: undefined,
    email: undefined,
    fail: false,
    extra: {},
    commit: true
  },
  getters: {
    currentState: state => {
      if (state.username) {
        return `(${state.name || state.username})`
      } else if (state.fail) {
        return '(登陆失败)'
      } else if (state.token) {
        return '(登陆中)'
      }
      return ''
    },
    command: state => {
      if (state.commit && state.username) {
        const command = [
          ['name', state.name || state.username]
        ]
        if (state.email) {
          command.push(['email', state.email])
        }
        return command
      }
      return []
    }
  },
  mutations: {
    setToken: (state, token) => {
      state.token = token
      saveToken(token)
    },
    fail: state => {
      state.fail = true
    },
    setUsername: (state, username) => {
      state.username = username
    },
    setName: (state, name) => {
      state.name = name
    },
    setEmail: (state, email) => {
      state.email = email
    },
    setExtra: (state, extra = {}) => {
      state.extra = extra
    },
    setCommit: (state, newValue) => {
      state.commit = newValue
    }
  },
  actions: {
    updateToken: async ({ commit }, token) => {
      commit('setToken', token)
      if (token) {
        const { login, name, email, avatar, url } = await getUser(token).catch(() => ({}))
        if (login) {
          commit('setUsername', login)
          commit('setExtra', { avatar, url })
          if (name) {
            commit('setName', name)
          }
          if (email) {
            commit('setEmail', email)
          }
        } else {
          commit('fail')
        }
      } else {
        commit('setUsername')
        commit('setExtra')
        commit('setName')
        commit('setEmail')
      }
    }
  }
}

export default new Vuex.Store({
  state: {
    fileList: [],
    fsLoaded: false,
    meta: {},
    diff: [],
    workspaceList: []
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
    },
    updateWorkspaceList(state, list) {
      state.workspaceList = list
    }
  },
  actions: {
    async loadFileList({ commit, dispatch }) {
      const newList = await getList()
      commit('updateFileList', newList)
      await dispatch('loadDiff')
    },
    async loadFs({ commit }) {
      await loadFs()
      commit('updateMeta', await getMeta())
      commit('loadedFs')
    },
    async loadDiff({ commit }) {
      commit('updateDiff', await diff())
    },
    async loadWorkspaceList({ commit }) {
      commit('updateWorkspaceList', await loadWorkspaceList())
    }
  },
  modules: { login }
})
