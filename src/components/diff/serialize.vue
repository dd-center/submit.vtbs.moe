<template>
<div>
  <h1 class="title">序列化</h1>
  <h2 class="subtitle">Serialize</h2>
  <div class="table-container">
    <table class="table is-striped is-hoverable is-fullwidth">
      <thead>
        <tr>
          <th>Command</th>
          <th>File</th>
          <th>content</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="[cmd, file, content = ''] in code" :key="`s_${file}`">
          <td>{{cmd}}</td>
          <td>{{file}}</td>
          <td><code v-if="!!content">{{content}}</code></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex'

import { serializeDiff } from '@/worker'

export default {
  data() {
    return {
      code: [
        ['loading...']
      ]
    }
  },
  watch: {
    async diff() {
      this.code = await serializeDiff()
    }
  },
  async mounted() {
    this.code = await serializeDiff()
  },
  computed: mapState(['diff'])
}
</script>

<style scoped>
code {
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
