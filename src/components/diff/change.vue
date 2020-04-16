<template>
<div>
  <p :class="{ 'has-text-danger': status === 'remove', 'has-text-success': status === 'add', 'has-text-warning': status === 'update'}">{{file}} <button class="button is-small is-text" @click="reset">撤销</button></p>
</div>
</template>

<script>
import { mapActions } from 'vuex'

import { resetVtb } from '@/worker'

export default {
  props: ['status', 'file'],
  methods: {
    ...mapActions(['loadDiff']),
    async reset() {
      await resetVtb(this.file)
      await this.loadDiff()
    }
  }
}
</script>

<style scoped>
.red {
  color: red;
}
</style>
