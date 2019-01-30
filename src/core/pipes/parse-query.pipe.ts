import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import {
  FilterParserFactory,
  ParserType,
} from '../ultilities/filter/filter-parser';
import { isNullOrEmptyOrUndefined } from '../util';

@Injectable()
export class ParseQueryPipe implements PipeTransform<any, any> {
  transform(value: any, metadata: ArgumentMetadata): number {
    let val = FilterParserFactory.parse(ParserType.Mongo, value);
    if (isNullOrEmptyOrUndefined(val)) {
      val = {};
    }

    return val;
  }
}
