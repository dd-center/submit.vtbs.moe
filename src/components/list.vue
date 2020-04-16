<template>
<div class="index" ref="container">
  <div class="control search" :class="{ 'is-loading' : searching}">
    <input class="input" type="text" placeholder="搜索" v-model="searchInput">
  </div>
  <div class="indexContainer" :style="{ height: totalHeight + 'px' }">
    <vtb v-for="({i=0,file},n) in renderedList" :key="`vtb_${n}`" :i="i" :file="file" :n="n"></vtb>
    <div class="detectors" v-for="({height,top,i,ref}) in detectors" :key="ref" :i="i" :ref="'detectors'" :style="{ height:`${height}px`, top:`${top}px` }"></div>
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

const RENDER_LENGTH = 150

let lastIntersectN = 0

export default {
  data() {
    return {
      height,
      renderTop: 0,
      lastIntersect: 0,
      renderedList: Array(RENDER_LENGTH).fill({}),
      observer: undefined,
      intersectionObserver: undefined,
      searchInput: '',
      searchResult: undefined,
      searching: false
    }
  },
  async mounted() {
    await this.loadFileList()
    this.observer = new IntersectionObserver(entries => entries.forEach(({ isIntersecting, target }) => {
      if (isIntersecting) {
        const n = target.getAttribute('n')
        eventEmitter.emit(n)
        lastIntersectN = Number(n)
      }
    }), { root: this.$refs.container, thresholds: [0], rootMargin: '80px 0px 20px 0px' })
    this.intersectionObserver = new IntersectionObserver(entries => entries.forEach(({ isIntersecting, target }) => {
      if (isIntersecting) {
        const i = Number(target.getAttribute('i'))
        this.lastIntersect = i
      }
    }), { root: this.$refs.container, thresholds: [0] })
    await this.$nextTick()
    const vtbs = document.getElementsByClassName('vtb')
    Array(vtbs.length).fill().map((_, i) => vtbs[i]).forEach(vtb => this.observer.observe(vtb))
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
    async detectors(detectors, oldDetectors = []) {
      await this.$nextTick()
      if (this.$refs.detectors) {
        this.$refs.detectors.forEach(detector => this.intersectionObserver.observe(detector))
      }
    },
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
    },
    lastIntersect() {
      const { lastIntersect } = this
      this.renderTop = Math.max(0, lastIntersect - RENDER_LENGTH / 3)
    }
  },
  beforeDestroy() {
    this.observer.disconnect()
    this.intersectionObserver.disconnect()
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
    },
    detectors() {
      const num = Math.round(this.displayFileList.length / RENDER_LENGTH * 3) + 1
      const height = this.totalHeight / num
      return Array(num).fill().map((_, i) => ({ ref: `detector_${i}`, height, top: i * height, i: Math.round(this.displayFileList.length / num * i) }))
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
