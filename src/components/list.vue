<template>
<div class="index" ref="container">
  <div class="indexContainer" :style="{ height: nameList.length*30 + 'px' }">
    <div class="vtb" v-for="({i=0, name='loading'},n) in renderedList" :key="`vtb_${n}`" :style="{ top: i *30 + 'px' }" :i="i">
      {{name}}
    </div>
  </div>
</div>
</template>

<script>
import { getNameList } from '@/worker'

const RENDER_LENGTH = 100 * 2

export default {
  data() {
    return {
      nameList: [],
      renderTop: 0,
      lastIntersect: 0,
      renderedList: Array(RENDER_LENGTH).fill({}),
      observer: undefined
    }
  },
  async mounted() {
    this.nameList = await getNameList()
    this.observer = new IntersectionObserver(entries => entries.forEach(({ isIntersecting, target }) => {
      const i = Number(target.getAttribute('i'))
      if (isIntersecting) {
        this.lastIntersect = i
      }
    }), { root: this.$refs.container, thresholds: [0] })
    this.render(0, RENDER_LENGTH)
    await this.$nextTick()
    const vtbs = document.getElementsByClassName('vtb')
    Array(vtbs.length).fill().map((_, i) => vtbs[i]).map(vtb => this.observer.observe(vtb))
  },
  methods: {
    render(start, length) {
      Array(length).fill()
        .map((_, i) => i + start)
        .map(i => {
          const domIndex = i % RENDER_LENGTH
          const name = this.nameList[i]
          this.renderedList[domIndex] = { i, name }
        })
      this.renderedList = [...this.renderedList]
    }
  },
  watch: {
    renderTop(newVal, oldVal) {
      if (newVal > oldVal) {
        this.render(oldVal + RENDER_LENGTH, newVal - oldVal)
      } else if (oldVal > newVal) {
        this.render(newVal, oldVal - newVal)
      }
    },
    lastIntersect() {
      const { lastIntersect } = this
      const margin = lastIntersect - this.renderTop
      if (margin > RENDER_LENGTH / 2 || margin < RENDER_LENGTH / 2) {
        this.renderTop = Math.min(Math.max(lastIntersect - RENDER_LENGTH / 2, 0), this.nameList.length - RENDER_LENGTH)
      }
    }
  },
  beforeDestroy() {
    this.observer.disconnect()
  }
}
</script>

<style scoped>
.index {
  height: calc(100vh - 145px);
  overflow-y: auto;
}

.indexContainer {
  position: relative;
}

.vtb {
  position: absolute;
  width: 100%;
  height: 26px;
}
</style>
