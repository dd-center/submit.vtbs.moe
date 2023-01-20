<template>
<div class="container">
  <br>
  <diff :diff="diff"></diff>
  <hr>
  <test :diff="diff"></test>
  <hr>
  <serialize :diff="diff" :command="command"></serialize>
  <hr>
  <issue></issue>
  <br>
</div>
</template>

<script>
import { mapState, createNamespacedHelpers } from 'vuex'

import diff from '@/components/diff'
import serialize from '@/components/diff/serialize'
import issue from '@/components/diff/issue'
import test from '@/components/diff/test'

const { mapGetters } = createNamespacedHelpers('login')

export default {
  computed: {
    ...mapState(['diff']),
    ...mapGetters(['command'])
  },
  components: { diff, serialize, issue, test }
}
</script>
