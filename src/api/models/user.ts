import { notEmptyString, validDateTimeString, validEmail } from "../validators";
import { GeoLoc } from "./geo";

export class User {
  _id = "";
  parent = "";
  nickName = "";
  identifier = "";
  useragent = "";
  gender = "";
  dob = "";
  geo: GeoLoc = new GeoLoc();

  constructor(inData: any = null) {
    if (inData instanceof Object) {
      Object.entries(inData).forEach(([k, v]) => {
        if (typeof v === "string" && k === "dob") {
          if (validDateTimeString(v)) {
            this.dob = v;
          }
        } else if (typeof v === "string") {
          if (k === "_id") {
            this._id = v;
          } else if (k === "parent") {
            this.parent = v;
          } else if (["name", "nickName"].includes(k) && notEmptyString(v, 1)) {
            this.nickName = v;
          } else if (k === "identifier" && validEmail(v)) {
            this.identifier = v;
          } else if (k === "gender" && v.length < 4) {
            this.gender = v;
          } else if (k === "useragent" && notEmptyString(v, 10)) {
            this.useragent = v;
          }
        } else if (v instanceof GeoLoc) {
          this.geo = v;
        }
      });
    }
  }

  get hasIdentifier(): boolean {
    return validEmail(this.identifier);
  }

  get id(): string {
    return this._id;
  }

  matchName(num = 1): string {
    return notEmptyString(this.nickName) ? this.nickName : `Person ${num}`;
  }

  setId(id = ""): User {
    if (notEmptyString(id)) {
      this._id = id;
    }
    return this;
  }
}
