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

export { isNullOrEmptyOrUndefined, stringToArray, getObjectIdAsString };
