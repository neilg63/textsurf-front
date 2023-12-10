<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { ref, watch, onMounted } from 'vue';
import TextSearchHome from './components/TextSearchHome.vue'
import TextPreview from './components/TextPreview.vue'
import { usePageStore } from './stores/page.store';
const route = useRoute();
const showInfo = ref(false);
const showPreview = ref(false);

const wrapperClasses = ref(['show-home']);

const pageStore = usePageStore();

const buildClasses = () => {
  const cls = [];
  let base = 'home';
  if (route.path.length > 2) {
    const parts = route.path.substring(1).split('/');
    if (parts.length > 0) {
      base = parts.shift() as string;
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
  wrapperClasses.value = cls;
}

watch(route, async (newRoute, oldRoute) => {
  if (newRoute.path !== oldRoute.path) {
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

onMounted(() => {
  buildClasses();
});

</script>

<template>
 <main :class="wrapperClasses">
  <header>
      <img alt="TextSurf Logo" class="logo" src="@/assets/logo.svg" width="384" height="96" />

      <div class="wrapper">
        

        <nav class="top-menu row">
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/about">About</RouterLink>
        </nav>
      </div>
    </header>
    <section class="search-section twin">
      <TextSearchHome />
      <TextPreview :page="pageStore.page" />
    </section>
    <RouterView />
 </main>
</template>
<style lang="scss">
  @import "./styles/main.scss";
</style>
