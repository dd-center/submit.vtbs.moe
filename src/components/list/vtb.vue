<template>
<div class="vtb" :style="{ top: i * height + 'px' }" :n="n">
  <br>
  <hr>
  <div class="columns is-mobile">
    <div class="column name">
      <h1 class="title is-4 name">{{name}}</h1>
      <h2 class="subtitle is-4 name">{{file}}</h2>
    </div>
    <div class="is-divider-vertical"></div>
    <div class="column">
      <span class="tag is-light is-medium" :class="{ 'is-link': type === 'group', 'is-primary': type === 'vtuber' }">{{type}}</span>
    </div>
    <div class="is-divider-vertical"></div>
    <div class="column">
      <div class="buttons">
        <router-link tag="button" class="button is-info is-small" :to="`edit/${file}`">编辑</router-link>
        <button class="button is-danger is-small" @click="remove">删除</button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import EventEmitter from 'events'
import { mapActions } from 'vuex'

import { getVtbJson, deleteVtb } from '@/worker'

export const height = 110

export const eventEmitter = new EventEmitter()

const onceCache = new Map()

const once = n => {
  if (!onceCache.has(n)) {
    const wait = new Promise(resolve => eventEmitter.once(n, resolve))
    onceCache.set(n, wait)
    wait.then(() => {
      onceCache.delete(n)
    })
  }
  return onceCache.get(n)
}

export default {
  props: ['i', 'file', 'n'],
  data() {
    return {
      height,
      json: {},
      currentFile: undefined
    }
  },
  computed: {
    name() {
      return [Object.values(this.json.name || {}), 'loading...'].flat()[0]
    },
    type() {
      return this.json.type || 'vtuber'
    }
  },
  methods: {
    ...mapActions(['loadFileList']),
    async remove() {
      await deleteVtb(this.file)
      await this.loadFileList()
    }
  },
  watch: {
    file: {
      immediate: true,
      async handler(newFile, oldFile) {
        if (newFile !== this.currentFile) {
          this.json = {}
        }
        await once(String(this.n))
        if (newFile === this.file) {
          if (newFile && newFile !== oldFile) {
            const json = await getVtbJson(newFile)
            if (newFile === this.file) {
              this.json = json
              this.currentFile = newFile
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.vtb {
  position: absolute;
  width: 100%;
  height: 26px;
}

.name {
  overflow-x: scroll;
}
</style>
