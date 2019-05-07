export interface IMongoDbConfig {
    dbServer: string;
    dbName: string;
}

export const DBConfigToken = '__DBConfigToken__';

export interface IDBConfigProvider {
    getConfig(): IMongoDbConfig;
}

export class MongoDbConfigService {
    private _config: IMongoDbConfig;
    get config() {
        return this._config;
    }
    set config(value: IMongoDbConfig) {
        this._config = value;
    }
}