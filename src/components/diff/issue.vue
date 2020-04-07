<template>
<div>
  <h1 class="title">发布</h1>
  <h2 class="subtitle">Issue</h2>
  <template v-if="diffLength && diffLength > 0">
    <textarea class="textarea" placeholder="附加信息" v-model="input"></textarea>
    <code>{{issue}}</code>
  </template>
  <span v-if="diffLength === undefined">
    loading...
  </span>
  <span v-if="diffLength === 0">
    无修改
  </span>
</div>
</template>

<script>
import { diff, makeIssue } from '@/worker'

export default {
  data() {
    return {
      diffLength: undefined,
      input: '',
      issue: ''
    }
  },
  async mounted() {
    this.diffLength = (await diff()).length
  },
  watch: {
    input: {
      immediate: true,
      async handler(input) {
        const issue = await makeIssue(input)
        if (this.input === input) {
          this.issue = issue
        }
      }
    }
  }
}
</script>

<style scoped>
code {
  display: block;
  white-space: pre-wrap;
}
</style>
