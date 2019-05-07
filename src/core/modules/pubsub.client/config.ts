export interface IPubSubConfig {
    host: string;
}

export class PubSubConfigService {

    private _config: IPubSubConfig;

    public get config() {
        return this._config;
    }

    public set config(v: IPubSubConfig) {
        this._config = v;
    }
}