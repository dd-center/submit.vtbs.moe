<template>
<div class="index" ref="container">
  <div class="control search" :class="{ 'is-loading' : searching}">
    <input class="input" type="text" placeholder="搜索" v-model="searchInput">
  </div>
  <div class="indexContainer" :ref="'bigDetector'" :style="{ height: totalHeight + 'px' }">
    <vtb v-for="({i=0,file},n) in renderedList" :key="`vtb_${n}`" :i="i" :file="file" :n="n"></vtb>
  </div>
  <template v-if="!displayFileList.length">
    <br>
    <hr>
    <p>无结果...</p>
  </template>
</div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { searchList } from '@/worker'

import vtb, { height, eventEmitter } from './list/vtb'

const RENDER_LENGTH = 64

let lastIntersectN = 0
const threshold = Array(1000).fill().map((_, i) => i / 1000)

export default {
  data() {
    return {
      height,
      renderTop: 0,
      renderedList: Array(RENDER_LENGTH).fill({}),
      observer: undefined,
      bigObserver: undefined,
      searchInput: '',
      searchResult: undefined,
      searching: false
    }
  },
  async mounted() {
    this.observer = new IntersectionObserver(entries => entries.forEach(({ isIntersecting, target }) => {
      if (isIntersecting) {
        const n = target.getAttribute('n')
        eventEmitter.emit(n)
        lastIntersectN = Number(n)
      }
    }), { root: this.$refs.container, rootMargin: '80px 0px 20px 0px' })
    this.bigObserver = new IntersectionObserver(entries => entries.forEach((w) => {
      this.renderTop = Math.round(Math.max(0, w.intersectionRatio * this.displayFileList.length - RENDER_LENGTH / 2))
    }), { root: this.$refs.container, rootMargin: '9999999px 0px 0px 0px', threshold })

    await this.loadFileList()
    await this.$nextTick()
    const vtbs = document.getElementsByClassName('vtb')
    Array(vtbs.length).fill().map((_, i) => vtbs[i]).forEach(vtb => this.observer.observe(vtb))
    this.bigObserver.observe(this.$refs.bigDetector)
  },
  methods: {
    render(start, length) {
      Array(length).fill()
        .map((_, i) => i + start)
        .forEach(i => {
          const domIndex = i % RENDER_LENGTH
          const file = this.displayFileList[i]
          if (file) {
            this.renderedList[domIndex] = { i, file }
          } else {
            this.renderedList[domIndex] = { i: -10 }
          }
        })
      this.renderedList = [...this.renderedList]
    },
    async search(string) {
      const keys = string.toLowerCase().split(' ').filter(Boolean)
      if (keys.length) {
        this.searching = true
        const result = await searchList(keys)
        if (string === this.searchInput) {
          this.searchResult = result
          this.searching = false
        }
      } else {
        this.searching = false
        this.searchResult = undefined
      }
    },
    ...mapActions(['loadFileList'])
  },
  watch: {
    async searchInput(string) {
      this.search(string)
    },
    fileList() {
      if (this.searchInput) {
        this.search(this.searchInput)
      }
    },
    async displayFileList() {
      this.render(this.renderTop, RENDER_LENGTH)
      await this.$nextTick()
      Array(15)
        .fill(Math.max(0, lastIntersectN + RENDER_LENGTH - 9))
        .map((base, i) => (i + base) % RENDER_LENGTH)
        .map(String)
        .forEach(n => eventEmitter.emit(n))
    },
    renderTop(newVal, oldVal) {
      if (newVal > oldVal) {
        const start = Math.max(newVal, oldVal + RENDER_LENGTH)
        const end = Math.min(newVal + RENDER_LENGTH, this.displayFileList.length)
        if (start < end) {
          const length = end - start
          this.render(start, length)
        }
      } else if (oldVal > newVal) {
        const end = Math.min(oldVal, newVal + RENDER_LENGTH)
        const length = end - newVal
        this.render(newVal, length)
      }
    }
  },
  beforeDestroy() {
    this.observer.disconnect()
    this.bigObserver.disconnect()
  },
  components: {
    vtb
  },
  computed: {
    ...mapState(['fileList']),
    displayFileList() {
      return this.searchResult || this.fileList
    },
    totalHeight() {
      return this.displayFileList.length * this.height
    }
  }
}
</script>

<style scoped>
.index {
  height: calc(100vh - 50px);
  overflow-y: auto;
  overflow-x: hidden;
}

.indexContainer {
  position: relative;
  top: -25px;
}

.search {
  position: relative;
  z-index: 100;
  top: 8px;
}

.detectors {
  position: absolute;
}
</style>
