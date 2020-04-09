<template>
<div>
  <h1 class="title">发布</h1>
  <h2 class="subtitle">Issue</h2>
  <template v-if="diffLength && diffLength > 0">
    <textarea class="textarea" placeholder="附加信息" v-model="input"></textarea>
    <br>
    <code>{{issue}}</code>
    <hr>
    <button class="button is-link is-light" :class="{ 'is-loading': urlLoading }" @click="submit" v-if="!url">发布</button>
    <a :href="url" target="_blank" v-if="url">{{url}}</a>
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
import { diff, makeIssue, submitDiff } from '@/worker'

export default {
  data() {
    return {
      diffLength: undefined,
      input: '',
      issue: '',
      url: undefined,
      urlLoading: false
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
  },
  methods: {
    async submit() {
      this.urlLoading = true
      this.url = await submitDiff(this.input)
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
