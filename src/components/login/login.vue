<template>
<div>
  <h3>登陆GitHub</h3>
  <a :href="url">通过GitHub登陆</a>
</div>
</template>

<script>
import { getGithubLoginUrl } from './w'

export default {
  data() {
    return { url: getGithubLoginUrl() }
  }
}
</script>
