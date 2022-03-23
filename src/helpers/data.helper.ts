import bcrypt from 'bcrypt'

export const getPopulatedObject = (obj: any, query: string) => {
  if (!obj) return {};
  if (!query) return obj;
  return query.split(' ').reduce((acc: Record<string, unknown>, curr: string): Record<string, unknown> => {
    if (curr) {
      if (!obj[getFirstParametr(curr)]) return acc;
      acc[getAsParametr(curr)] = obj[getFirstParametr(curr)];
      return acc;
    }
    return acc;
  }, {});
}

function getAsParametr(str: string) {
  if (!str) return '';
  if (str.indexOf(':') > -1) {
    const splitted = str.split(':');
    if (!splitted[1] && !splitted[0]) return '';
    else if (!splitted[1]) return splitted[0];
    return splitted[1];
  }
  return str;
}

function getFirstParametr(str: string) {
  if (!str) return '';
  if (str.indexOf(':') > -1) {
    const splitted = str.split(':');
    if (!splitted[1] && !splitted[0]) return '';
    else if (!splitted[0]) return '';
    return splitted[0];
  }
  return str;
}

export const withoutParameter = <T extends Record<string, unknown>>(obj: T, theRemoving: string, theReplacing?: string): T => {
  if (theRemoving && !obj[theRemoving]) return obj;
  if (theReplacing) {
    if (obj[theRemoving]) {
      const newObj = {
        ...obj,
        [theReplacing]: obj[theRemoving]
      };
      delete newObj[theRemoving];
      return newObj;
    } else {
      return obj;
    }
  } else {
    delete obj[theRemoving];
    return obj;
  }
};

export const getHashedPassword = (password: string, salt?: string | number): string | null => {
  if (!password) return null;
  if (!salt) salt = 10;
  return bcrypt.hashSync(password, salt);
}

export const getDataAccordingToKeys = (data: Record<string, unknown>, keys: string[]): any => {
  if (!data && !keys) return null;
  if (!keys.length) return data;

  return keys.reduce((acc: any, key, index) => {
    if (key in data) {
      acc[key] = data[key];
    }
    return acc;
  }, {});
};

export const asString = (str: any): string => {
  if (!str) throw new Error('No data');
  if (str.hasOwnProperty('toString')) return str.toString() as string;
  return str;
};
