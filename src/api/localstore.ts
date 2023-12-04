import { smartCastFloat, smartCastInt } from "./converters";
import { notEmptyString } from "./validators";

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
