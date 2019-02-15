import { InternalServerErrorException } from '@nestjs/common';
import { map } from 'lodash';
import { Connection, Model } from 'mongoose';
import { countSkipItem, IdentityHelper, isNullOrEmptyOrUndefined } from '../../../utils';
import { DTOBase, dtoBaseFields, InterfaceBase, SchemaBase } from '../contract/base.document';

/**
 * Define db service base
 *
 * @export
 * @class RepositoryBase
 * @template T
 */
export class RepositoryBase<T extends InterfaceBase> {
  /**
   * interface model
   * @private
   * @type {Model<T>}
   * @memberof ServiceBase
   */
  public model: Model<T>;

  /**
   * Creates an instance of ServiceBase.
   * @param {Connection} connection
   * @param {SchemaBase} schema
   * @param {string} collectionName
   * @memberof ServiceBase
   */
  constructor(connection: Connection, schema: SchemaBase, collectionName: string) {
    if (!(schema instanceof SchemaBase)) {
      throw new InternalServerErrorException(
        'The schema must be extends from SchemaBase',
        'The schema must be extends from SchemaBase',
      );
    }

    this.model = connection.model(collectionName, schema) as Model<T>;
  }

  /**
   * Insert new entitfy to database
   * @param {*} createCatDto
   * @returns {Promise<T>}
   * @memberof ServiceBase
   */
  async create(dtoObject: DTOBase): Promise<T> {
    dtoObject.create_on = new Date();
    dtoObject.create_by = IdentityHelper.getUsername();
    dtoObject.updated_by = null;
    dtoObject.updated_on = null;

    const createdObject = new this.model(dtoObject);
    return createdObject.save();
  }

  async update(id: string, updateQuery: any, options?: { upsert: boolean; new: boolean }): Promise<any> {
    // TODO: will update edit_by, branch_id
    Object.assign(updateQuery, {
      [dtoBaseFields.UPDATED_ON]: new Date(),
      [dtoBaseFields.UPDATED_BY]: IdentityHelper.getUsername(),
    });
    return this.model.findByIdAndUpdate(id, updateQuery, options).exec();
  }

  async updateByCondition(
    updateCondition: any,
    updateQuery: any,
    options?: { upsert: boolean; new: boolean },
  ): Promise<any> {
    // TODO: will update edit_by, branch_id
    Object.assign(updateQuery, {
      [dtoBaseFields.UPDATED_ON]: new Date(),
      [dtoBaseFields.UPDATED_BY]: IdentityHelper.getUsername(),
    });
    return this.model.updateMany(updateCondition, updateQuery, options).exec();
  }

  /**
   * Delete entity using id
   * @param {string} id
   * @returns {Promise<void>}
   * @memberof RepositoryBase
   */
  async delete(id: string): Promise<any> {
    return this.model.findByIdAndRemove(id);
  }

  async bulkCreate(dtoObjectList: DTOBase[]): Promise<T[]> {
    dtoObjectList = map(dtoObjectList, dto => {
      dto.create_by = IdentityHelper.getUsername();
      dto.create_on = new Date();
      return dto;
    });

    return this.model.create(dtoObjectList);
  }

  async bulkUpdate(ids: string[], updateQuery: any): Promise<any> {
    Object.assign(updateQuery, {
      [dtoBaseFields.UPDATED_ON]: new Date(),
      [dtoBaseFields.UPDATED_BY]: IdentityHelper.getUsername(),
    });

    const condition = {
      [dtoBaseFields.ID]: {
        $in: ids,
      },
    };

    return this.model.updateMany(condition, updateQuery);
  }

  async bulkDelete(ids: string[]): Promise<any> {
    const condition = {
      [dtoBaseFields.ID]: {
        $in: ids,
      },
    };
    return this.model.deleteMany(condition);
  }

  /**
   * Get All record in database
   * @returns {Promise<T[]>}
   * @memberof ServiceBase
   */
  async findAll(fields: string[] = [], sort: any = {}): Promise<any[]> {
    // TODO: should auto find by branch_id of user

    return this.model
      .find()
      .sort(sort)
      .select(fields)
      .lean()
      .exec();
  }

  /**
   * Get One record by ID
   * @param {string} id
   * @returns {Promise<T>}
   * @memberof RepositoryBase
   */
  async findById(id: any, fields: string[] = [], populate: any = ''): Promise<any> {
    // TODO: should auto find by branch_id of user
    return this.model
      .findById(id)
      .select(fields)
      .populate(populate)
      .lean()
      .exec();
  }

  async findOne(query: any, fields: string[] = [], populate: any = ''): Promise<any> {
    // TODO: should auto find by branch_id of user
    return this.model
      .findOne(query)
      .select(fields)
      .populate(populate)
      .lean()
      .exec();
  }

  /**
   * Get data using condition
   * @param {*} searchCondition
   * @param {number} pageNumber
   * @param {number} pageSize
   * @returns
   * @memberof RepositoryBase
   */
  async find(
    searchCondition: any,
    fields: string[] = [],
    pageNumber?: number,
    pageSize?: number,
    sort: any = {},
  ): Promise<any[]> {
    // TODO: should auto find by branch_id of user
    if (pageNumber === -1 || pageSize === -1) {
      return this.model
        .find(searchCondition)
        .sort(sort)
        .select(fields)
        .lean()
        .exec();
    }

    const skipItem = (+pageNumber - 1) * +pageSize;
    return this.model
      .find(searchCondition)
      .sort(sort)
      .select(fields)
      .skip(skipItem)
      .limit(+pageSize)
      .lean()
      .exec();
  }

  async findAndPopulate(
    searchCondition: any,
    populateQuery: any,
    fields: string[] = [],
    pageNumber?: number,
    pageSize?: number,
    sort: any = {},
  ): Promise<any> {
    // TODO: should auto find by branch_id of user
    if (pageNumber === -1 || pageSize === -1) {
      return this.model
        .find(searchCondition)
        .sort(sort)
        .select(fields)
        .populate(populateQuery)
        .lean()
        .exec();
    }
    const skipItem = (+pageNumber - 1) * +pageSize;
    return this.model
      .find(searchCondition)
      .sort(sort)
      .select(fields)
      .populate(populateQuery)
      .skip(skipItem)
      .limit(+pageSize)
      .lean()
      .exec();
  }

  async count(): Promise<number> {
    // TODO: should auto find by branch_id of user
    return this.model.length;
  }

  async countByCondition(condition: any): Promise<number> {
    // TODO: should auto find by branch_id of user
    return this.model.count(condition);
  }

  async aggregate(aggregations: any[], pageSize ?: number, pageNumber ?: number) {
    if (pageSize && pageNumber) {
      const skipItem = countSkipItem(pageNumber, pageSize);

      const pagingQuery = [{
          $skip: skipItem
        },
        {
          $limit: +pageSize
        }
      ];

      aggregations.push(...pagingQuery);
    }

    return this.model.aggregate(aggregations).exec();
  }

  async findWithAggregate(
    projection: any,
    searchCondition: any,
    pageNumber?: number,
    pageSize?: number,
    fields: string[] = [],
    aggregations: any[] = null,
  ) {
    const stages = [];
    if (!isNullOrEmptyOrUndefined(aggregations)) {
      stages.push(...aggregations);
    }
    const project = this.buildPipeline(projection, fields);
    if (!isNullOrEmptyOrUndefined(project)) {
      stages.push({ $project: project });
    }
    if (!isNullOrEmptyOrUndefined(searchCondition)) {
      stages.push({ $match: searchCondition });
    }
    if (
      !isNaN(pageNumber) && !isNaN(pageSize) &&
      !isNullOrEmptyOrUndefined(pageNumber) &&
      !isNullOrEmptyOrUndefined(pageSize) &&
      pageNumber !== -1 &&
      pageSize !== -1
    ) {
      const skipItem = (+pageNumber - 1) * +pageSize;
      stages.push({ $skip: skipItem });
      stages.push({ $limit: +pageSize });
    }
    return this.model.aggregate(stages).exec();
  }

  async countWithAggregate(
    searchCondition: any,
    aggregations: any[] = null,
    fieldCountName: string
  ) {
    const stages = [];
    if (!isNullOrEmptyOrUndefined(aggregations)) {
      stages.push(...aggregations);
    }

    if (!isNullOrEmptyOrUndefined(searchCondition)) {
      stages.push({ $match: searchCondition });
    }

    return this.model.aggregate(stages).count(fieldCountName).exec();
  }

  /// Build aggregate pipe line
  private buildPipeline(aggregate: any, fields: string[] = []) {
    const pipeline = {};
    fields.forEach(property => {
      Object.assign(pipeline, { [`${property}`]: `$${property}` });
    });
    if (!isNullOrEmptyOrUndefined(aggregate)) {
      Object.assign(pipeline, aggregate);
    }
    return pipeline;
  }

  async patchEmbeddedArrayById(objectId: any, path: string, element: any, options?: { upsert: boolean; new: boolean }) {
    const updateQuery = { $push: { [path]: element } };
    Object.assign(updateQuery, {
      [dtoBaseFields.UPDATED_ON]: new Date(),
      [dtoBaseFields.UPDATED_BY]: IdentityHelper.getUsername(),
    });
    await this.model.findByIdAndUpdate(objectId, updateQuery, options);
  }

  async overwriteEmbeddedArrayById(
    objectId: any,
    path: string,
    element: any,
    options?: { upsert: boolean; new: boolean },
  ) {
    const updateQuery = { $set: { [path]: element } };
    Object.assign(updateQuery, {
      [dtoBaseFields.UPDATED_ON]: new Date(),
      [dtoBaseFields.UPDATED_BY]: IdentityHelper.getUsername(),
    });
    await this.model.findByIdAndUpdate(objectId, updateQuery, options);
  }

  async patchEmbeddedArrayByCondition(
    searchCondition: any,
    path: string,
    element: any,
    options?: { upsert: boolean; new: boolean },
  ) {
    const updateQuery = { $push: { [path]: element } };
    await this.updateByCondition(searchCondition, updateQuery, options);
  }
}
