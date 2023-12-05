<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchSearchResults, fetchSuggestList, fetchTextPage } from '../api/methods';
import { SearchResult } from '../api/models/search-results';
import { PageResult } from '../api/models/page-result';
import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import { usePageStore } from '../stores/page.store';
import { fetchRecentSearches, listStoredPages, removeExtraPages } from '../api/localstore';


const search = ref('');

const emptyResults: SearchResult[] = [];
const emptyStrings: string[] = [];

const results = ref(emptyResults);

const loading = ref(false);

const page = ref(1);

const pageStore = usePageStore();

const pageResult = ref(new PageResult())

const items = ref(emptyStrings);

const updateSuggestions = () => {
  console.log(search.value);
  fetchSuggestList(search.value).then(rows => {
    if (rows instanceof Array) {
      items.value = rows as string[];
    }
  })
}

const updateResults = () => {
  loading.value = true;
  removeExtraPages();
  console.log(listStoredPages(), fetchRecentSearches())
  fetchSearchResults(search.value).then(data => {
    if (data.results instanceof Array) {
      results.value = data.results.filter(row => row instanceof SearchResult);
      setTimeout(() => {
        loading.value = false;
      }, 250);
    }
  })
}

const updatePageResult = (uri = "") => {
  loading.value = true;
  fetchTextPage(uri).then(data => {
    if (data instanceof PageResult) {
      pageResult.value = data;
      pageStore.update(data);
      setTimeout(() => {
        loading.value = false;
      }, 250);
    }
  })
}

</script>

<template>
  <div class="text-surf">
    <fieldset>
      <AutoComplete v-model="search" :suggestions="items" @complete="updateSuggestions" />
      <Button type="button" label="Search" icon="pi pi-search" :loading="loading" @click="updateResults" />
    </fieldset>
    <section class="results">
      <ul class="result-list" v-if="results.length > 0">
        <li v-for="(row, ri) in results" :key="[row, ri].join('-')">
          <p class="link">
            <span class="preview-trigger" @click="updatePageResult(row.uri)">{{ row.title }}</span>
            <a :href="row.uri" target="_blank">🔗</a>
          </p>
          <p class="summary" v-html="row.summary"></p>
        </li>
      </ul>
    </section>
    <TextPreview v-if="pageResult.hasContent" :page="pageResult" />
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 3rem;
  position: relative;
}

h3 {
  font-size: 1.2rem;
}

.result-list li p span {
  display: inline-block;
  margin-right: 1em;;
}

.result-list li p span.preview-trigger {
  cursor: pointer;
  color: var(--orange);
}

.result-list li p span.preview-trigger:hover {
  color: var(--green);
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
