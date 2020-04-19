<template>
<div>
  <p v-if="fail || failed">呜呜呜...登陆失败, 再试试吧QAQ</p>
  <p v-else>登陆中...</p>
  <login v-if="fail || failed"></login>
</div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

import { getToken } from './w'
import login from './login'

const { mapActions, mapState } = createNamespacedHelpers('login')

export default {
  props: ['code'],
  components: { login },
  data() {
    return { fail: false }
  },
  computed: mapState({ failed: 'fail' }),
  async mounted() {
    if (this.code) {
      const token = await getToken(this.code).catch(() => undefined)
      if (token) {
        await this.updateToken(token)
      } else {
        this.fail = true
      }
    }
  },
  methods: mapActions(['updateToken'])
}
</script>
