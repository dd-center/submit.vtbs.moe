<template>
<div>
  <p :class="{ 'has-text-danger': status === 'delete'}">{{file}}</p>
</div>
</template>

<script>
export default {
  props: ['status', 'file']
}
</script>

<style scoped>
.red {
  color: red;
}
</style>
