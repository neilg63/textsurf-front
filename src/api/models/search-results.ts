import { smartCastBool, smartCastInt } from "../converters";
import { SearchItem } from "../localstore";
import { notEmptyString, validDateTimeString } from "../validators";


export class SearchResult {
  date = new Date(0);
  summary = "";
  title = "";
  uri = "";
  source = "unknown";

  constructor(inData: any  = null) {
    if (inData instanceof Object) {
      const { date, summary, title, uri, provider } = inData;
      if (validDateTimeString(date)) {
        this.date = new Date(date);
      }
      if (notEmptyString(title)) {
        this.title = title;
      }
      if (notEmptyString(summary)) {
        this.summary = summary;
      }
      if (notEmptyString(uri)) {
        this.uri = uri;
      }

      if (notEmptyString(provider)) {
        this.source = provider;
      }
    }
  }

  get hasUri() {
    return this.uri.startsWith("https://") || this.uri.startsWith("http://");
  }

  toItem(): SearchItem {
    return new SearchItem(this)
  }

}

export class SearchResultSet {
  page = 1;
  count = 0;
  lang = "";
  results: SearchResult[] = [];

  constructor(inData: any  = null) {
    if (inData instanceof Object) {
      const { page, lang, count, results } = inData;
      
      if (notEmptyString(lang)) {
        this.lang = lang;
      }
      const p = smartCastInt(page);
      if (p > 1) {
        this.page = p;
      }
      const c = smartCastInt(count);
      if (c > 0) {
        this.count = c;
      }
      if (results instanceof Array && results.length > 0) {
        this.results = results.map(row => new SearchResult(row));
      }
    }
  }

}



export class LinkResult {
  local = false;
  summary = "";
  title = "";
  uri = "";

  constructor(inData: any  = null) {
    if (inData instanceof Object) {
      const { title, uri, summary, local } = inData;
      
      if (notEmptyString(uri)) {
        this.uri = uri;
      }
      if (notEmptyString(title)) {
        this.title = title;
      }

      if (notEmptyString(summary)) {
        this.summary = summary;
      }
      this.local = smartCastBool(local, false);
    }
  }

}

export class LinkResultSet {
  uri = "";
  results: LinkResult[] = [];

  constructor(results: any[] = [], uri = "") {
    if (results instanceof Array) {
      this.results = results.filter(row => row instanceof Object).map(row => new LinkResult(row));

    }
    if (notEmptyString(uri)) {
      this.uri = uri;
    }
  }

}