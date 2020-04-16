<template>
<div>
  <h1 class="title">改变</h1>
  <h2 class="subtitle">Difference ({{diff.length}})</h2>
  <change v-for="[file, status] in diff" :key="`diff_${file}`" :file="file" :status="status"></change>
</div>
</template>

<script>
import { mapState } from 'vuex'

import change from './diff/change'

export default {
  computed: mapState(['diff']),
  components: { change }
}
</script>
