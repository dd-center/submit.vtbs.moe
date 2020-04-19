<template>
<div class="container">
  <div class="content">
    <br>
    <status v-if="username"></status>
    <codee v-else-if="code || token" :code="code"></codee>
    <login v-else></login>
  </div>
</div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

import status from '@/components/login/status'
import codee from '@/components/login/code'
import login from '@/components/login/login'

const { mapState } = createNamespacedHelpers('login')

export default {
  props: ['code'],
  components: { login, codee, status },
  computed: mapState(['username', 'token'])
}
</script>

<style>

</style>
