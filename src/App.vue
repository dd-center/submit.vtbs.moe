<template>
<div id="app">
</div>
</template>

<script>
import { loadFs, getFs } from '@/worker'

export default {
  async mounted() {
    await loadFs()
    console.log('fs loaded')
    console.log(await getFs())
  }
}
</script>
