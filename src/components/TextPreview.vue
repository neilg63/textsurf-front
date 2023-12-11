<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Button from 'primevue/button';
import { PageResult } from '../api/models/page-result';
import { PrimeIcons } from 'primevue/api';
import { useEventStore } from '../stores/event.store';
import type { LinkResultSet } from '../api/models/search-results';
import { notEmptyString } from '../api/validators';
import { fileSize, longDate } from '../api/converters';
const props = defineProps<{
  page: PageResult
  linkSet: LinkResultSet
}>()

const event = useEventStore();

const activeIndex = ref(0);

const pageSizeText = ref(fileSize(props.page.stats.sourceHtmlLength));

const buildDateTime = () => {
  if (props.page.stats.ts > 1000) {
    return longDate(props.page.stats.ts);
  } else {
    return 'N/A';
  }
}

const retrieved = ref(buildDateTime());

event.on('page-loaded', (success) => {
  if (success) {
    setTimeout(() => {
      activeIndex.value = 0;
      if (props.page.stats.sourceHtmlLength) {
        pageSizeText.value = fileSize(props.page.stats.sourceHtmlLength);
        retrieved.value = buildDateTime();
      } else {
        pageSizeText.value = '';
      }
    }, 125);
  }
})

const fetchFromBrowser = (uri = "") => {
  event.emit('fetch-from-browser', uri)
}

const fetchPageLinks = (uri = "") => {
  event.emit('fetch-page-links', uri)
}

const fetchPageLinksConditional =  (uri = "") => {
  if (uri !== props.linkSet.uri) {
    fetchPageLinks(uri);
  }
}

const toBaseUrl = (uri = "") => {
  const parts = uri.split("://");
  if (parts.length > 1) {
    const end = parts.pop();
    if (typeof end === 'string') {
      const endParts = end?.split('/');
      if (endParts.length > 0) {
        return [parts.shift(), endParts.shift()].join('://');
      }
    }
  }
  return uri;
}

const updatePageResult = (uri = "") => {
  const fullUri = uri.startsWith('/') ? [toBaseUrl(props.page.uri), uri].join('') : uri;
  if (notEmptyString(fullUri) && fullUri.includes('://')) {
    event.emit('fetch-page', fullUri);
  }
}

const monitorTab = (row: any) => {
  if (row instanceof Object) {
    const { originalEvent, index } = row;
    if (originalEvent instanceof PointerEvent) {
      if (originalEvent.target instanceof HTMLElement) {
        switch (index) {
          case 0:
              if (props.page.minimalContent) {
                fetchFromBrowser(props.page.uri);
              }
              break;
            case 1:
              fetchPageLinksConditional(props.page.uri);
              break;
          }
      }
    }
  }
}

const buildTabs = () => {
  const articleIcon = props.page.minimalContent ? PrimeIcons.ARROW_CIRCLE_RIGHT : PrimeIcons.ARROW_CIRCLE_DOWN;
  return [
    { key: "article", title: "Main Text", icon: articleIcon },
    { key: "links", title: "Page links", icon: PrimeIcons.LIST },
    { key: "stats", title: "Statistics", icon: PrimeIcons.CHART_BAR }
  ]
}

const tabs = ref(buildTabs());

const toUriTip = (uri: string) => {
  return { value: uri, fitContent: true, position: "bottom", class: "wide text-small"};
}

</script>

<template>
  <TabView @tab-change="monitorTab" :activeIndex="activeIndex">
    <TabPanel v-for="tab in tabs" :key="tab.key">
      <template #header>
        <span class="text">{{ tab.title }}</span>
        <i :class="tab.icon" :data-uri="page.uri"></i>
      </template>
      <template v-if="tab.key == 'article'">
        <article v-if="page.hasContent" class="content" v-html="page.innerHTML">
        </article>
      </template>
      <template v-if="tab.key == 'links'">
        <ul v-if="linkSet.results.length > 0" class="links result-list">
          <li v-for="link in linkSet.results" :key="link.uri" v-tooltip.bottom="toUriTip(link.uri)">
            <span class="preview-trigger" @click="updatePageResult(link.uri)">{{ link.title }}</span>
            <a :href="link.uri" target="_blank">🔗</a>
          </li>
        </ul>
      </template>
      <template v-if="tab.key == 'stats'">
        <dl class="grid-2">
       <dt>URL</dt>
        <dd>
          <a :href="page.uri" target="_blank">{{ page.uri }}</a>
        </dd>
        <dt>No. of links</dt>
        <dd>
          <span class="number">{{ page.numLinks }}</span>
          <Button v-if="page.hasManyLinks" size="small" @click="fetchPageLinks(page.uri)" v-tooltip.right="'Fetch all links in the full page'" :icon="PrimeIcons.LIST" severity="info" text rounded />
        </dd>
        <dt>Text length</dt>
        <dd>
          <span class="number">{{ page.textLength }}</span>
          <Button v-if="page.minimalContent" @click="fetchFromBrowser(page.uri)" v-tooltip.right="'The remote content requires a full browser. Fetch now'" :icon="PrimeIcons.ARROW_CIRCLE_RIGHT" severity="warning" size="small" text rounded />
        </dd>
        <dt>Page size</dt>
        <dd>
          <span class="size">{{ pageSizeText }}</span>
          
        </dd>
        <dt>Retrieved</dt>
        <dd>
          <time>{{ retrieved }}</time>
        </dd>
      </dl>
      </template>
  </TabPanel>
</TabView>
</template>

<style lang="scss">

article.content {
  textarea,
  input, 
  button,
  select {
    display: none;
  }
  pre {
    white-space: normal;
  }
}

</style>
