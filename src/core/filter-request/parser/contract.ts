export enum ParserType {
    Mongo,
}

export interface IFilterParser {
    parse(clientQueryObj: { filter: any });
}
