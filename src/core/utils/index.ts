import * as _ from 'lodash';
import { ObjectId } from 'mongodb';
import { isEmpty, isNil, split } from 'ramda';
import { isArray, isObject } from 'util';

const isNullOrEmptyOrUndefined = (value: any) => {
  if (isArray(value) || isObject(value)) {
    return isNil(value) || isEmpty(value);
  }

  return isNil(value) || isEmpty(value) || value === 'undefined';
};

const stringToArray = (value: string, separate = ','): string[] => {
  if (this.isNullOrEmptyOrUndefined(value)) {
    return [];
  } else {
    return split(separate, value);
  }
};

const getObjectIdAsString = (object: any) => {
  if (_.isObject(object)) {
    // Object is ObjectId or any Object
    if (ObjectId.isValid(object)) {
      return object.toString();
    }

    // Object id dto object
    const objectId = _.get(object, '_id', null);
    if (_.isObject(objectId)) {
      return objectId.toString();
    }
    return objectId;
  }
  return object;
};

const countSkipItem = (pageNumber, pageSize): number => {
  const skipItem = (+pageNumber - 1) * +pageSize;
  return skipItem;
};

const truncate = (fullContent: string, truncLength = 300) => {
    if (isNullOrEmptyOrUndefined(fullContent)){
        return '';
    }

    if (fullContent.length <= truncLength)
    {
      return fullContent;
    }

    return `${fullContent.substring(0, truncLength)}...`;
};

const fileToJSON = (dir) => {
  const fs = require('fs');
  const readFile = fs.readFileSync(dir, { encoding: 'utf8' });
  const content = Buffer.isBuffer(readFile) ? readFile.toString('utf8') : readFile;
  const obj = JSON.parse(content);
  return obj;
};

const generateNumber = (length: number): string => {
  let string = '';
  while (string.length < length){
      const randomnumber = Math.floor(Math.random() * 100) + 1;
      string += randomnumber.toString();
  }
  if (string.length > length) {
      string = string.substr(0, length);
  }
  return string;
};

export { isNullOrEmptyOrUndefined, stringToArray, getObjectIdAsString, countSkipItem, truncate, fileToJSON, generateNumber };
export * from './ utf8-regex';
export * from './guid';
export * from './hash.ultility';
export * from './preconditions';
export * from './yaml-configure-loader';
export * from './IdentityHelper';