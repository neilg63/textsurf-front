import { smartCastFloat, smartCastInt } from "./converters";
import { pageUriToKey } from "./methods";
import { SearchResult } from "./models/search-results";
import { notEmptyString, validDateTimeString } from "./validators";

const MAX_PAGE_STORAGE_SIZE = 1024 * 1024;


export interface StorageItem {
  expired: boolean;
  valid: boolean;
  ts: number;
  type: string;
  data: any;
}

const localStorageSupported = () => {
  try {
    return "localStorage" in window && window["localStorage"] !== null;
  } catch (e) {
    return false;
  }
};

export const toLocal = (key = "", data: any = null, defScalarType = "sca") => {
  if (localStorageSupported()) {
    const ts = Date.now() / 1000;
    const parts: any[] = [ts];
    if (data instanceof Object || data instanceof Array) {
      parts.push("obj", JSON.stringify(data));
    } else {
      parts.push(defScalarType, data);
    }
    localStorage.setItem(key, parts.join(":"));
  }
};

export const fromLocal = (key = "", maxAge = -1): StorageItem => {
  const ts = Date.now() / 1000;
  const obj: StorageItem = {
    expired: true,
    valid: false,
    ts: 0,
    type: "",
    data: null,
  };
  const maxAgeSecs = maxAge < 5 ? 60 * 60 : maxAge;
  if (localStorageSupported() && notEmptyString(key, 2)) {
    const data = localStorage.getItem(key);
    if (data) {
      const parts = data.split(":");
      if (parts.length > 2) {
        const numPart = parts.shift();
        if (numPart) {
          obj.ts = parseInt(numPart, 10);
        }
        const typeKey = parts.shift();
        if (typeof typeKey === "string") {
          obj.type = typeKey;
        }
        const rawData = parts.join(":");

        if (obj.type === "obj") {
          obj.data = JSON.parse(rawData);
        } else {
          switch (obj.type) {
            case "int":
              obj.data = smartCastInt(rawData);
              break;
            case "float":
              obj.data = smartCastFloat(rawData);
              break;
            default:
              obj.data = rawData;
              break;
          }
        }
        const latestTs = obj.ts + maxAgeSecs;
        if (ts <= latestTs) {
          obj.expired = false;
          obj.valid = true;
        }
      }
    }
  }
  return obj;
};

export const clearLocal = (key = "", fuzzy = false): boolean => {
  const keys = Object.keys(localStorage);
  let deleted = false;
  for (const k of keys) {
    if (fuzzy) {
      const rgx = new RegExp("^" + key);
      if (rgx.test(k)) {
        localStorage.removeItem(k);
        deleted = true;
      }
    } else if (k === key || key === "all") {
      const mayRemove = !fuzzy || ["current-user"].includes(k) === false;
      if (mayRemove) {
        localStorage.removeItem(k);
        deleted = true;
      }
    }
  }
  return deleted;
};

export const hasLocal = (key = "", fuzzy = false): boolean => {
  const keys = Object.keys(localStorage);
  return fuzzy
    ? keys.some((k) => k.toLowerCase().startsWith(key))
    : keys.includes(key);
};

export const hasLocalObject = (
  key = "",
  keys: string[] = [],
  maxAge = 7 * 24 * 60 * 60
): boolean => {
  let valid = false;
  if (hasLocal(key)) {
    const stored = fromLocal(key, maxAge);
    if (!stored.expired) {
      valid = stored.data instanceof Object;
      if (keys.length > 0) {
        const objKeys = Object.keys(stored.data);
        valid = keys.every((k) => objKeys.includes(k));
      }
    }
  }
  return valid;
};

export interface StoredItemMeta {
  key: string;
  ts: number;
  size: number;
}

export interface StoredItemInfo extends StoredItemMeta {
  title: string;
  uri: string;
}

export interface StoredItemMetaSet {
  total: number;
  size: number;
  items: any[];
  removed?: number;
  removedSize?: number;
}

export const scanStorageForItems = (prefix = ""): StoredItemMetaSet => {
  let total = 0;
  let size = 0;
  const items: StoredItemMeta[] = [];
  if (localStorage) {
    const keys = Object.keys(localStorage);
    if (keys.length > 0) {
      for (const key of keys) {
        if (key.startsWith(prefix)) {
          total++;
          const item = localStorage.getItem(key);
          let ts = 0;
          if (typeof item === 'string') {
            const itemSize = item.length; 
            size += itemSize;
            const parts = item.split(":");
            if (parts.length > 2) {
              const numPart = parts.shift();
              if (numPart) {
                ts = parseInt(numPart, 10);
                items.push({
                  key,
                  size: itemSize,
                  ts
                })
              }
            }
            if (ts < 1) {
              localStorage.removeItem(key);
            }
          }
        }
      }
    }
  }
  items.sort((a,b) => b.ts - a.ts);
  return {
    total,
    size,
    items
  }
}

export const scanStoredPages = (): StoredItemMetaSet => {
  return scanStorageForItems("page_");
}


export const removeExtraPages = () => {
  let removed = 0;
  let removedSize = 0;
  const { items, total, size} = scanStoredPages();
  if (size > MAX_PAGE_STORAGE_SIZE) {
    const fraction = MAX_PAGE_STORAGE_SIZE / size;
    const targetNum = Math.floor(total * fraction);
    if (targetNum > 1) {
      const discardedItems = items.splice(targetNum, total - targetNum);
      if (discardedItems instanceof Array) {
        for (const delItem of discardedItems) {
          removed++;
          removedSize += delItem.size;
          localStorage.removeItem(delItem.key);
        }
      }
    }
  }
  return {
    total,
    size,
    items,
    removed,
    removedSize
  }
}


export const listStoredPages = (): StoredItemInfo[] => {
  const { items, total, size} = scanStoredPages();

  
  const rows: StoredItemInfo[] = [];
  if (items instanceof Array && total > 0 && size > 0) {
    for (const item of items) {
      const stored = fromLocal(item.key, 7 * 24 * 60 * 60);
      if (stored.valid) {
        if (stored.data instanceof Object) {
          const { stats } = stored.data;
          if (stats instanceof Object) {
            const { uri, title } = stats;
            if (notEmptyString(uri) && notEmptyString(title)) {
              rows.push({...item, title, uri });
            }
          }
        }
      }
    }
  }
  return rows;
}

export const removeFromStoredPages = (uri: string) => {
  const cacheKey = pageUriToKey(uri);
  localStorage.removeItem(cacheKey);
}

export class SearchSet {
  text = "";
  key = "";
  page = 0;
  count = 0;
  results: SearchItem[] = [];
  date = new Date(0)

  constructor(inData: any = null) {
    if (inData instanceof Object) {
      const { text, key, page, count, results, date } = inData;
      if (notEmptyString(text)) {
        this.text = text;
      }
      if (notEmptyString(key)) {
        this.key = key;
      }
      if (page) {
        this.page = page;
      }
      if (validDateTimeString(date)) {
        this.date = new Date(date);
      } else if (date instanceof Date) {
        this.date = date;
      }
      if (results instanceof Array) {
        this.results = results.map(r => new SearchItem(r));
      }
    }
  }
}

export class SearchItem {
  title = "";
  uri = "";
  summary = "";
  date = new Date(0);

  constructor(inData: any = null) {
    if (inData instanceof Object) {
      const { title, uri, summary, date } = inData;
      if (notEmptyString(title)) {
        this.title = title;
      }
      if (notEmptyString(uri)) {
        this.uri = uri;
      }
      if (notEmptyString(summary)) {
        this.summary = summary;
      }
      if (validDateTimeString(date)) {
        this.date = new Date(date);
      } else if (date instanceof Date) {
        this.date = date;
      }
    }
  }

  toResult(): SearchResult {
    return new SearchResult(this)
  }
}



export const fetchRecentSearches = (): SearchSet[] => {
  const { items, total, size} = scanStorageForItems("search_");
  const rows: SearchSet[] = [];
  if (items instanceof Array && total > 0 && size > 0) {
    for (const item of items) {
      const stored = fromLocal(item.key, 7 * 24 * 60 * 60);
      const parts = item.key.split("_");
      parts.shift();
      const suffix = parts.join("_");
      const text = atob(suffix);
      if (stored.valid) {
        if (stored.data instanceof Object) {
          const { page, count, results, ts } = stored.data;
          if (results instanceof Array && count > 0) {
            rows.push({
              text,
              key: item.key,
              page,
              count,
              results: results.filter(row => row instanceof Object).map(row => new SearchItem(row)),
              date: new Date(ts * 1000)
            })
          }
        }
      }
    }
  }
  return rows;
}