import Vue from 'vue'
import Vuex from 'vuex'

import { getList, loadFs, getMeta, diff, loadWorkspaceList, getIssues } from '@/worker'

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
    title: '',
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
      const command = []
      if (state.commit && state.username) {
        command.push(['name', state.name || state.username])
        if (state.email) {
          command.push(['email', state.email])
        }
      }
      if (state.title) {
        command.push(['title', state.title])
      }
      return command
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
    setTitle(state, title) {
      state.title = title
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
    workspaceList: [],
    issues: {}
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
    },
    updateIssues(state, issues) {
      state.issues = issues
    }
  },
  actions: {
    async loadFileList({ commit, dispatch }) {
      const newList = await getList()
      commit('updateFileList', newList)
      await dispatch('loadDiff')
    },
    async loadFs({ commit }) {
    async loadFs({ commit, dispatch }) {
      await loadFs()
      commit('updateMeta', await getMeta())
      await dispatch('loadIssues')
      commit('loadedFs')
    },
    async loadDiff({ commit }) {
      commit('updateDiff', await diff())
    },
    async loadWorkspaceList({ commit }) {
      commit('updateWorkspaceList', await loadWorkspaceList())
    },
    async loadIssues({ commit }) {
      commit('updateIssues', await getIssues())
    }
  },
  modules: { login }
})
