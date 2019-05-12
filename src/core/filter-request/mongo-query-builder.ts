import { isNullOrEmptyOrUndefined } from 'core/utils';
import { ObjectId } from 'mongodb';
import { FilterType, IFilter, IFilterQueryBuilder, ValueType } from './interfaces';

abstract class MongoFilterQueryBuilder implements IFilterQueryBuilder {
  constructor(protected filterSet: IFilter) {}
  abstract build(): {};

  protected getValue() {
    switch (this.filterSet.valueType) {
      case ValueType.Number:
        const value = +this.filterSet.value;
        return value;
      case ValueType.Array:
        return this.filterSet.value as any[];
      case ValueType.Date:
        const tmp = new Date(this.filterSet.value);
        return tmp;
      case ValueType.ObjectId:
        return new ObjectId(this.filterSet.value);
      case ValueType.RegexContains:
        return `.*${this.filterSet.value}.*`;
      case ValueType.Object:
        return this.filterSet.value;
      case ValueType.String:
      default:
        return `${this.filterSet.value}`;
    }
  }
}

class DefaultFilterQueryBuilder extends MongoFilterQueryBuilder {
  constructor(protected filterSet: IFilter) {
    super(filterSet);
  }
  build(): {} {
    const filter = {};
    if (!isNullOrEmptyOrUndefined(this.filterSet.type)) {
      const value = {};
      value[this.filterSet.type] = this.getValue();
      filter[this.filterSet.name] = value;
    } else {
      filter[this.filterSet.name] = this.getValue();
    }
    return filter;
  }
}

// Use for $regex, $gt, $lt, $eq, ...
class ComparisonFilterQueryBuilder extends MongoFilterQueryBuilder {
  constructor(protected filterSet: IFilter) {
    super(filterSet);
  }
  build() {
    const filter = {};
    filter[this.filterSet.type] = this.getValue();
    const filterEntity = {};
    filterEntity[this.filterSet.name] = filter;
    return filterEntity;
  }
}

class LogicalFilterQueryBuilder extends MongoFilterQueryBuilder {
  constructor(protected filterSet: IFilter) {
    super(filterSet);
  }
  build() {
    const filter = {};
    if (this.filterSet.value && this.filterSet.value.length > 0) {
      const filterValues = [];
      const values = this.filterSet.value.map(i => i as IFilter);
      values.forEach(f => {
        const tmp = MongoFilterQueryBuilderFactory.createBuilder(f);
        filterValues.push(tmp.build());
      });
      filter[this.filterSet.type] = filterValues;
    }
    return filter;
  }
}

class MongoFilterQueryBuilderFactory {
  static customFilterBuilders = {};

  static createBuilder(filterSet: IFilter) {
    let builder: IFilterQueryBuilder;
    switch (filterSet.type) {
      case FilterType.And:
      case FilterType.Or:
        builder = new LogicalFilterQueryBuilder(filterSet);
        break;
      case FilterType.Regex:
      case FilterType.Equal:
      case FilterType.GreatThan:
      case FilterType.LessThan:
      case FilterType.GreatThanEqual:
      case FilterType.LessThanEqual:
      case FilterType.In:
        builder = new ComparisonFilterQueryBuilder(filterSet);
        break;
      case FilterType.Custom:
        builder = new this.customFilterBuilders[filterSet.name](filterSet);
        break;
      default:
        builder = new DefaultFilterQueryBuilder(filterSet);
        break;
    }
    return builder;
  }
}

export { MongoFilterQueryBuilderFactory, MongoFilterQueryBuilder };
