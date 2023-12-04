export interface BasicData {
  valid: boolean;
  [key: string]: any;
}

export interface KeyName {
  key: string;
  name: string;
  icon?: string;
  itemKey?: string;
  classNames?: string[];
}


export interface KeyValue {
  key: string;
  value: number;
  type?: string;
}

export interface NameObjValue {
  name: string;
  value: any;
}
