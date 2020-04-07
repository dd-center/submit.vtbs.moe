<template>
<div class="container">
  <br>
  <diff v-if="fsLoaded"></diff>
</div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import diff from '@/components/diff'

export default {
  async mounted() {
    if (!this.fsLoaded) {
      await this.loadFs()
    }
  },
  components: { diff },
  computed: mapState(['fsLoaded']),
  methods: mapActions(['loadFs'])
}
</script>
