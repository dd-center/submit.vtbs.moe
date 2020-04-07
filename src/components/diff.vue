<template>
<div>
  <h1 class="title">改变</h1>
  <h2 class="subtitle">Difference ({{diffLoad}})</h2>
  <change v-for="[file, status] in diff" :key="`diff_${file}`" :file="file" :status="status"></change>
</div>
</template>

<script>
import { diff } from '@/worker'

import change from './diff/change'

export default {
  data() {
    return { diff: [], diffLoad: 'loadingi' }
  },
  async mounted() {
    this.diff = await diff()
    this.diffLoad = this.diff.length
  },
  components: { change }
}
</script>
