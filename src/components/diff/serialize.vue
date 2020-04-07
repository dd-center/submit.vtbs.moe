<template>
<div>
  <h1 class="title">序列化</h1>
  <h2 class="subtitle">Serialize</h2>
  <div class="table-container">
    <table class="table is-striped is-hoverable">
      <thead>
        <tr>
          <th>Command</th>
          <th>File</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="[cmd, file] in code" :key="`s_${file}`">
          <td>{{cmd}}</td>
          <td>{{file}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</template>

<script>
import { serializeDiff } from '@/worker'

export default {
  data() {
    return {
      code: [
        ['loading...']
      ]
    }
  },
  async mounted() {
    this.code = await serializeDiff()
  }
}
</script>
