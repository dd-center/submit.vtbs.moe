<template>
<div id="app">
  <div>
    <section class="hero is-success is-fullheight is-bold">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            submit.vtbs.moe
          </h1>
          <h2 class="subtitle">
            你好呀
          </h2>
        </div>
      </div>
      <div class="hero-foot">
        <nav class="tabs" v-if="fsLoaded">
          <div class="container">
            <ul>
              <router-link tag="li" to="/" class="link"><a class="aLink">Panel</a></router-link>
              <router-link tag="li" to="/edit" class="link"><a class="aLink">新建</a></router-link>
              <router-link tag="li" to="/submit" class="link"><a class="aLink">提交!</a></router-link>
            </ul>
          </div>
        </nav>
        <div v-else class="container">
          Loading...
        </div>
      </div>
    </section>
    <router-view v-if="fsLoaded"></router-view>
  </div>
  <transition-group name="worker-list">
    <span class="tag is-rounded running" v-for="([key, run], i) in running" :key="`worker_${key}`" :style="{ bottom: i * 30 + 'px' }">{{run}}</span>
  </transition-group>
</div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import { eventEmitter } from '@/worker/warp'

export default {
  data() {
    return { running: [] }
  },
  mounted() {
    eventEmitter.on('running', list => {
      this.running = list
    })
    if (!this.fsLoaded) {
      this.loadFs()
    }
  },
  computed: mapState(['fsLoaded']),
  methods: mapActions(['loadFs'])
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

.link {
  border-color: rgba(0, 0, 0, 0);
  border-radius: 5px;
  border-style: solid;
  border-width: 1px;
  margin-bottom: 4px;
}

.router-link-exact-active {
  border-color: rgba(0, 0, 0, 0.2);
}

.aLink {
  padding: 8px 16px 8px 16px;
  border: 0;
}
</style>
