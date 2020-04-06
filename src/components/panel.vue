<template>
<div class="container">
  <list v-if="loaded"></list>
</div>
</template>

<script>
import { loadFs } from '@/worker'

import list from '@/components/list'

export default {
  data() { return { loaded: false } },
  async mounted() {
    await loadFs()
    this.loaded = true
  },
  components: { list }
}
</script>
