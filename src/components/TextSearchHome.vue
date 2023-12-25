<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import { fetchPageLinks, fetchSearchResults, fetchSuggestList, fetchTextPage } from '../api/methods';
import { LinkResultSet, SearchResult } from '../api/models/search-results';
import { PageResult } from '../api/models/page-result';
import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import { usePageStore } from '../stores/page.store'
import { useEventStore } from '../stores/event.store';
import { fetchRecentSearches, listStoredPages, removeExtraPages, removeFromStoredPages, SearchItem } from '../api/localstore';
import type { StoredItemInfo } from '../api/localstore';
import { SearchSet } from '../api/localstore';
import { PrimeIcons } from 'primevue/api';
import { notEmptyString } from '../api/validators';
import { isAUrl } from '../api/converters';

const search = ref('');

const emptyRecentSearches: SearchSet[] = [];

const emptyResults: SearchResult[] = [];
const emptyStrings: string[] = [];
const emptyStoredItems: StoredItemInfo[] = [];

const results = ref(emptyResults);
const recentSearches = ref(emptyRecentSearches);
const recentPages = ref(emptyStoredItems);

const loading = ref(false);

const page = ref(1);

const pageStore = usePageStore();

const items = ref(emptyStrings);

const event = useEventStore();

const updateSearchHistory = () => {
  const rows = fetchRecentSearches();
  if (rows instanceof Array && rows.length > 0) {
    
    if (rows[0] instanceof Object) {
      const first = rows.shift();
      const firstSearch = first as SearchSet;
      if (search.value.trim().length < 1) {
        search.value = firstSearch.text;
      }
      if (firstSearch.results.length > 0) {
        results.value = firstSearch.results.map(row => new SearchItem(row).toResult()) 
      }
      if (rows.length > 0) {
        recentSearches.value = rows.filter(r => r instanceof Object).map(r => new SearchSet(r));
      }
    }
  }
}

const updatePageHistory = () => {
  const rows = listStoredPages();
  if (rows instanceof Array && rows.length > 0) {
    recentPages.value = rows.filter(r => r instanceof Object).map(r => r as StoredItemInfo);
  }
}

const updateSuggestions = () => {
  fetchSuggestList(search.value).then(rows => {
    if (rows instanceof Array) {
      items.value = rows as string[];
    }
  })
}

const updateResults = () => {
  loading.value = true;
  removeExtraPages();
  fetchSearchResults(search.value).then(data => {
    if (data.results instanceof Array) {
      results.value = data.results.filter(row => row instanceof SearchResult);
      this
      setTimeout(() => {
        loading.value = false;
      }, 250);
    }
  })
}

const deletePageFromStore = (uri: string) => {
  removeFromStoredPages(uri);
  setTimeout(() => {
    updatePageHistory();
  }, 250);
}

const updatePageResult = (uri = "", fullMode = false) => {
  loading.value = true;
  fetchTextPage(uri, fullMode).then(data => {
    if (data instanceof PageResult) {
      pageStore.update(data);
      updateSearchHistory();
      event.emit('page-loaded', true);
      setTimeout(() => {
        loading.value = false;
        updatePageHistory();
      }, 250);
    }
  })
}

const updatePageLinksSet = (uri = "") => {
  loading.value = true;
  fetchPageLinks(uri).then(data => {
    if (data instanceof LinkResultSet) {
      pageStore.setLinks(data);
      loading.value = false;
    }
  })
}

const checkForSearchString = () => {
  if (notEmptyString(search.value)) {
    const txt = search.value.trim();
    if (isAUrl(txt)) {
      updatePageResult(txt);
    } else if (txt.length > 2) {
      updateResults();
    }
  }
}


const updateResultsForPage = () => {
  const txt = search.value? search.value.trim() : '';
  if (isAUrl(txt)) {
    setTimeout(() => {
      updatePageResult(txt)
    }, 750)
  }
  updateResults();
}

const loadSearchList = (set: SearchSet) => {
  if (set instanceof Object && set.results instanceof Array) {
    search.value = set.text;
    results.value = set.results.map(r => r.toResult());
  }
}

onMounted(() => {
  updateSearchHistory();
  setTimeout(updatePageHistory, 500);
})

event.on('fetch-from-browser', (uri) => {
  if (typeof uri === "string") {
    updatePageResult(uri, true);
  }
});

event.on('fetch-page-links', (uri) => {
  if (typeof uri === "string") {
    updatePageLinksSet(uri);
  }
});

event.on('fetch-page', (uri) => {
  if (typeof uri === "string") {
    updatePageResult(uri, false);
  }
});

const toUriTip = (uri: string) => {
  return { value: uri, fitContent: true, position: "bottom", class: "wide text-small"  };
}

const defaultTabs = [
  { key: "search", title: "Results", icon: PrimeIcons.LIST, tooltip: "Search results" },
  { key: "pages", title: "History", icon: PrimeIcons.HISTORY, tooltip: "Stored pages" },
  { key: "recent", title: "Searches", icon: PrimeIcons.CALENDAR, tooltip: "Recent searches" }
];

const tabs = ref(defaultTabs);

</script>

<template>
  <div class="text-surf">
    <fieldset class="search-form">
      <AutoComplete v-model="search" :suggestions="items" @complete="updateSuggestions" @keydown.enter="checkForSearchString"/>
      <Button type="button" aria-label="Search" icon="pi pi-search" :loading="loading" @click="updateResultsForPage" />
    </fieldset>
    <section class="search-results-wrapper tabbed-section-container">
      <slot></slot>
      <TabView :activeIndex="0">
        <TabPanel v-for="tab in tabs" :key="tab.key">
          <template #header>
            <span class="text" v-tooltip.top="tab.tooltip">{{ tab.title }}</span>
            <i :class="tab.icon"></i>
          </template>
          <template v-if="tab.key === 'search'">
            <ul class="result-list" v-if="results.length > 0">
              <li v-for="(row, ri) in results" :key="[row.uri, ri].join('-')" v-tooltip.bottom="toUriTip(row.uri)">
                <p class="link">
                  <span class="preview-trigger" @click="updatePageResult(row.uri)">{{ row.title }}</span>
                  <em class="provider">{{ row.source }}</em>
                  <a :href="row.uri" target="_blank">🔗</a>
                </p>
                <p class="summary" v-html="row.summary"></p>
              </li>
            </ul>
          </template>
          <template v-if="tab.key === 'pages'">
            <ul class="result-list" v-if="recentPages.length > 0">
              <li v-for="(row, ri) in recentPages" :key="[row.key, ri].join('-')">
                  <span class="preview-trigger" @click="updatePageResult(row.uri)">{{ row.title }}</span>
                  <Button @click="deletePageFromStore(row.uri)" class="delete-one" v-tooltip.right="'Delete from local store'" :icon="PrimeIcons.DELETELEFT" size="small" severity="danger" text rounded />
              </li>
            </ul>
          </template>
          <template v-if="tab.key === 'recent'">
            <ul class="result-list" v-if="recentSearches.length > 0">
              <li v-for="(row, ri) in recentSearches" :key="[row.key, ri].join('-')">
                  <span class="preview-trigger" @click="loadSearchList(row)">{{ row.text }}</span>
                  <em>{{ row.results.length }}</em>
              </li>
            </ul>
          </template>
        </TabPanel>
      </TabView>
    </section>
  </div>
</template>
