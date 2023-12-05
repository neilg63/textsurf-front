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

<style>

article.content textarea,
article.content input, 
article.content button,
article.content select {
  display: none;
}

</style>
