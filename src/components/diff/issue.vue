<template>
<div>
  <h1 class="title">发布</h1>
  <h2 class="subtitle">Issue</h2>
  <template v-if="diffLength && diffLength > 0">
    <input class="input" type="text" :placeholder="`标题: ${defaultTitle}`" v-model="inputTitle">
    <br>
    <br>
    <textarea class="textarea" placeholder="附加信息" v-model="input"></textarea>
    <br>
    <code>{{issue}}</code>
    <br>
    <label class="checkbox">
      <input type="checkbox" v-model="githubCommit" :disabled="!username">
      以我的GitHub身份Commit <template v-if="!username">(登陆后可收到审核反馈邮件)</template>
    </label>
    <hr>
    <button class="button is-link is-light" :class="{ 'is-loading': urlLoading }" @click="submit" v-if="!url">发布</button>
    <br>
    <a :href="url" target="_blank" v-if="url">{{url}}</a>
    <br>
    <p class="warning">提交一次即可，vtbs.moe的数据会在人工审核通过后更新！</p>
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
import { mapState, createNamespacedHelpers } from 'vuex'

import { diff, makeIssue, submitDiff, getIssuesApply } from '@/worker'

const { mapState: mapLoginState, mapMutations: mapLoginMutations, mapGetters: mapLoginGetters } = createNamespacedHelpers('login')

export default {
  data() {
    return {
      diffLength: undefined,
      input: '',
      issue: '',
      url: undefined,
      urlLoading: false,
      inputTitle: ''
    }
  },
  async mounted() {
    this.diffLength = (await diff()).length + (await getIssuesApply()).length
  },
  computed: {
    ...mapState(['diff', 'issuesApply']),
    ...mapLoginState(['commit', 'username', 'token', 'title']),
    ...mapLoginGetters(['command']),
    githubCommit: {
      get() {
        return this.username && this.commit
      },
      set(value) {
        this.setCommit(value)
      }
    },
    defaultTitle() {
      let title = ''
      if (this.diff.length) {
        const vs = this.diff.map(([_, v]) => v)
        const removes = vs.filter(v => v === 'remove').length
        const adds = vs.filter(v => v === 'add').length
        title += `${this.diff[0][0]} (${vs.length}/-${removes}/+${adds})`
      }
      if (this.issuesApply.length) {
        title += `Merge ${this.issuesApply.length}`
      }
      return title || 'update'
    }
  },
  watch: {
    async diff() {
      this.diffLength = (await diff()).length + (await getIssuesApply()).length
      await this.updateIssue()
    },
    command() {
      this.updateIssue()
    },
    input: {
      immediate: true,
      handler() {
        this.updateIssue()
      }
    },
    inputTitle: {
      immediate: true,
      handler() {
        if (this.inputTitle) {
          this.setTitle(this.inputTitle)
        } else {
          this.setTitle(this.defaultTitle)
        }
      }
    }
  },
  methods: {
    ...mapLoginMutations(['setCommit', 'setTitle']),
    async submit() {
      this.urlLoading = true
      const params = [this.input, this.command]
      if (this.username) {
        params.push(this.token)
      }
      this.url = await submitDiff(...params)
    },
    async updateIssue() {
      const input = this.input
      const issue = await makeIssue(input, this.command)
      if (this.input === input) {
        this.issue = issue
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

.warning {
  color: red;
}
</style>
