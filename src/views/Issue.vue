<template>
<div class="container">
  <div class="boxx">
    <h1 class="title">{{title}}</h1>
    <p>
      <button class="delete is-large" v-if="apply" @click.prevent="unapplyIssue(id)"></button>
      <button class="button is-success" v-else @click.prevent="applyIssue(id)">Load</button>
      <br>
      issue <a :href="issueLink" target="_blank" rel="noopener noreferrer">{{ issueLink }}</a>
      <br>
      diff <a :href="diffLink" target="_blank" rel="noopener noreferrer">{{ diffLink }}</a>
    </p>
    <hr>
    <diff :diff="diff" :noReset="!apply" :issue="id"></diff>
    <hr>
    <test :diff="diff" :issue="id"></test>
    <hr>
    <serialize :diff="diff" :command="currentIssue.commands" :issue="id"></serialize>
    <hr>
    <code>
      {{ currentIssue.issue.body }}
    </code>
  </div>
</div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import diff from '@/components/diff'
import serialize from '@/components/diff/serialize'
import test from '@/components/diff/test'

import { diff as difff } from '@/worker'

export default {
  props: ['id'],
  data: () => ({
    diff: []
  }),
  async created() {
    this.diff = await difff(this.id)
  },
  computed: {
    ...mapState(['issues', 'issuesApply']),
    currentIssue() {
      return this.issues[this.id]
    },
    issueLink() {
      return `http://github.com/dd-center/vdb/issues/${this.currentIssue.issue.number}`
    },
    diffLink() {
      return `https://github.com/dd-center/vdb/compare/master...submit-${this.currentIssue.issue.number}`
    },
    title() {
      return (this.currentIssue.commands.filter(([cmd]) => cmd === 'title')[0] || [undefined, 'update'])[1]
    },
    apply() {
      return this.issuesApply.includes(this.id)
    }
  },
  methods: mapActions(['applyIssue', 'unapplyIssue']),
  components: { diff, serialize, test }
}
</script>

<style scoped>
.boxx {
  margin: 32px;
  border-radius: 6px;
  box-shadow: 4px 4px 12px 3px rgba(0, 0, 0, 0.06), 0 25px 50px 0 rgba(0, 0, 0, 0.02);
  padding: 18px;
}

code {
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
