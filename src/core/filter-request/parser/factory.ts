import { MongoFilterParser } from './built-in/mongo.parser';
import { IFilterParser, ParserType } from './contract';

export class FilterParserFactory {
    static parse(type: ParserType, filter: {
        filter: any
    }) {
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