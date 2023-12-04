import { notEmptyString } from "../validators";

export interface LtDvPair {
  lt: string;
  dv: string;
}

const indianLangs = ["hi", "bn", "gu", "ne", "mr", "pa"];

export class LexemeCriteria {
  lang = "en";
  type = "default";
  alpha = "lt";
  constructor(obj: any) {
    if (obj instanceof Object) {
      Object.entries(obj).forEach((entry) => {
        const [key, value] = entry;
        switch (key) {
          case "lang":
          case "type":
          case "alpha":
            if (typeof value === "string") {
              this[key] = value;
            }
            break;
        }
      });
    }
  }
}

export class Translation {
  lang = "en";
  text = "";
  type = "";
  alpha = "lt";

  constructor(obj: any) {
    if (obj instanceof Object) {
      Object.entries(obj).forEach((entry) => {
        const [key, value] = entry;
        switch (key) {
          case "lang":
          case "text":
          case "type":
          case "alpha":
            if (typeof value === "string") {
              this[key] = value;
            }
            break;
        }
      });
    }
  }
}

export class Lexeme {
  key = "";
  subkey = "";
  category = "";
  name = "";
  original = "";
  unicode = "";
  lang = "";
  translations: Array<Translation> = [];

  constructor(obj: any) {
    if (obj instanceof Object) {
      Object.entries(obj).forEach((entry) => {
        const [key, value] = entry;
        switch (key) {
          case "key":
            if (typeof value === "string") {
              this.key = value;
              const parts = value.split("__");
              if (parts.length === 2) {
                this.category = parts[0];
                this.subkey = parts[1];
              }
            }
            break;
          case "name":
          case "original":
          case "unicode":
          case "lang":
            if (typeof value === "string") {
              this[key] = value;
            }
            break;
          case "translations":
            if (value instanceof Array) {
              this.translations = value.map((tr) => new Translation(tr));
            }
            break;
        }
      });
    }
  }

  hasText() {
    return notEmptyString(this.name);
  }

  hasOriginal() {
    return notEmptyString(this.original);
  }

  variantPairs(lang: string): Array<LtDvPair> {
    const results: Array<LtDvPair> = [];
    const trs = this.translations.filter(
      (tr) => tr.lang === lang && tr.type === "variant"
    );
    const numPairs = Math.ceil(trs.length / 2);
    for (let i = 0; i < numPairs; i++) {
      const startIndex = i * 2;
      const minLengthForPair = (i + 1) * 2;
      const filteredTrs =
        trs.length >= minLengthForPair
          ? trs.splice(startIndex, 2)
          : trs.splice(0, 2);
      if (filteredTrs.length > 0) {
        const dv = filteredTrs.find((tr) => tr.alpha === "dv");
        const lt = filteredTrs.find((tr) => tr.alpha === "lt");
        const vp = { lt: "", dv: "" };
        if (lt) {
          vp.lt = lt.text;
        }
        if (dv) {
          vp.dv = dv.text;
        }
        results.push(vp);
      }
    }
    return results;
  }

  text(lang: string, type = "default", alpha = "lt"): string {
    let str = "";
    if (!this.matchesLang(lang) && type !== "default") {
      const trs = this.translations.filter((tr) => tr.lang === lang);

      if (trs.length > 0) {
        let preferred = trs.filter((tr) => tr.type === type);

        if (preferred.length > 0) {
          str = this.matchPreferredTranslationScript(alpha, preferred);
        } else {
          preferred = trs.filter((tr) => tr.type === "standard");
          if (preferred.length > 0) {
            str = this.matchPreferredTranslationScript(alpha, preferred);
          } else if (type !== "standard") {
            str = this.matchPreferredTranslationScript(alpha, trs);
          }
        }
      }
    }
    if (str.length < 1) {
      if (this.showOrigScript(lang, alpha)) {
        str = this.original;
      } else {
        str = this.name;
      }
    }
    return str;
  }

  alt(langOne: string, langTwo: string) {
    const l1 = this.text(langOne, "standard");
    const l2 = this.text(langTwo, "standard");
    return l1 !== l2 ? [l1, l2].join(" / ") : l1;
  }

  matchesLang(lang: string): boolean {
    let valid = false;
    switch (this.lang) {
      case "sa":
        valid = indianLangs.includes(lang);
        break;
      default:
        valid = this.lang === lang;
        break;
    }
    return valid;
  }

  showOrigScript(lang: string, alpha = "lt"): boolean {
    let valid = false;
    if (notEmptyString(this.original, 1)) {
      switch (this.lang) {
        case "sa":
          valid = indianLangs.includes(lang) && alpha === "dv";
          break;
        default:
          valid = this.lang === lang && alpha !== "lt";
          break;
      }
    }
    return valid;
  }
  matchPreferredTranslationScript(
    alpha = "lt",
    translations: Array<Translation> = []
  ): string {
    let str = "";
    if (translations.length > 0) {
      const preferred = translations.filter((tr) => tr.alpha === alpha);
      const obj =
        preferred.length > 0 ? preferred.shift() : translations.shift();
      str = obj instanceof Object ? obj.text : "";
    }
    return str;
  }
}

export class Dictionary {
  lexemes: Array<Lexeme> = [];

  constructor(items: Array<any> = []) {
    this.lexemes = items.map((lx) => new Lexeme(lx));
  }

  lexeme = (category: string, subkey: string | number): Lexeme => {
    if (typeof subkey === "number") {
      subkey = subkey.toString();
    }
    const lexeme = this.lexemes.find(
      (lx) => lx.category === category && lx.subkey === subkey
    );
    return lexeme instanceof Lexeme ? lexeme : new Lexeme(null);
  };

  text = (category: string, subkey: string | number, criteria = null) => {
    let str = "";
    if (typeof subkey === "number") {
      subkey = subkey.toString();
    }
    const { lang, type, alpha } = new LexemeCriteria(criteria);
    const lex = this.lexemes.find(
      (lx) => lx.category === category && lx.subkey === subkey
    );
    if (lex) {
      str = lex.text(lang, type, alpha);
    }
    return str;
  };

  byCategory = (category: string): Array<Lexeme> => {
    return this.lexemes.filter((lx) => lx.category === category);
  };

  graha = (key: string): Lexeme => {
    let mk = key.toLowerCase();
    let prefix = "";
    switch (mk) {
      case "as":
      case "asc":
        mk = "asc";
        break;
      case "ds":
      case "dsc":
        mk = "dsc";
        break;
      default:
        prefix = "a_\\d+_";
        break;
    }
    const cat = ["asc", "dsc"].includes(mk) ? "bhava" : "graha";
    const rgx = new RegExp("^" + prefix + mk + "$", "i");
    const lex = this.lexemes.find(
      (lx) => lx.category === cat && rgx.test(lx.subkey)
    );
    return lex instanceof Lexeme ? lex : new Lexeme(null);
  };
}
