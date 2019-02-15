import { Inject, Injectable } from '@nestjs/common';
import { Connection, connection } from 'mongoose';
import { DBConnection } from '../constant/db.const';
import { InterfaceBase, SchemaBase } from '../contract/base.document';
import { RepositoryBase } from './repository.base';

@Injectable()
export class RepositoryFactory {
  /**
   * Creates an instance of RepositoryFactory.
   * @param {Connection} connect
   * @memberof RepositoryFactory
   */
  constructor(@Inject(DBConnection) private readonly connect: Connection) {}

  getRepository<T extends InterfaceBase>(
    collectName: string,
    schema: SchemaBase,
  ): RepositoryBase<T> {

    return new RepositoryBase<T>(connection, schema, collectName);
  }
}
