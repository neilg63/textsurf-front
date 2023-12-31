import { smartCastInt } from "../converters";
import { cleanInnerHtml } from "../dom";
import { notEmptyString } from "../validators";

export class PageStats {
  cached = false;
  compactHtmlLength = 0;
  compactTextLength = 0;
  sourceHtmlLength = 0;
  strippedHtmlLength = 0;
  ts = 0;

  constructor(inData: any  = null, ts = 0) {
    if (inData instanceof Object) {
      const { compactHtmlLength,  compactTextLength,  sourceHtmlLength, strippedHtmlLength } = inData;
      this.compactHtmlLength = smartCastInt(compactHtmlLength);
      this.compactTextLength = smartCastInt(compactTextLength);
      this.sourceHtmlLength = smartCastInt(sourceHtmlLength);
      this.strippedHtmlLength = smartCastInt(strippedHtmlLength);
      if (ts > 1000) {
        this.ts = smartCastInt(ts);
      }
    }
  }
}

export class PageResult {
  innerHTML = "";
  description = "";
  image = "";
  numLinks = 0;
  textLength = 0;
  stats = new PageStats();
  domainLinks: string[] = [];
  lang = "";
  uri = "";

  constructor(inData: any  = null, uri = "", ts = 0) {
    if (ts < 1000) {
      ts = Date.now() / 1000;
    }
    if (inData instanceof Object) {
      const { content, stats } = inData;
      if (content instanceof Object) {
        this.stats = new PageStats(content, ts);
        const { bestText, compactTextLength } = content;
        if (notEmptyString(bestText, 5)) {
          this.innerHTML = cleanInnerHtml(bestText);
        }
        if (compactTextLength) {
          this.textLength = smartCastInt(compactTextLength);
          if (this.textLength < 2500 && this.innerHTML.length > 16) {
            const stripped = this.innerHTML.replace(/<\/?\w[^>]*?>/g, "").replace(/\s\s+/, " ").trim();
            if (stripped.length < 1250) {
              this.textLength = stripped.length;
            }
          }
        }
      }
      if (stats instanceof Object) {
        const { image, description, numLinks, domainLinks, lang, uri } = stats;
        if (domainLinks instanceof Array) {
          this.domainLinks = domainLinks;
        }
        this.numLinks = smartCastInt(numLinks);
        if (notEmptyString(image)) {
          this.image = image;
        }
        if (notEmptyString(description)) {
          this.description = description;
        }
        if (notEmptyString(lang)) {
          this.lang = lang;
        }

        if (notEmptyString(uri, 5)) {
          this.uri = uri;
        }
      }
      if (notEmptyString(uri, 5) && this.uri.length < 5) {
        this.uri = uri;
      }
    }
  }

  get hasContent(): boolean {
    return this.innerHTML.length > 5 || this.description.length > 0;
  }

  get minimalContent(): boolean {
    return this.textLength < 1024;
  }

  get hasManyLinks(): boolean {
    return this.numLinks > 8;
  }

  get hasUri(): boolean {
    return (this.uri.startsWith('http://') || this.uri.startsWith('https://')) && notEmptyString(this.uri, 10);
  }

}