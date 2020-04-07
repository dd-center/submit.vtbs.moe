<template>
<div class="vtb" :style="{ top: i * height + 'px' }" :i="i">
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
        <button class="button is-danger is-small" @click="remove">Remove</button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { mapActions } from 'vuex'

import { getVtbJson, deleteVtb } from '@/worker'

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

export const height = 110

export default {
  props: ['i', 'file'],
  data() {
    return {
      height,
      json: {},
      currentFile: undefined
    }
  },
  computed: {
    name() {
      const names = Object.values(this.json.name || { en: 'loading...' })[0]
      if (typeof names === 'string') {
        return names
      } else {
        return names[0]
      }
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
        await wait(Math.random() * 2333)
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
