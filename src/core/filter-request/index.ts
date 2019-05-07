import { isNullOrEmptyOrUndefined, UTF8Encoding } from '../utils';
import { ParserType } from './parser/contract';
import { FilterParserFactory } from './parser/factory';

const convertFilterToMongoQuery = (encodeQueryString: string) => {
  // Decode query
  const queryString = UTF8Encoding.utf8Decode(encodeQueryString);
  const queryObj = JSON.parse(queryString);
  let val = FilterParserFactory.parse(ParserType.Mongo, queryObj);
  if (isNullOrEmptyOrUndefined(val)) {
    val = {};
  }
  return val;
};

export { FilterParserFactory, ParserType, convertFilterToMongoQuery };
