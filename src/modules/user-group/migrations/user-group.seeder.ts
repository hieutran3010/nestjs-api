import { Injectable } from '@nestjs/common';
import { IDatabaseSeeder } from '../../../core/modules/database-seeder/contract';
import { RepositoryBase } from '../../../core/modules/database/factory/repository.base';
import { RepositoryFactory } from '../../../core/modules/database/factory/repository.factory';
import {
  DefaultGroup,
  DefaultPermissionScheme,
  DOCUMENT_NAME,
} from '../../../documents/const';
import { UserGroup, UserGroupDto, UserGroupSchema } from '../../../documents/user-group.document';
import { UserGroupService } from '../services/user-group.service';

@Injectable()
export class UserGroupSeeder implements IDatabaseSeeder {

  private repository: RepositoryBase<UserGroup>;

  getName(): string {
    return DOCUMENT_NAME.UserGroup;
  }

  constructor(
    private userGroupService: UserGroupService,
    private repositoryFactory: RepositoryFactory
  ) {
    this.repository = this.repositoryFactory.getRepository(DOCUMENT_NAME.UserGroup, UserGroupSchema);
  }

  async seed() {
    this.createDefaultUserGroup();
  }

  async createDefaultUserGroup() {
    const defaultAdministratorGroup = new UserGroupDto();
    defaultAdministratorGroup.name = DefaultGroup.ADMIN_GROUP;
    defaultAdministratorGroup.description =
      'This group is created default for admin users and has full control in system.';
    const schemeAdmin = await this.userGroupService.getPermissionScheme(
      DefaultPermissionScheme.ADMINISTRATOR,
    );
    if (schemeAdmin && schemeAdmin._id) {
      defaultAdministratorGroup.permissionScheme = schemeAdmin._id;
    }

    await this.saveToDB(defaultAdministratorGroup);

    const defaultUserGroup = new UserGroupDto();
    defaultUserGroup.name = DefaultGroup.USERS_GROUP;
    defaultUserGroup.description =
      'This group is created default for normal users and has the lowest control in system.';
    const schemeUser = await this.userGroupService.getPermissionScheme(
      DefaultPermissionScheme.USER,
    );
    if (schemeUser && schemeUser._id) {
      defaultUserGroup.permissionScheme = schemeUser._id;
    }

    await this.saveToDB(defaultUserGroup);
  }

  async saveToDB(usergroupDTO: UserGroupDto) {
    const ret = await this.userGroupService.checkDuplidatedUserGroupName(usergroupDTO);
    if (!ret) {
      await this.repository.create(usergroupDTO);
    }
  }
}
