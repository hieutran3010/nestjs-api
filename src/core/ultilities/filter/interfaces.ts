enum FilterType {
  Default = '',
  Regex = '$regex',
  GreatThan = '$gt',
  LessThan = '$lt',
  Equal = '$eq',
  And = '$and',
  Or = '$or',
  In = '$in',
  GreatThanEqual = '$gte',
  LessThanEqual = '$lte',
  Custom = 'custom'
}

enum ValueType {
  String = 'string',
  Number = 'number',
  Array = 'array',
  Date = 'date',
  ObjectId = 'objectId',
  RegexContains = 'regex-contains',
  Object = 'object'
}

interface IFilter {
  name?: string;
  type: FilterType;
  value?: string | IFilter[] | any;
  valueType?: ValueType;
}

interface IFilterQueryBuilder {
  build(): {};
}

export { FilterType, ValueType, IFilter, IFilterQueryBuilder };
