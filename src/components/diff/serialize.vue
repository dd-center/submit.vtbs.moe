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
          <th v-if="issue">before</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="[cmd, file, content = '', before = ''] in code" :key="`s_${file}`">
          <td>{{cmd}}</td>
          <td>{{file}}</td>
          <td><code v-if="!!content" :class="{ green: issue }">{{content}}</code></td>
          <td v-if="issue"><code v-if="before" class="red">{{before}}</code></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</template>

<script>
import { serializeDiff } from '@/worker'

export default {
  props: ['diff', 'command', 'issue'],
  data() {
    return {
      code: [
        ['loading...']
      ]
    }
  },
  watch: {
    async command() {
      this.code = await serializeDiff(this.command, this.issue)
    },
    diff: {
      immediate: true,
      async handler() {
        this.code = await serializeDiff(this.command, this.issue)
      }
    }
  }
}
</script>

<style scoped>
code {
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
}

code.red {
  color: #f14668;
}

code.green {
  color: rgb(30, 174, 80);
}
</style>
