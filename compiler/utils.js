// @classcade/compiler/utils.js

export const arrayfied = sth => Array.isArray(sth) ? sth : [sth];

export const isClient = () => typeof window !== 'undefined';

export const isFn            = sth => typeof sth === 'function';
export const isNumber        = sth => typeof sth === 'number';
export const isNumericString = sth => typeof sth === 'string' && /^-?\d+(?:\.\d+)?$/.test(sth.trim());
export const isNumeric       = sth => isNumber(sth) || isNumericString(sth);
export const isString        = sth => typeof sth === 'string';
