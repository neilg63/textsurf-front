import { defineStore } from 'pinia'
import { PageResult } from '@/api/models/page-result';

export const usePageStore = defineStore({
  id: 'page',
  state: () => ({
      page: new PageResult()
  }),
  actions: {
      update(page: PageResult) {
          this.page = page;
      },
      clear() {
          this.page = new PageResult();
      }
  }
});