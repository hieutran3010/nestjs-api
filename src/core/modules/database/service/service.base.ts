import { Injectable } from '@nestjs/common';
import { RepositoryFactory } from '../factory/repository.factory';

/**
 * Define service base for all system and auto inject repository inside
 *
 * @export
 * @class ServiceBase
 */

export abstract class ServiceBase {
  constructor(private readonly repositoryFactory: RepositoryFactory) {}
}
