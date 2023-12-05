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
      <TextPreview v-if="pageStore.page.hasContent" :page="pageStore.page" />
    </section>
    <RouterView />
 </main>
</template>

<style scoped>


.logo {
  display: block;
  margin: 0 auto 2vw;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
  display: flex;
  flex-flow: row nowrap;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

.search-section {
  display: grid;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .search-section {
    grid-template-columns: 1fr 1fr;
    column-gap: 5%;
  }

  .logo {
    margin: 0 2vw;
    height: 100%;
    width: auto;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-flow: row nowrap;
    width: 100%;
    margin: 0 auto;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
