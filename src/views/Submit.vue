<template>
<div class="container">
  <br>
  <diff></diff>
  <hr>
  <serialize></serialize>
  <hr>
  <issue></issue>
  <br>
</div>
</template>

<script>
import diff from '@/components/diff'
import serialize from '@/components/diff/serialize'
import issue from '@/components/diff/issue'

export default {
  components: { diff, serialize, issue }
}
</script>
