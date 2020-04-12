<template>
<div class="index" ref="container">
  <div class="indexContainer" :style="{ height: totalHeight+ 'px' }">
    <vtb v-for="({i=0,file},n) in renderedList" :key="`vtb_${n}`" :i="i" :file="file" :n="n"></vtb>
    <div class="detectors" v-for="({height,top,i},n) in detectors" :key="`detector_${n}`" :i="i" :style="{ height:`${height}px`, top:`${top}px` }"></div>
  </div>
</div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import vtb, { height, eventEmitter } from './list/vtb'

const RENDER_LENGTH = 150

export default {
  data() {
    return {
      height,
      renderTop: 0,
      lastIntersect: 0,
      renderedList: Array(RENDER_LENGTH).fill({}),
      observer: undefined,
      intersectionObserver: undefined
    }
  },
  async mounted() {
    await this.loadFileList()
    this.observer = new IntersectionObserver(entries => entries.forEach(({ isIntersecting, target }) => {
      if (isIntersecting) {
        const n = target.getAttribute('n')
        eventEmitter.emit(n)
      }
    }), { root: this.$refs.container, thresholds: [0] })
    this.intersectionObserver = new IntersectionObserver(entries => entries.forEach(({ isIntersecting, target }) => {
      if (isIntersecting) {
        const i = Number(target.getAttribute('i'))
        this.lastIntersect = i
      }
    }), { root: this.$refs.container, thresholds: [0] })
    await this.$nextTick()
    const vtbs = document.getElementsByClassName('vtb')
    Array(vtbs.length).fill().map((_, i) => vtbs[i]).forEach(vtb => this.observer.observe(vtb))
    const detectors = document.getElementsByClassName('detectors')
    Array(detectors.length).fill().map((_, i) => detectors[i]).forEach(detector => this.intersectionObserver.observe(detector))
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
    ...mapActions(['loadFileList'])
  },
  watch: {
    async displayFileList() {
      this.render(this.renderTop, RENDER_LENGTH)
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
      return this.fileList
    },
    totalHeight() {
      return this.displayFileList.length * this.height
    },
    detectors() {
      const num = Math.round(this.displayFileList.length / RENDER_LENGTH * 3) + 1
      const height = this.totalHeight / num
      return Array(num).fill().map((_, i) => ({ height, top: i * height, i: Math.round(this.displayFileList.length / num * i) }))
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
}

.detectors {
  position: absolute;
}
</style>
