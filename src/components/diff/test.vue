<template>
<div>
  <h1 class="title">测试</h1>
  <h2 class="subtitle" v-if="loading">少女祈祷中...</h2>
  <template v-else>
    <h2 class="subtitle">Error: {{errors.length}}</h2>
    <p class="has-text-danger" v-for="(error, n) in errors" :key="`error_${n}`">{{error}}</p>
  </template>
</div>
</template>

<script>
import { mapState } from 'vuex'

import { test } from '@/worker'

export default {
  data() {
    return {
      errors: [],
      loading: true
    }
  },
  watch: {
    async diff() {
      this.loading = true
      this.errors = await test()
      this.loading = false
    }
  },
  async mounted() {
    this.errors = await test()
    this.loading = false
  },
  computed: mapState(['diff'])
}
</script>

<style>

</style>
