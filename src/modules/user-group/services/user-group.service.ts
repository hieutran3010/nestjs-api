import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { contains, equals, forEach, hasIn } from 'ramda';
import { LingualBadRequestException } from '../../../core/exception/lingual-exceptions';
import { RepositoryBase, RepositoryFactory } from '../../../core/modules/database/factory';
import { ServiceBase } from '../../../core/modules/database/service';
import { LoggingService } from '../../../core/modules/logging';
import { isNullOrEmptyOrUndefined } from '../../../core/utils';
import {
  DefaultGroup,
  DefaultPermissionScheme,
  DefaultRootUserName,
  DOCUMENT_NAME,
} from '../../../documents/const';
import {
  PermissionFields,
  PermissionInterface,
  PermissionSchema,
} from '../../../documents/permission';
import { User, userFields, UserSchema } from '../../../documents/user';
import {
  UserGroup,
  UserGroupDto,
  UserGroupFields,
  UserGroupSchema,
} from '../../../documents/user-group';
import { USER_GROUP_MESSAGE_CODE } from '../const';

@Injectable()
export class UserGroupService extends ServiceBase {
  logger: any;
  private repository: RepositoryBase<UserGroup>;
  private permissionSchemeRepository: RepositoryBase<PermissionInterface>;
  private userRepository: RepositoryBase<User>;

  constructor(
    repositoryFactory: RepositoryFactory,
    loggingService: LoggingService,
  ) {
    super(repositoryFactory);
    this.repository = repositoryFactory.getRepository(
      DOCUMENT_NAME.UserGroup,
      UserGroupSchema,
    );
    this.permissionSchemeRepository = repositoryFactory.getRepository(
      DOCUMENT_NAME.Permission,
      PermissionSchema,
    );
    this.userRepository = repositoryFactory.getRepository(
      DOCUMENT_NAME.User,
      UserSchema,
    );
    this.logger = loggingService.createLogger('UserGroupService');
  }

  async create(userGroup: UserGroupDto) {
    await this.checkDuplidatedUserGroupName(userGroup);

    // Retrieve the default permission scheme for a new user group
    const scheme = await this.getPermissionScheme(DefaultPermissionScheme.USER);
    if (scheme && scheme._id) {
      userGroup.permissionScheme = scheme._id;
    }
    return await this.repository.create(userGroup);
  }

  async delete(_id: string) {
    const ret = await this.repository.findById(_id);

    if (ret) {
      if (contains(ret[UserGroupFields.NAME], [DefaultGroup.ADMIN_GROUP, DefaultGroup.USERS_GROUP])) {
        throw new LingualBadRequestException(
          USER_GROUP_MESSAGE_CODE.NotAllowDeleteGroupName,
          [ret.name],
        );
      }

      // Allow to delete user group
      const userGroupId = await this.repository.findOne(
        {
          [UserGroupFields.NAME]: DefaultGroup.USERS_GROUP
        },
        [UserGroupFields.ID]
      );

      // If users group id is found, update
      if (userGroupId) {
        const users = await this.userRepository.find({
          [userFields.USER_GROUP]: _id
        }, [userFields.ID]);
        const action = async x => await this.userRepository.update(x, { [userFields.USER_GROUP]: userGroupId });
        // Loop to update the user group which user is belonged to.
        forEach(action, users);
      }
    }

    return await this.repository.delete(_id);
  }

  async update(_id: string, userGroup: UserGroupDto): Promise<void> {

    const found = await this.validateExistUserGroup(_id);

    const updatedUserGroup = {};

    // Model contains name, throw exception if name is empty/null
    await this.checkDuplidatedUserGroupName(userGroup);

    if (contains(found[UserGroupFields.NAME], [DefaultGroup.ADMIN_GROUP, DefaultGroup.USERS_GROUP])) {
      throw new LingualBadRequestException(
        USER_GROUP_MESSAGE_CODE.NotAllowEditGroupName,
        [userGroup.name],
      );
    }

    updatedUserGroup[UserGroupFields.NAME] = userGroup.name;
    updatedUserGroup[UserGroupFields.DESC] = userGroup.description;
    return await this.repository.update(_id, updatedUserGroup);
  }

  async findById(_id: string): Promise<UserGroupDto> {
    return await this.repository.findById(_id);
  }

  async find(pageNumber: number, pageSize: number, searchKey?: string): Promise<any[]> {

    const query = {};
    if (!isNullOrEmptyOrUndefined(searchKey)) {
      query[UserGroupFields.NAME] = { $regex: searchKey };
    }

    const populateQuery = { path: UserGroupFields.PERMISSION_SCHEME, select: PermissionFields.NAME };
    const sort = {
      [UserGroupFields.NAME]: 1
    };
    const userGroups = await this.repository.findAndPopulate(query, populateQuery, [], pageNumber, pageSize, sort);

    if (!isNullOrEmptyOrUndefined(userGroups)) {
      // count the number in group
      for (const ug of userGroups) {
        const ugId = ug[UserGroupFields.ID];
        const countCondition = {
          $and: [
            {
              [userFields.USER_GROUP]: ugId
            },
            {
              [userFields.USER_NAME]: {$ne: DefaultRootUserName}
            }
          ]
        };
        const count = await this.userRepository.countByCondition(countCondition);
        Object.assign(ug, { userCount: count });
      }
    }

    return userGroups;
  }

  async count(searchKey: string): Promise<number> {
    const query = {};
    if (!isNullOrEmptyOrUndefined(searchKey)) {
      query[UserGroupFields.NAME] = { $regex: searchKey };
    }

    return await this.repository.countByCondition(query);
  }

  async getUserGroupByName(name: string): Promise<UserGroupDto> {
    const searchCondition = {};
    searchCondition[UserGroupFields.NAME] = name;
    return await this.repository.findOne(searchCondition);
  }

  async checkDuplidatedUserGroupName(userGroup: UserGroupDto) {
    let id: ObjectId;
    if (userGroup._id) {
      id = new ObjectId(userGroup._id);
    }

    if (hasIn(UserGroupFields.NAME, userGroup)) {
      if (!userGroup[UserGroupFields.NAME]) {
        this.logger.error(
          `${userGroup.name} is not provided`,
        );
        throw new LingualBadRequestException(
          USER_GROUP_MESSAGE_CODE.RequiredGroupName,
        );
      }
    }

    // Group name is taken
    const found = await this.getUserGroupByName(userGroup.name);
    // If found and ids are not equal => duplicated
    if (found && !isNullOrEmptyOrUndefined(found)) {
      // input user group has no _id => duplidated
      if (!id || !equals(id, found._id)) {
        this.logger.error(`${userGroup.name} is duplicated`);
        throw new LingualBadRequestException(
          USER_GROUP_MESSAGE_CODE.UniqueGroupName,
          [userGroup.name],
        );
      }
    }
  }

  async getPermissionScheme(name: string) {
    return await this.permissionSchemeRepository.findOne({
      [PermissionFields.NAME]: name,
    });
  }

  async updateSchemeForUserGroup(id: string, schemeId: string) {
    const usergroup = await this.validateExistUserGroup(id);
    if (usergroup) {
      const updateQuery = {
        [UserGroupFields.PERMISSION_SCHEME]: schemeId
      };
      await this.repository.update(id, updateQuery);
    }
  }

  getUserListExceptInGroupQuery(ugId: string, searchKey?: string): any {
    let query = {};

    const exceptUgFilter = {
      [userFields.USER_GROUP]: { $ne: ugId }
    };

    const exceptUserFilter = {
      [userFields.USER_NAME]: { $ne: DefaultRootUserName }
    };

    if (!isNullOrEmptyOrUndefined(searchKey)) {
      query = {
        $and: [
          exceptUgFilter, exceptUserFilter,
          {
            $or: [
              {
                [userFields.USER_NAME]: { $regex: searchKey }
              },
              {
                [userFields.FULLNAME]: { $regex: searchKey }
              },
              {
                [userFields.EMAIL]: { $regex: searchKey }
              },
            ]
          },
        ]
      };
    } else {
      query = {
        $and: [exceptUgFilter, exceptUserFilter]
      };
    }

    return query;
  }

  async getUserListExceptInGroup(ugId: string, searchKey?: string, pageSize?: number, pageNumber?: number) {

    await this.validateExistUserGroup(ugId);

    const query = this.getUserListExceptInGroupQuery(ugId, searchKey);

    const select = [userFields.USER_NAME, userFields.FULLNAME, userFields.EMAIL];
    const populate = { path: userFields.USER_GROUP, select: UserGroupFields.NAME };
    const sort = { [userFields.USER_NAME]: 1 };

    return await this.userRepository.findAndPopulate(query, populate, select, pageNumber, pageSize, sort);
  }

  async countUserListExceptInGroup(ugId: string, searchKey?: string) {
    const query = this.getUserListExceptInGroupQuery(ugId, searchKey);
    return await this.userRepository.countByCondition(query);
  }

  async updateMembersUserGroup(ugId: string, userIds: string[]) {
    if (isNullOrEmptyOrUndefined(userIds)) {
      return;
    }
    await this.validateExistUserGroup(ugId);
    const updateQuery = {
      [userFields.USER_GROUP]: ugId
    };

    await this.userRepository.bulkUpdate(userIds, updateQuery);
  }

  async validateExistUserGroup(ugId: string) {

    // Throw exception if calling to update without id
    if (!ugId) {
      this.logger.error(`User Group id ${ugId} is not specified`);
      throw new LingualBadRequestException(USER_GROUP_MESSAGE_CODE.UserGroupIDInvalid);
    }

    const existUg = await this.repository.findById(ugId);
    if (!existUg) {
      throw new LingualBadRequestException(
        USER_GROUP_MESSAGE_CODE.NotFoundUserGroup,
      );
    }

    return existUg;
  }
}
