<template>
  <div ref="container" style="width: 100vw;height: 100vh;">

  </div>
</template>

<script setup>
import Four from './four/four'
import { ref } from 'vue';
const container = ref()
onMounted(() => {
  new Four(container.value)
})
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
