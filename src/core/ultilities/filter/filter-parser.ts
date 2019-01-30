import { UTF8Encoding } from '../ utf8-regex';
import { isNullOrEmptyOrUndefined } from '../../util';
import { MongoFilterQueryBuilderFactory } from './mongo-query-builder';

enum ParserType {
  Mongo,
}

interface IFilterParser {
  parse(clientQueryObj: { filter: any });
}

class MongoFilterParser {
  parse(clientQueryObj: { filter: any }) {
    const criteriaQuery = {};

    if (clientQueryObj.hasOwnProperty('filter')) {
      const criteria = MongoFilterQueryBuilderFactory.createBuilder(
        clientQueryObj.filter,
      ).build();
      Object.assign(criteriaQuery, criteria);
    }

    return criteriaQuery;
  }
}

class FilterParserFactory {
  static parse(type: ParserType, filter: { filter: any }) {
    let parser: IFilterParser;
    switch (type) {
      case ParserType.Mongo:
        parser = new MongoFilterParser();
        break;
    }

    if (parser) {
      return parser.parse(filter);
    } else {
      return {};
    }
  }
}

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
