<template>
<div>
  <p :class="{ 'has-text-danger': status === 'remove', 'has-text-success': status === 'add', 'has-text-warning': status === 'update'}">{{file}}</p>
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
