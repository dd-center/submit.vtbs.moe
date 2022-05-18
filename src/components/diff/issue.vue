<template>
<div>
  <h1 class="title">发布</h1>
  <h2 class="subtitle">Issue</h2>
  <template v-if="diffLength && diffLength > 0">
    <input class="input" type="text" placeholder="标题" v-model="commitTitle">
    <br>
    <br>
    <textarea class="textarea" placeholder="附加信息" v-model="input"></textarea>
    <br>
    <code>{{issue}}</code>
    <br>
    <label class="checkbox">
      <input type="checkbox" v-model="githubCommit" :disabled="!username">
      以我的GitHub身份Commit <template v-if="!username">(请登陆)</template>
    </label>
    <hr>
    <button class="button is-link is-light" :class="{ 'is-loading': urlLoading }" @click="submit" v-if="!url">发布</button><warning>请提交一次等待审核即可，不要重复提交，vtbs.moe数据并不是即时更新！</warning>
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
import { mapState, createNamespacedHelpers } from 'vuex'

import { diff, makeIssue, submitDiff } from '@/worker'

const { mapState: mapLoginState, mapMutations: mapLoginMutations, mapGetters: mapLoginGetters } = createNamespacedHelpers('login')

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
  computed: {
    ...mapState(['diff']),
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
    commitTitle: {
      get() {
        return this.title
      },
      set(value) {
        this.setTitle(value)
      }
    }
  },
  watch: {
    async diff() {
      this.diffLength = (await diff()).length
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
warning {
  color: red;
}
</style>
