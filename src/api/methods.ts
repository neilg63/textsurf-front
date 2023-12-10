import axios from "axios";
import { notEmptyString } from "./validators";
import { API_BASE, API_KEY } from "./settings";
import { fromLocal, toLocal } from "./localstore";
import { PageResult } from "./models/page-result";
import { LinkResultSet, SearchResultSet } from "./models/search-results";
import type { BasicData } from "./interfaces";

const extractDataObj = (res: any) => {
  if (res instanceof Object) {
    const { data } = res;
    if (data instanceof Object || data instanceof Array) {
      return data;
    }
  }
};

const buildOptions = () => {
  const headers = {
    'api-key': API_KEY,
  }
  return {
    headers
  }
}

const postData = async (
  alias: string,
  params: any = null,
  putMode = false
) => {
  let result: any = {};
  const func = putMode !== true ? axios.post : axios.put;
  const uri = [API_BASE, alias].join('/');
  await func(uri, params, buildOptions())
    .then((res) => {
      result = res;
    })
    .catch((e) => {
      result.error = e;
    });
  return result;
};

/* const putData = async (path: string, params = null, callback: any = null) => {
  return postData(path, params, callback, true);
}; */

const fetchData = async (alias: string, deleteMode = false) => {
  let result: any = {};
  const func = deleteMode !== true ? axios.get : axios.delete;
  const uri = [API_BASE, alias].join('/');
  await func(uri, buildOptions())
    .then((res) => {
      result = res;
    })
    .catch((e) => {
      result.error = e;
    });
  return result;
};

const fetchContent = async (alias = "") => {
  return fetchData(alias, false);
};

const deleteItem = async (alias = "") => {
  return fetchData(alias, true);
};

const buildQueryString = (criteria: any = null, literal = false): string => {
  let str = "";
  const specialRgx = /[\\/&? ]/;
  if (criteria instanceof Object) {
    const parts: Array<string> = [];
    Object.entries(criteria).forEach((entry) => {
      const [key, val] = entry;
      let paramVal = val;
      if (typeof val === "string") {
        if (!specialRgx.test(val)) {
          literal = true;
        }
        paramVal = literal ? val : encodeURIComponent(val);
      } else if (typeof val === "number" || typeof val === "boolean") {
        paramVal = val.toString();
      } else if (val instanceof Array) {
        paramVal = val.join(",");
      }
      parts.push(key + "=" + paramVal);
    });
    if (parts.length > 0) {
      str = "?" + parts.join("&");
    }
  }
  return str;
};

export const getData = async (path: string) => {
  let data = { valid: false };
  await fetchContent(path).then((response) => {
    if (response.data) {
      data = response.data;
      data.valid = true;
    }
  });
  return data;
};

export const fetchDataObject = async (
  alias: string,
  params: any = null
): Promise<BasicData> => {
  let data: any = { valid: false };
  const path = alias + buildQueryString(params);
  await fetchContent(path).then((res) => {
    const result = extractDataObj(res);
    if (result instanceof Object) {
      data = result;
      data.valid = true;
    }
  });
  return data as BasicData;
};

export const queryDataObject = async (
  alias: string,
  params: any = null
): Promise<BasicData> => {
  let data: any = { valid: false };
  await postData(alias, params).then((res) => {
    const result = extractDataObj(res);
    if (result instanceof Object) {
      data = result;
      data.valid = true;
    }
  });
  return data;
};

const fetchPageFromRemote = async (uri = "", fullMode = false) => {
  const method = fullMode ? "get-page-from-browser": "get-page";
  const alias = ["scrape", method].join("/");
  if (notEmptyString(uri, 7) && (uri.startsWith('https://') || uri.startsWith('http://'))) {
    return await queryDataObject(alias, { uri } );
  } else {
    return { valid: false, msg: "no uri" }
  }
}

const fetchPageLinksFromRemote = async (uri = "") => {
  const method = "get-links";
  const alias = ["scrape", method].join("/");
  if (notEmptyString(uri, 7) && (uri.startsWith('https://') || uri.startsWith('http://'))) {
    const data = await queryDataObject(alias, { uri } );
    if (data instanceof Object) {
      const { links } = data;
      if (links instanceof Array) {
        return { valid: true, msg: "ok", links }
      }
    }
  }
  return { valid: false, msg: "no uri", links: [] };
}


export const suggestList = async (letters = "", cc = "", lang = ""): Promise<string[]> => {
  const alias = "seek/suggest";
  if (notEmptyString(letters, 2)) {
    const filter: Map<string, string> = new Map();
    filter.set('q', letters);
    if (notEmptyString(cc) && cc.length < 3) {
      filter.set('cc', cc);
    }
    if (notEmptyString(lang) && lang.length < 6) {
      filter.set('lang', lang);
    }
    const params = Object.fromEntries(filter.entries());
    const data = await fetchDataObject(alias, params );
    if (data instanceof Object) {
      const { results } = data;
      if (results instanceof Array) {
        return results;
      }
    }
  }
  return [];
}

export const fetchSuggestList = async (letters = "", cc = "", lang = ""): Promise<string[]> => {
  let cacheKey = "";
  if (notEmptyString(letters, 2)) {
    if (letters.length <= 8) {
      const searchKey = btoa(letters);
      const cacheParts = ['suggest', searchKey];
      if (notEmptyString(cc) && cc.length < 3) {
        cacheParts.push(cc);
      }
      if (notEmptyString(lang) && lang.length < 3) {
        cacheParts.push(lang);
      }
      cacheKey = cacheParts.join('_');
    }
    const stored = fromLocal(cacheKey, 86400)
    if (!stored.expired) {
      return stored.data;
    } else {
      const items = await suggestList(letters, cc, lang);
      if (items instanceof Array && items.length > 0) {
        toLocal(cacheKey, items);
        return items;
      } else {
        return [];
      }
    }
  } else {
    return []
  }
}

export const getSearchResults = async (text = "", cc = "", lang = "", page = 1): Promise<BasicData> => {
  const alias = "seek/search";
  if (notEmptyString(text, 2)) {
    const filter: Map<string, string> = new Map();
    filter.set('q', text);
    if (notEmptyString(cc) && cc.length < 3) {
      filter.set('cc', cc);
    }
    if (notEmptyString(lang) && lang.length < 6) {
      filter.set('lang', lang);
    }
    if (page > 1) {
      filter.set('p', page.toString());
    }
    const params = Object.fromEntries(filter.entries());
    return await fetchDataObject(alias, params );
  } else {
    return { valid: false };
  }
}

export const fetchSearchResults = async (text = "", cc = "", lang = "", page = 1): Promise<SearchResultSet> => {
  const cParts = ['search', btoa(text)];
  if (notEmptyString(cc)) {
    cParts.push(cc);
  }
  if (notEmptyString(lang)) {
    cParts.push(lang);
  }
  if (page > 1) {
    cParts.push(`p${page}`);
  }
  let result: SearchResultSet = new SearchResultSet();
  const cacheKey = cParts.join('_');
  const stored = fromLocal(cacheKey, 60 * 60);
  if (!stored.expired && stored.data instanceof Object) {
    result = new SearchResultSet(stored.data);
  } else {
    const data = await getSearchResults(text, cc, lang, page);
    if (data.valid) {
      if (data.results instanceof Array && data.results.length > 0) {
        toLocal(cacheKey, data);
      }
      result = new SearchResultSet(data);
    }
  }
  return result;
}

export const fetchTextPage = async (uri = "", fullMode = false): Promise<PageResult>  => {
  const cacheKey = ['page', btoa(uri)].join('_');
  const stored = fromLocal(cacheKey, 60 * 60);
  let page = new PageResult();
  if (!stored.expired && !fullMode) {
    page = new PageResult(stored.data, uri);
  } else {
    const data = await fetchPageFromRemote(uri, fullMode);
    if (data.valid) {
      toLocal(cacheKey, data);
      page = new PageResult(data, uri);
    }
  }
  return page;
}

export const fetchPageLinks = async (uri = ""): Promise<LinkResultSet>  => {
  const cacheKey = ['pl', btoa(uri)].join('_');
  const stored = fromLocal(cacheKey, 60 * 60);
  let resultSet = new LinkResultSet();
  let matched = false;
  if (!stored.expired) {
    const { links } = stored.data;
    if (links instanceof Array && links.length > 0) {
      resultSet = new LinkResultSet(links, uri);
      matched = true;
    }
  }
  if (!matched) {
    const data = await fetchPageLinksFromRemote(uri);
    if (data.valid) {
      const { links } = data;
      if (links.length > 0) {
        toLocal(cacheKey, data);
        resultSet = new LinkResultSet(links, uri);
      }
    }
  }
  return resultSet;
}

