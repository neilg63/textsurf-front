import { smartCastInt } from "../converters";
import { notEmptyString, validDateTimeString } from "../validators";


export class SearchResult {
  date = new Date(0);
  summary = "";
  title = "";
  uri = "";
  source = "brave";

  constructor(inData: any  = null) {
    if (inData instanceof Object) {
      const { date, summary, title, uri } = inData;
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
    }
  }

  get hasUri() {
    return this.uri.startsWith("https://") || this.uri.startsWith("http://");
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