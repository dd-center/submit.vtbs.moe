<template>
<div>
  <h3>GitHub账号</h3>
  <img :src="extra.avatar" alt="avatar" height="128px" width="128px">
  <p>用户名: {{username}}
    <a :href="extra.url" target="_blank">{{extra.url}}</a> <br>
    昵称: {{name}} <br>
    邮箱: {{email}}</p>
  <button class="button" @click="logout">登出</button>
  <br>
</div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

const { mapState, mapActions } = createNamespacedHelpers('login')

export default {
  computed: mapState(['username', 'name', 'email', 'extra']),
  methods: {
    ...mapActions(['updateToken']),
    logout() {
      this.updateToken()
    }
  }
}
</script>
