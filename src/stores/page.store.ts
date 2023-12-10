import { defineStore } from 'pinia'
import { PageResult } from '@/api/models/page-result';
import { LinkResultSet } from '@/api/models/search-results';

export const usePageStore = defineStore({
  id: 'page',
  state: () => ({
      page: new PageResult(),
      linkSet: new LinkResultSet()
  }),
  actions: {
      update(page: PageResult) {
          this.page = page;
      },
      setLinks(linkSet: LinkResultSet) {
          this.linkSet = linkSet;
      },
      clear() {
          this.page = new PageResult();
      }
  }
});