<template>
<div>
  <h1 class="title">改变</h1>
  <h2 class="subtitle">Difference ({{diffLoad}})</h2>
  <change v-for="[file, status] in diff" :key="`diff_${file}`" :file="file" :status="status"></change>
</div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import change from './diff/change'

export default {
  data() {
    return { diffLoaded: false }
  },
  async mounted() {
    await this.loadDiff()
    this.diffLoaded = true
  },
  methods: mapActions(['loadDiff']),
  computed: {
    ...mapState(['diff']),
    diffLoad() {
      if (this.diffLoaded) {
        return this.diff.length
      } else {
        return 'loading...'
      }
    }
  },
  components: { change }
}
</script>
