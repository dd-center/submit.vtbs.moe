<template>
<div class="container high">
  <br>
  <h1 class="title">存档</h1>
  <h2 class="subtitle">Workspace ({{workspaceCount}})</h2>
  <hr>
  <div class="field has-addons">
    <div class="control">
      <input class="input" type="text" placeholder="名字" v-model="name" v-on:keyup.enter="save">
    </div>
    <div class="control">
      <button class="button is-info" @click="save">保存</button>
    </div>
  </div>
  <hr>

  <div class="field is-horizontal" v-for="save in workspaceList" :key="`save_${save}`">
    <div class="field-label is-normal">
      <label class="label">{{save}}</label>
    </div>
    <div class="field-body">
      <div class="field is-grouped">
        <div class="control"><button @click="load(save)" class="button is-info">载入</button></div>
        <div class="control"><button @click="remove(save)" class="button is-light is-danger"> 删除</button></div>
      </div>
    </div>
  </div>

  <br>
</div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import { saveWorkspace, loadWorkspace, deleteWorkspace } from '@/worker'

export default {
  data() {
    return {
      workspaceListLoaded: false,
      name: ''
    }
  },
  async mounted() {
    await this.loadWorkspaceList()
    this.workspaceListLoaded = true
  },
  computed: {
    workspaceCount() {
      if (this.workspaceListLoaded) {
        return this.workspaceList.length
      }
      return 'loading...'
    },
    ...mapState(['workspaceList'])
  },
  methods: {
    ...mapActions(['loadFileList', 'loadWorkspaceList']),
    async save() {
      const name = this.name
      if (name) {
        await saveWorkspace(name)
        await this.loadWorkspaceList()
      }
    },
    async load(name) {
      await loadWorkspace(name)
      await this.loadFileList()
    },
    async remove(name) {
      await deleteWorkspace(name)
      await this.loadWorkspaceList()
    }
  }
}
</script>

<style scoped>
.high {
  min-height: 100vh;
}
</style>
