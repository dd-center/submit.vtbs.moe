<template>
<div id="app">
  <router-view></router-view>
  <transition-group name="worker-list">
    <span class="tag is-rounded running" v-for="([key, run], i) in running" :key="`worker_${key}`" :style="{ bottom: i * 30 + 'px' }">{{run}}</span>
  </transition-group>
</div>
</template>

<script>
import { eventEmitter } from '@/worker/warp'

export default {
  data() {
    return { running: [] }
  },
  mounted() {
    eventEmitter.on('running', list => {
      this.running = list
    })
  }
}
</script>

<style scoped>
.running {
  position: fixed;
  right: 10px;
  transition: all 0.3s;
}

.worker-list-enter {
  opacity: 0;
  transform: translateY(-100px);
}

.worker-list-leave-to {
  opacity: 0;
  transform: translateY(40px);
}
</style>
