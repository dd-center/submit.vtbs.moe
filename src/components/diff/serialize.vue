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
import { mapState, createNamespacedHelpers } from 'vuex'

import { serializeDiff } from '@/worker'

const { mapGetters } = createNamespacedHelpers('login')

export default {
  data() {
    return {
      code: [
        ['loading...']
      ]
    }
  },
  watch: {
    async command() {
      this.code = await serializeDiff(this.command)
    },
    diff: {
      immediate: true,
      async handler() {
        this.code = await serializeDiff(this.command)
      }
    }
  },
  computed: {
    ...mapState(['diff']),
    ...mapGetters(['command'])
  }
}
</script>

<style scoped>
code {
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
