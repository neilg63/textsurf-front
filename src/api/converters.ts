import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import differenceInCalendarYears from "date-fns/differenceInCalendarYears";
import addSeconds from "date-fns/addSeconds";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { validDateTimeString, isNumeric, notEmptyString } from "./validators";

export interface DegreesMinutesSeconds {
  deg: number;
  min: number;
  sec?: number;
}

export const zeroPad = (inval: number | string, places = 2): string => {
  let num = 0;
  if (typeof inval === "string") {
    num = parseInt(inval);
  } else if (typeof inval === "number") {
    num = inval;
  }
  const strs: Array<string> = [];
  const len = num > 0 ? Math.floor(Math.log10(num)) + 1 : 1;
  if (num < Math.pow(10, places - 1)) {
    const ep = places - len;
    strs.push("0".repeat(ep));
  }
  strs.push(num.toString());
  return strs.join("");
};

export const sortNumPad = (inval: string): string => {
  return isNumeric(inval) ? zeroPad(inval, 10) : inval;
};

export const smartSortNumPad = (inval: string): string => {
  const [c, k] = inval.split("__");
  return [c, sortNumPad(k)].join("__");
};

export const secondsToHMS = (seconds: any): string => {
  const parts = [];
  if (isNumeric(seconds)) {
    if (seconds >= 3600) {
      parts.push(Math.floor(seconds / 3600) + "h");
    }
    if (seconds >= 60) {
      parts.push((Math.floor(seconds / 60) % 60) + "m");
    }
    const secs = seconds % 60;
    if (secs) {
      parts.push(secs + "s");
    }
  }
  return parts.join(" ");
};

export const capitalize = (str: string): string => {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
};

export const decPlaces = (flDeg: any, places = 3) => {
  let str = "";
  if (isNumeric(flDeg)) {
    flDeg = parseFloat(flDeg);
    str = flDeg
      .toFixed(places)
      .replace(/0+$/, "")
      .replace(/\.$/, "")
      .replace(/^-0$/, "0");
  }
  return str;
};

export const percDec = (flVal: any, places = 3) =>
  decPlaces(flVal, places) + "%";

export const asPerc = (flVal: number, places = 3) =>
  decPlaces(flVal * 100, places) + "%";

export const degDec = (flDeg: any, places = 3) =>
  decPlaces(flDeg, places) + "º";

export const smartCastFloat = (inval: any): number => {
  let out = 0;
  if (isNumeric(inval)) {
    if (typeof inval === "string") {
      out = parseFloat(inval);
    } else if (typeof inval === "number") {
      out = inval;
    }
  }
  return out;
};

export const smartCastInt = (inval: any): number => {
  return Math.floor(smartCastFloat(inval));
};

export const smartCastBool = (item: any, defVal: boolean = true) => {
  let boolVal = defVal;
  if (typeof item === 'string') {
    if (/^-?[0-9]$/.test(item)) {
      boolVal = parseInt(item, 10) > 0;
    } else if (/^(true|false|yes|no)$/i.test(item)) {
      switch (item.toLowerCase()) {
        case 'true':
        case 'yes':
          boolVal = true;
          break;
        case 'false':
        case 'no':
          boolVal = false;
          break;
      }
    }
  } else if (typeof item === 'number') {
    boolVal = item > 0;
  } else if (typeof item === 'boolean') {
    boolVal = item;
  }
  return boolVal;
};

export const camelToTitle = (str: string): string => {
  return str
    .replace(/([A-Z])/g, (match) => {
      return " " + match.toLowerCase();
    })
    .replace(/^./, (match) => {
      return match.toUpperCase();
    })
    .replace(/\b(co)\s+([A-Z])/i, "$1$2");
};

export const snakeToWords = (str: string): string => {
  return str.split(/[-_]+/).join(" ");
};

export const minorWords = ["the", "a", "an", "of"];

export const sanitize = (
  str: string,
  separator = "_",
  maxLen = 128,
  removeWords = true
): string => {
  const minorWordRgx = new RegExp(
    "(^|_)(" + minorWords.join("|") + ")(_|$)",
    "g"
  );
  const sepRgx = new RegExp(separator + "+", "g");
  const endSepRgx = new RegExp(
    "(^" + separator + "+|" + separator + "+$)",
    "g"
  );
  const sourceString = notEmptyString(str) ? str : "";
  let slug = sourceString
    .toLowerCase()
    .trim()
    .replace(/é/g, "e")
    .replace(/è/g, "e")
    .replace(/ø/g, "o")
    .replace(/ñ/g, "ny")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, separator);
  if (removeWords) {
    slug = slug.replace(minorWordRgx, separator);
  }
  slug = slug.replace(sepRgx, separator).replace(endSepRgx, "");
  if (slug.length > maxLen) {
    slug = slug.substring(0, maxLen).replace(endSepRgx, "");
  }
  return slug;
};

export const cleanString = (str: string, separator = "-") => {
  return sanitize(str, separator, 256, false);
};

export const asDateString = (datetime: Date): string => {
  const d = datetime;
  const date = [
    d.getFullYear(),
    zeroPad(d.getMonth() + 1),
    zeroPad(d.getDate()),
  ].join("-");
  const time = [
    zeroPad(d.getHours()),
    zeroPad(d.getMinutes()),
    zeroPad(d.getSeconds()),
  ].join(":");
  return [date, time].join("T");
};

export const toTimeString = (date: Date): string => {
  const hrs = date.getHours();
  const mns = date.getMinutes();
  const scs = date.getSeconds();
  return [zeroPad(hrs), zeroPad(mns), zeroPad(scs)].join(":");
};

export const toDateTime = (strDate: string): Date => {
  if (validDateTimeString(strDate)) {
    const dt = parseISO(strDate);
    return dt;
  } else {
    return new Date(0);
  }
};

export const dateToYear = (strDate: string) => {
  if (validDateTimeString(strDate)) {
    const date = toDateTime(strDate);
    return date.getFullYear();
  }
  return 0;
};

export const toMillitime = (strDate: string) => {
  let ts = 0;
  const dt = toDateTime(strDate);
  if (dt) {
    ts = dt.getTime();
  }
  return ts;
};

export const yearYoDateString = (year: any) => {
  if (isNumeric(year)) {
    year = parseInt(year);
    return [year, "07", "01"].join("-") + "T00:00:00";
  }
};

export const formatDate = (datetime: any, fmt: string) => {
  if (datetime) {
    if (!fmt) {
      fmt = "dd/MM/yyyy";
    }
    if (typeof datetime === "string" && validDateTimeString(datetime)) {
      datetime = toDateTime(datetime);
    }
    return format(datetime, fmt);
  }
};

export const longDate = (
  datetime: any,
  offset = 0,
  dateMode = "dmy",
  precision = "s"
) => {
  if (offset !== 0) {
    if (typeof datetime === "string") {
      datetime = toDateTime(datetime);
    }
    if (datetime instanceof Date) {
      datetime = addSeconds(datetime, offset);
    }
  }

  let dateFmt = "dd/MM/yyyy";

  switch (dateMode) {
    case "us":
      dateFmt = "MM/dd/yyyy";
      break;
    case "euro":
      dateFmt = "dd.MM.yyyy";
      break;
    case "iso":
      dateFmt = "yyyy-MM-dd";
      break;
    case "extended":
      dateFmt = "d MMMM YYYY";
      break;
    case "-":
    case "":
    case "none":
      dateFmt = "";
      break;
  }

  let timeFmt = "";
  switch (precision) {
    case "s":
      timeFmt = "HH:mm:ss";
      break;
    case "m":
      timeFmt = "HH:mm";
      break;
  }
  const dtFmt = [dateFmt, timeFmt].join(" ").trim();
  return formatDate(datetime, dtFmt);
};

export const mediumDate = (datetime: any, offset = 0, dateFmt = "dmy") => {
  return longDate(datetime, offset, dateFmt, "m");
};

export const longDateOnly = (datetime: any, offset = 0) => {
  return longDate(datetime, offset, "-", "d");
};

export const mediumDateOnly = (datetime: any, offset = 0) => {
  return longDate(datetime, offset, "dmy", "d");
};

export const longTime = (datetime: any, offset = 0) => {
  return longDate(datetime, offset, "-", "s");
};

export const hourMinTz = (offset = 0, alwaysShowMinutes = false) => {
  const secs = Math.abs(offset);
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor(secs / 60) % 60;
  const parts = [offset >= 0 ? "+" : "-", zeroPad(hours, 2)];
  if (alwaysShowMinutes || minutes > 0) {
    parts.push(":");
    parts.push(zeroPad(minutes, 2));
  }
  return parts.join("");
};

export const getAge = (datetime: any) => {
  const currDt = new Date();
  const years = differenceInCalendarYears(currDt, datetime);
  return years;
};

export const toRelativeTime = (datetime: any) => {
  if (datetime) {
    if (typeof datetime === "string" && validDateTimeString(datetime)) {
      datetime = toDateTime(datetime);
    }
    return formatDistanceToNow(datetime, {
      includeSeconds: false,
    });
  }
};

export const toCommas = (value: any): string => {
  let str = "";
  if (value instanceof Array) {
    str = value.join(", ");
  }
  return str;
};

export const yesNo = (ref: any = null): string => {
  let str = "";
  switch (typeof ref) {
    case "boolean":
      str = ref ? "yes" : "no";
      break;
    case "number":
      str = ref > 0 ? "yes" : "no";
      break;
    case "string":
      switch (ref.toLowerCase()) {
        case "true":
        case "yes":
          str = "yes";
          break;
        case "false":
        case "no":
          str = "no";
          break;
      }
      break;
  }
  return str;
};

const stripTrailingZeros = (str: string): string => {
  return str.includes(".") ? str.replace(/0+$/, "").replace(/\.$/, "") : str;
};

export const fileSize = (size: number): string => {
  let str = "";
  if (size < 1024) {
    str = size.toString();
  } else if (size < 1024 * 20) {
    str = stripTrailingZeros((size / 1024).toFixed(2)) + " KB";
  } else if (size < 1024 * 100) {
    str = stripTrailingZeros((size / 1024).toFixed(1)) + " KB";
  } else if (size < 1024 * 1024) {
    str = Math.round(size / 1024).toString() + " KB";
  } else if (size < 1024 * 1024 * 10) {
    str = stripTrailingZeros((size / (1024 * 1024)).toFixed(2)) + " MB";
  } else if (size < 1024 * 1024 * 100) {
    str = stripTrailingZeros((size / (1024 * 1024)).toFixed(1)) + " MB";
  } else if (size < 1024 * 1024 * 1024) {
    str = Math.round(size / (1024 * 1204)).toString() + " MB";
  } else {
    str = stripTrailingZeros((size / (1024 * 1024 * 1024)).toFixed(2)) + " GB";
  }
  return str;
};

export const isALeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

export const calcMonthYearMeta = (year: number) => {
  const isLeapYear = isALeapYear(year);
  let mds = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365, 396];
  if (isLeapYear) {
    mds = mds.map((md, mi) => (mi > 1 ? md + 1 : md));
  }
  return {
    monthStarts: mds,
    yearLength: isLeapYear ? 366 : 365,
  };
};

export const doubleYearToDateParts = (years: number) => {
  const year = Math.floor(years);
  const { monthStarts, yearLength } = calcMonthYearMeta(year);
  const dayFloat = (years % 1) * yearLength;
  const monthIndex = monthStarts.findIndex((md) => md > dayFloat);
  const monthStart = monthStarts[monthIndex - 1];
  const dayFrac = dayFloat - monthStart;
  const days = Math.round(dayFrac);
  const months = monthIndex;
  const parts = [year.toString()];
  if (months > 0) {
    if (months > 1 || days > 0) {
      parts.push(zeroPad(months, 2));
    }
    if (days > 0) {
      parts.push(zeroPad(days, 2));
    }
  }
  return {
    year,
    months,
    days,
    display: parts.join("-"),
  };
};

export const datePartsToYearDouble = (
  years: number,
  months = 0,
  days = 0
): number => {
  const year = Math.floor(years);
  const { monthStarts, yearLength } = calcMonthYearMeta(year);
  let dbl = year;

  if (months > 0) {
    const monthFrac = monthStarts[months - 1] / yearLength;
    dbl += monthFrac;
    if (days > 0) {
      const dayFrac = (days / yearLength) % 1;
      dbl += dayFrac;
    }
  }
  return dbl;
};

export const ordinalNumber = (num: number | string): string => {
  const intVal =
    typeof num === "string"
      ? parseInt(num)
      : typeof num === "number"
      ? num
      : -1;
  let suffix = "";
  const lastInt = intVal % 10;
  const inTens = intVal % 100 >= 10 && intVal % 100 < 20;
  switch (lastInt) {
    case -1:
      break;
    case 1:
      suffix = inTens ? "th" : "st";
      break;
    case 2:
      suffix = inTens ? "th" : "nd";
      break;
    case 3:
      suffix = inTens ? "th" : "rd";
      break;
    default:
      suffix = typeof intVal === "number" ? "th" : "";
      break;
  }
  return [num, suffix].join("");
};

export const toCharCode = (str: string) => {
  return str.length > 0 ? "U+" + str.charCodeAt(0).toString(16) : "";
};

export const approxDateParts = (dateStr: string) => {
  const parts = dateStr.split(/[./-]/).map(smartCastInt);
  if (parts.length < 3) {
    if (parts.length < 2) {
      parts.push(0);
    }
    parts.push(0);
  }
  return parts;
};

export const matchYearDouble = (strDate = ""): number => {
  const [sYear, sMonth, sDay] = approxDateParts(strDate);
  return strDate.length > 3 ? datePartsToYearDouble(sYear, sMonth, sDay) : -1;
};

export const isoDateStringToSimple = (
  dtStr = "",
  timePrecision = "m"
): string => {
  const parts = dtStr.split("T");
  const outParts = [];
  if (parts instanceof Array && parts.length > 1) {
    const date = parts.shift()?.split("-").reverse().join("/");
    outParts.push(date);
    let end = 0;
    switch (timePrecision) {
      case "h":
        end = 1;
        break;
      case "m":
        end = 2;
        break;
      case "s":
        end = 3;
        break;
    }
    if (end > 0 && parts.length > 0) {
      const tp = parts.pop()?.split(".").shift()?.split(":");
      outParts.push(tp?.slice(0, end).join(":"));
    }
  }
  return outParts.join(" ");
};

export const objectToMap = (data: any = null): Map<string, any> => {
  return data instanceof Object ? new Map(Object.entries(data)) : new Map();
};

export const roundToStep = (value = 0, step = 5): number => {
  const func = value < 0 ? Math.ceil : Math.floor;
  return func(smartCastInt(value) / step) * step;
};

export const degToSign = (deg: number): number => {
  return Math.floor((deg % 360) / 30) + 1;
};

export const shortenName = (str = ""): string => {
  let out = "";
  if (typeof str === "string") {
    const parts = str.trim().split(/\s+/);
    if (parts[0].length > 1 || parts.length < 2) {
      out = parts[0];
    } else {
      out = [parts[0], parts[1]].join(" ");
    }
  }
  return out;
};
