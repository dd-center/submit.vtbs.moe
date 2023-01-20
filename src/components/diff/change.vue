<template>
<div>
  <p :class="{ 'has-text-danger': status === 'remove', 'has-text-success': status === 'add', 'has-text-warning': status === 'update'}">{{file}} <button class="button is-small is-text" @click="reset" v-if="!noReset">撤销</button></p>
</div>
</template>

<script>
import { mapActions } from 'vuex'

import { resetVtb } from '@/worker'

export default {
  props: ['status', 'file', 'noReset', 'issue'],
  methods: {
    ...mapActions(['loadFileList']),
    async reset() {
      await resetVtb(this.file, this.issue)
      await this.loadFileList()
    }
  }
}
</script>

<style scoped>
.red {
  color: red;
}
</style>
