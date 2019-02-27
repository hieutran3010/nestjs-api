import { Inject, Injectable } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { DBConfigToken, IDBConfigProvider, MongoDbConfigService } from '../config';
import { InterfaceBase, SchemaBase } from '../contract/base.document';
import { RepositoryBase } from './repository.base';

@Injectable()
export class RepositoryFactory {
  private _connection: any;

  /**
   * Creates an instance of RepositoryFactory.
   * @memberof RepositoryFactory
   */
  constructor(@Inject(DBConfigToken) private readonly configService: IDBConfigProvider) {}

  async getRepository<T extends InterfaceBase>(
    collectName: string,
    schema: SchemaBase,
  ): Promise<RepositoryBase<T>> {

    const connection = await this.getConnection();
    return new RepositoryBase<T>(connection, schema, collectName);
  }

  private async getConnection(): Promise<any> {
    if (this._connection) {
      return this._connection;
    }

    const configObject = this.configService.getConfig();
    // const configObject = this.configService.config;
    const connectString =
      `mongodb://${configObject.dbServer}/${configObject.dbName}`;
    this._connection = await mongoose.connect(connectString, {
      config: {
        autoIndex: false,
      },
      useNewUrlParser: true
    });

    return this._connection;
  }
}
