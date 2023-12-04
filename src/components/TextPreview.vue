<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PageResult } from '../api/models/page-result';

defineProps<{
  page: PageResult
}>()


</script>

<template>
  <article class="content" v-html="page.innerHTML">
    
  </article>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
