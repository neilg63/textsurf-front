import { smartCastInt } from "../converters";
import { notEmptyString } from "../validators";

export class PageStats {
  cached = false;
  compactHtmlLength = 0;
  compactTextLength = 0;
  sourceHtmlLength = 0;
  strippedHtmlLength = 0;

  constructor(inData: any  = null) {
    if (inData instanceof Object) {
      const { compactHtmlLength,  compactTextLength,  sourceHtmlLength, strippedHtmlLength } = inData;
      this.compactHtmlLength = smartCastInt(compactHtmlLength);
      this.compactTextLength = smartCastInt(compactTextLength);
      this.sourceHtmlLength = smartCastInt(sourceHtmlLength);
      this.strippedHtmlLength = smartCastInt(strippedHtmlLength);
    }
  }
}

export class PageResult {
  innerHTML = "";
  description = "";
  image = "";
  numLinks = 0;
  stats = new PageStats();
  domainLinks: string[] = [];
  lang = "";

  constructor(inData: any  = null) {
    if (inData instanceof Object) {
      const { content, stats } = inData;
      if (content instanceof Object) {
        this.stats = new PageStats(content);
        const { bestText } = content;
        if (notEmptyString(bestText, 5)) {
          this.innerHTML = bestText;
        }
      }
      if (stats instanceof Object) {
        const { image, description, numLinks, domainLinks, lang } = stats;
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
      }

    }
  }

  get hasContent(): boolean {
    return this.innerHTML.length > 5;
  }

}