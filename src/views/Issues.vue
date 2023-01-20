<template>
<div class="container">
  <div class="flex-container">
    <router-link :to="`/issue/${issue.key}`" custom v-slot="{ navigate }" v-for="issue of issueCompute" :key="issue.key">
      <div class="boxx" @click="navigate">
        <h1 class="title">{{issue.title}}</h1>
        <h2 class="subtitle">{{issue.key}}</h2>
        <button class="delete is-large" v-if="issue.apply" @click.prevent="unapplyIssue(issue.key)"></button>
        <button class="button is-success" v-else @click.prevent="applyIssue(issue.key)">Apply</button>
      </div>
    </router-link>
  </div>
</div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState(['issues', 'issuesApply']),
    issueCompute() {
      return Object.entries(this.issues).map(([key, value]) => {
        const apply = this.issuesApply.includes(key)
        const title = (value.commands.filter(([cmd]) => cmd === 'title')[0] || [undefined, 'update'])[1]
        return {
          key,
          apply,
          title
        }
      })
    }
  },
  methods: mapActions(['applyIssue', 'unapplyIssue'])
}
</script>

<style scoped>
.flex-container {
  margin: 32px;
  display: flex;
  flex-wrap: wrap;
}

.boxx {
  margin: 32px;
  border-radius: 6px;
  box-shadow: 4px 4px 12px 3px rgba(0, 0, 0, 0.06), 0 25px 50px 0 rgba(0, 0, 0, 0.02);
  padding: 18px;
  cursor: pointer;
}
</style>
