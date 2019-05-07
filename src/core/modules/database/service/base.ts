import { RepositoryFactory } from '../factory';

/**
 * Define service base for all system and auto inject repository inside
 *
 * @export
 * @class ServiceBase
 */

export abstract class ServiceBase {
  constructor(protected readonly repositoryFactory: RepositoryFactory) {}
}
