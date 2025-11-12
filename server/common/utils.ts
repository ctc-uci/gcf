const isNumeric = (value: string) => {
  return /^\d+$/.test(value);
};

const isBoolean = (value: string) => {
  return [true, false, "true", "false"].includes(value);
};

const isZipCode = (value: string) => {
  return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(value);
};

const isAlphaNumeric = (value: string) => {
  return /^[0-9a-zA-Z]+$/.test(value);
};

const isPhoneNumber = (value: string) => {
  return /^\d+$/.test(value) || value.length > 15;
};

const isISODate = (value: unknown) => {
  try {
    if (!(value instanceof Date)) {
      return false;
    }

    const ISOString = value.toISOString();
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(ISOString))
      return false;

    const d = new Date(ISOString);
    return d.toISOString() === ISOString;
  } catch (_) {
    return false;
  }
};

// toCamel, isArray, and isObject are helper functions used within utils only
const toCamel = (string: string) => {
  return string.replace(/([-_][a-z])/g, ($1) => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
};

const isArray = (array: unknown) => {
  return Array.isArray(array);
};

const isObject = (object: unknown) => {
  return (
    object === Object(object) &&
    !isArray(object) &&
    typeof object !== "function" &&
    !isISODate(object)
  );
};

// Database columns are in snake case. JavaScript is suppose to be in camel case
// This function converts the keys from the sql query to camel case so it follows JavaScript conventions
const keysToCamel = (data: object | string[] | string) => {
  if (isObject(data)) {
    const newData = {};

    Object.keys(data).forEach((key) => {
      newData[toCamel(key)] = keysToCamel(data[key]);
    });

    return newData;
  }

  if (isArray(data)) {
    return data.map((i: string) => keysToCamel(i));
  }

  if (
    typeof data === "string" &&
    data.length > 0 &&
    data[0] === "{" &&
    data.at(-1) === "}"
  ) {
    const sanitizedString = data.replace(/"/g, "");
    const parsedList = sanitizedString
      .slice(1, sanitizedString.length - 1)
      .split(",");

    return parsedList;
  }

  return data;
};

export {
  isNumeric,
  isBoolean,
  isZipCode,
  isAlphaNumeric,
  isPhoneNumber,
  keysToCamel,
};
