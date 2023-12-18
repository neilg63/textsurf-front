<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { ref, watch, onMounted } from 'vue';
import Button from 'primevue/button';
import TextSearchHome from './components/TextSearchHome.vue'
import TextPreview from './components/TextPreview.vue'
import { usePageStore } from './stores/page.store';
import { useEventStore } from './stores/event.store';
const route = useRoute();
const showInfo = ref(false);
const showPreview = ref(false);
const displayMode = ref('search');
const fullScreen = ref(false);

const wrapperClasses = ref(['show-home']);

const pageStore = usePageStore();
const event = useEventStore();

const buildClasses = () => {
  const cls = [];
  let base = 'home';
  if (route.path.length > 2) {
    const parts = route.path.substring(1).split('/');
    if (parts.length > 0) {
      base = parts.shift() as string;
      if (base.length > 2) {
        cls.push('show-info-page');
      }
      if (parts.length > 0) {
        cls.push(['page', base, ...parts].join());
        
      }
    }
  }
  cls.push(['show', base].join('-'));
  if (showInfo.value) {
    cls.push('show-info');
  }
  if (showPreview.value) {
    cls.push('show-preview');
  }
  if (displayMode.value) {
    cls.push(['show',displayMode.value].join('-'));
  }
  if (fullScreen.value) {
    cls.push('fullscreen-mode');
  }
  wrapperClasses.value = cls;
}

watch(route, async (newRoute) => {
  if (newRoute.path) {
    buildClasses();
  }
});

watch(pageStore, async (newStore, oldStore) => {
  if (newStore.page.hasContent && newStore.page.innerHTML !== oldStore.page.innerHTML) {
    showPreview.value = true;
    buildClasses();
  } else {
    showPreview.value = false;
  }
});



window.addEventListener('resize', (e: Event) => {
  if (e.target instanceof Window) {
    if (e.target.innerWidth < 900) {
      if (pageStore.page.hasContent) {
        displayMode.value = 'content';
      } else {
        displayMode.value = 'search';
      }
    }
  }
});


const toggleContentSearch = (contentMode = false) => {
  displayMode.value = contentMode? 'content' : 'search';
  buildClasses();
}


const showContent = () => {
  toggleContentSearch(true)
}

const showSearch = () => {
  toggleContentSearch(false)
}

event.on('page-loaded', (success) => {
  if (success) {
    showContent();
  }
});

onMounted(() => {
  buildClasses();
});

</script>

<template>
 <main :class="wrapperClasses">
  <header class="top">
      <img alt="TextSurf Logo" class="logo" src="@/assets/logo.svg" width="384" height="96" />

      <div class="wrapper">
        

        <nav class="top-menu row">
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/about">About</RouterLink>
        </nav>
      </div>
    </header>
    <section class="surf-section twin">
      
      <TextSearchHome>
        <Button type="button" label="Content" icon="pi pi-arrow-right" class="mobile-content-toggle show-content" @click="showContent" size="small" />
      </TextSearchHome>
      <TextPreview :page="pageStore.page" :linkSet="pageStore.linkSet">
        <Button type="button" label="Search" icon="pi pi-arrow-left" class="mobile-content-toggle show-search" @click="showSearch" size="small" />
      </TextPreview>
    </section>
    <aside class="info-page">
      <RouterView />
    </aside>
 </main>
</template>
<style lang="scss">
  @import "./styles/main.scss";
</style>
