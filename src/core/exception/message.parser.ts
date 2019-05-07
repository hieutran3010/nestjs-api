import { Injectable } from '@nestjs/common';

export interface IPubSubMessageParser {
    parse(messageCode: string, ...args);
}

class DefaultParser implements IPubSubMessageParser {
    parse(messageCode: string, ...args) {
        return messageCode;
    }
}

@Injectable()
export class PubSubParsingService {
    private _parser: IPubSubMessageParser = new DefaultParser();

    public get parser() {
        return this._parser;
    }

    public set parser(v: IPubSubMessageParser) {
        this._parser = v;
    }
}