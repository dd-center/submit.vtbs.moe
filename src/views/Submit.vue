<template>
<div class="container">
  <br>
  <template v-if="fsLoaded">
    <diff></diff>
    <hr>
    <serialize></serialize>
    <hr>
    <issue></issue>
    <br>
  </template>
</div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import diff from '@/components/diff'
import serialize from '@/components/diff/serialize'
import issue from '@/components/diff/issue'

export default {
  async mounted() {
    if (!this.fsLoaded) {
      await this.loadFs()
    }
  },
  components: { diff, serialize, issue },
  computed: mapState(['fsLoaded']),
  methods: mapActions(['loadFs'])
}
</script>
