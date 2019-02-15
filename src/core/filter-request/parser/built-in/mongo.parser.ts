import { MongoFilterQueryBuilderFactory } from '../../mongo-query-builder';
import { IFilterParser } from '../contract';

export class MongoFilterParser implements IFilterParser {
    parse(clientQueryObj: {
        filter: any
    }) {
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