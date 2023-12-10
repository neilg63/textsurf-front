<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import Button from 'primevue/button';
import { PageResult } from '../api/models/page-result';
import { PrimeIcons } from 'primevue/api';
import { useEventStore } from '../stores/event.store';
defineProps<{
  page: PageResult
}>()

const event = useEventStore();

const fetchFromBrowser = (uri = "") => {
  event.emit('fetch-from-browser', uri)
}

</script>

<template>
  <section class="main-content">
    <aside class="info">
    <dl class="grid-2">
      <dt>No. of links</dt>
      <dd>
        <span class="number">{{ page.numLinks }}</span>
        <Button v-if="page.hasManyLinks" size="small" v-tooltip.left="'Fetch all links instead'" :icon="PrimeIcons.LIST" severity="info" text rounded />
      </dd>
      <dt>Text length</dt>
      <dd>
        <span class="number">{{ page.textLength }}</span>
        <Button v-if="page.minimalContent" @click="fetchFromBrowser(page.uri)" v-tooltip.left="'The remote content requires a full browser. Fetch now'" :icon="PrimeIcons.ARROW_CIRCLE_RIGHT" severity="warning" size="small" text rounded />
      </dd>
    </dl>
  </aside>
    <article v-if="page.hasContent" class="content" v-html="page.innerHTML">
      
    </article>
  </section>
</template>

<style>

article.content textarea,
article.content input, 
article.content button,
article.content select {
  display: none;
}

</style>
