export const isNumeric = (num: any): boolean => {
  const dt = typeof num;
  if (
    num !== null &&
    num !== undefined &&
    (dt === "number" || dt === "string")
  ) {
    return !isNaN(parseFloat(num)) && isFinite(num);
  } else {
    return false;
  }
};

export const notEmptyString = (str: any, minLength = 1): boolean => {
  if (typeof str === "string") {
    if (!minLength) {
      minLength = 1;
    }
    return str.trim().length >= minLength;
  }
  return false;
};

export const emptyString = (str: any, minLength = 0) =>
  !notEmptyString(str, minLength);

export const validDateString = (date: string, withTime: boolean): boolean => {
  let valid = typeof date === "string";
  if (valid) {
    let pattern = "^s*[12]\\d\\d\\d-[0-1]?\\d-[0-3]\\d?";
    if (withTime === true) {
      pattern += `(T|\\s)[0-2]?\\d:[0-5]?\\d:[0-5]?\\d(\\.\\d+)?Z?`;
    }
    pattern += "\\s*$";
    const rgx = new RegExp(pattern, "i");
    valid = rgx.test(date);
  }
  return valid;
};

export const validTimeString = (timeStr = "", withSeconds = false): boolean => {
  let valid = typeof timeStr === "string";
  if (valid) {
    const secPart = withSeconds ? "(:[0-5]?\\d)" : "\\b";
    const pattern = "^[0-2]?\\d:[0-5]?\\d" + secPart;
    const rgx = new RegExp(pattern);
    valid = rgx.test(timeStr);
  }
  return valid;
};

export const validDateTimeString = (date: string): boolean => {
  return validDateString(date, true);
};

export const validEmail = (identifier: string): boolean => {
  let valid = false;
  if (notEmptyString(identifier, 4)) {
    valid = identifier.length > 5 && /^[^@]+@\w/.test(identifier);
  }
  return valid;
};

export const inRange = (num: number, range: Array<number> = [0, 0]) => {
  let valid = false;
  if (isNumeric(num) && range instanceof Array && range.length > 1) {
    valid = num >= range[0] && num <= range[1];
  }
  return valid;
};

export const withinRange = (num: number, target: number, tolerance: number) => {
  return inRange(num, [target - tolerance, target + tolerance]);
};
