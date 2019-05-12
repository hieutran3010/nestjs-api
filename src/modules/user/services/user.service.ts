import { Injectable } from '@nestjs/common';
import { ObjectId } from 'bson';
import { equals, head, isNil } from 'ramda';
import { AppConfigService } from '../../../app.config';
import {
  LingualBadGatewayException,
  LingualBadRequestException,
  LingualUnauthorizedException } from '../../../core/exception/lingual-exceptions';
import { RepositoryBase, RepositoryFactory } from '../../../core/modules/database/factory';
import { ServiceBase } from '../../../core/modules/database/service';
import { LoggingService } from '../../../core/modules/logging';
import { MailerService } from '../../../core/modules/mailer/services';
import { Guid, Hash, isNullOrEmptyOrUndefined } from '../../../core/utils';
import { DefaultGroup, DefaultRootUserName, DOCUMENT_NAME } from '../../../documents/const';
import { PermissionFields, PermissionInterface, PermissionSchema } from '../../../documents/permission';
import { controllerFields } from '../../../documents/permission-controller';
import { PermissionDetailFields } from '../../../documents/permission-detail';
import { User, UserDto, userFields, UserSchema } from '../../../documents/user';
import {
  UserGroup,
  UserGroupFields,
  UserGroupSchema,
} from '../../../documents/user-group';
import { MESSAGE_CODE } from '../../../multilingual/message-codes';
import { RequestContext } from '../../auth/context/request-context';
import { USER_MESSAGE_CODE } from '../const';

@Injectable()
export class UserService extends ServiceBase {
  logger: any;
  private userRepository: RepositoryBase<User>;
  private permissionSchemeRepository: RepositoryBase<PermissionInterface>;
  private userGroupRepository: RepositoryBase<UserGroup>;
  private metadata: string[] = [userFields.ID, userFields.AVATAR, userFields.EMAIL,
    userFields.FAILED_LOGIN_COUNT, userFields.FULLNAME, userFields.IS_ACTIVE,
  userFields.LAST_TIME_FAILED_LOGIN, userFields.LAST_TIME_LOGIN, userFields.SUCCESS_LOGIN_COUNT, userFields.USER_GROUP, userFields.BRANCH,
  userFields.LOGIN_ATTEMPTS, userFields.PREVIOUS_TIME_LOGIN, userFields.USER_NAME];

  constructor(
    loggingService: LoggingService,
    repositoryFactory: RepositoryFactory,
    private readonly emailService: MailerService,
    private configService: AppConfigService) {
    super(repositoryFactory);
    this.resolveServices();
    this.logger = loggingService.createLogger('UserService');
  }

  async resolveServices() {
    this.userRepository = await this.repositoryFactory.getRepository<User>(DOCUMENT_NAME.User, UserSchema);
    this.userGroupRepository = await this.repositoryFactory.getRepository<UserGroup>(DOCUMENT_NAME.UserGroup, UserGroupSchema);
    this.permissionSchemeRepository = await this.repositoryFactory.getRepository<PermissionInterface>(DOCUMENT_NAME.Permission, PermissionSchema);
  }

  async getUserByUsername(usernameValue: string): Promise<UserDto> {
    const searchCondition = {};
    searchCondition[userFields.USER_NAME] = usernameValue;

    return await this.userRepository.findOne(searchCondition);
  }

  async getUserByEmail(emailValue: string): Promise<UserDto> {
    const searchCondition = {};
    searchCondition[userFields.EMAIL] = emailValue;
    return await this.userRepository.findOne(searchCondition);
  }

  async getUsersByGroupName(groupName: string, searchKey: string, pageSize?: number, pageNumber?: number) {
    const searchCondition = { [UserGroupFields.NAME]: { $regex: groupName } };
    const group = await this.userGroupRepository.findOne(searchCondition, [UserGroupFields.ID]);
    if (!isNullOrEmptyOrUndefined(group)) {
      const groupId = group[UserGroupFields.ID];
      const userSearchCondition = this.buildSearchQuery(searchKey, groupId);
      return await this.findByCondition(userSearchCondition, pageNumber, pageSize);
    }
  }

  async countUserByGroupName(groupName: string, searchKey: string) {
    const searchCondition = { [UserGroupFields.NAME]: { $regex: groupName } };
    const group = await this.userGroupRepository.findOne(searchCondition, [UserGroupFields.ID]);
    if (!isNullOrEmptyOrUndefined(group)) {
      const groupId = group[UserGroupFields.ID];
      const userSearchCondition = this.buildSearchQuery(searchKey, groupId);
      return await this.userRepository.countByCondition(userSearchCondition);
    }
  }

  async findAll() {
    return this.userRepository.findAll();
  }

  async find(pageNumber: number, pageSize: number, searchKey?: string): Promise<any[]> {
    const query = this.buildSearchQuery(searchKey);
    return await this.findByCondition(query, pageNumber, pageSize);
  }

  async findByCondition(query: any, pageNumber: number, pageSize: number) {

    const populateQuery = { path: userFields.USER_GROUP, select: UserGroupFields.NAME };
    const sort = {
      [userFields.FULLNAME]: 1
    };

    return await this.userRepository.findAndPopulate(query, populateQuery, this.metadata, pageNumber, pageSize, sort);
  }

  async count(searchKey: string): Promise<number> {
    const query = this.buildSearchQuery(searchKey);
    return await this.userRepository.countByCondition(query);
  }

  async findById(userId: string): Promise<UserDto> {
    const populateQuery = { path: userFields.USER_GROUP, select: UserGroupFields.NAME };
    return await this.userRepository.findById(userId, [], populateQuery);
  }

  async create(userDto: UserDto, isAddDefaultUserGroup?: boolean): Promise<User> {
    // Auto generate password in case it empty
    if (isNil(userDto.password)) {
      userDto.password = Guid.shortGuid(8);
    }

    // Hash password
    userDto.passwordHash = await Hash.getHash(userDto.password);

    // Validate user information
    await this.validateDuplicateUser(userDto);

    // Add user to cms-users-group
    if (isAddDefaultUserGroup) {
      userDto.userGroup = await this.getUserGroupIdByName(
        DefaultGroup.USERS_GROUP,
      );
    }

    // Add user to database
    const user = await this.userRepository.create(userDto);

    // Email notification to user
    await this.sendNotificationEmail(`${this.configService.env.brandName} account created`, 'create-user', userDto);

    return user;
  }

  async update(userDto: UserDto) {
    // Check root user
    await this.validateRootAccountAndExistAccount(userDto._id);

    // Validate user information
    await this.validateDuplicateUser(userDto);

    const updatedUser = {};
    updatedUser[userFields.USER_NAME] = userDto.username;
    updatedUser[userFields.FULLNAME] = userDto.fullname;
    updatedUser[userFields.EMAIL] = userDto.email;
    updatedUser[userFields.AVATAR] = userDto.avatar;
    updatedUser[userFields.LOGIN_ATTEMPTS] = userDto.loginAttempts;
    updatedUser[userFields.BRANCH] = userDto.branch;
    updatedUser[userFields.IS_ACTIVE] = userDto.isActive;
    // Update user in database
    const newUser = await this.userRepository.update(userDto._id, updatedUser, { upsert: false, new: true });
    await this.sendNotificationEmail(`${this.configService.env.brandName} account updated`, 'edit-user', userDto);
    return newUser;
  }

  async changeUserGroup(userId: string, ugId: string) {
    await this.validateRootAccountAndExistAccount(userId);

    const ug = await this.getUserGroupById(ugId);
    if (!isNullOrEmptyOrUndefined(ug)) {
      const updateObject = {
        [userFields.USER_GROUP]: ug
      };
      await this.userRepository.update(userId, updateObject);
    }
  }

  async delete(userId: string): Promise<void> {
    // Check root user
    await this.validateRootAccountAndExistAccount(userId, true);

    return await this.userRepository.delete(userId);
  }

  async updateRefeshToken(id: any, newRefreshToken: string) {
    // Update user in database
    const updateInfo = {};
    updateInfo[userFields.REFRESH_TOKEN] = newRefreshToken;
    return await this.userRepository.update(id, updateInfo);
  }

  async validateRootAccountAndExistAccount(userId: string, isDeleteBehavior = false) {
    const user = this.userRepository.findById(userId);
    if (isNullOrEmptyOrUndefined(user)) {
      throw new LingualBadRequestException(USER_MESSAGE_CODE.InvalidUserId);
    }

    if (equals(user[userFields.USER_NAME], DefaultRootUserName)) {
      if (isDeleteBehavior) {
        throw new LingualBadRequestException(USER_MESSAGE_CODE.NotAllowedDeleteRootUser);
      } else {
        throw new LingualBadRequestException(USER_MESSAGE_CODE.NotAllowedEditRootUser);
      }
    }
  }

  async validateDuplicateUser(userDto: UserDto) {
    let userInDatabase: ObjectId;
    if (userDto._id) {
      userInDatabase = new ObjectId(userDto._id);
    }
    // Is taken username
    const userByUsername = await this.getUserByUsername(userDto.username);
    if (userByUsername !== null && !isNullOrEmptyOrUndefined(userByUsername)) {
      if (!userInDatabase || !userInDatabase.equals(userByUsername._id)) {
        throw new LingualBadRequestException(USER_MESSAGE_CODE.UniqueUsername);
      }
    }

    // Is taken email
    const userByEmail = await this.getUserByEmail(userDto.email);
    if (userByEmail !== null && !isNullOrEmptyOrUndefined(userByEmail)) {
      if (!userInDatabase || !userInDatabase.equals(userByEmail._id)) {
        throw new LingualBadRequestException(USER_MESSAGE_CODE.UniqueEmail);
      }
    }
  }

  async onLoginSuccess(userDto: UserDto) {
    const updateInfo = {};
    updateInfo[userFields.LOGIN_ATTEMPTS] = 0;
    updateInfo[userFields.PREVIOUS_TIME_LOGIN] = userDto.lastTimeLogin;
    updateInfo[userFields.LAST_TIME_LOGIN] = Date.now();
    updateInfo[userFields.SUCCESS_LOGIN_COUNT] = !isNil(
      userDto.successLoginCount,
    )
      ? userDto.successLoginCount + 1
      : 1;

    // Update user in database
    return await this.userRepository.update(userDto._id, updateInfo);
  }

  async onLoginFailed(userDto: UserDto) {
    const updateInfo = {};
    updateInfo[userFields.LOGIN_ATTEMPTS] = !isNil(userDto.loginAttempts)
      ? userDto.loginAttempts + 1
      : 0;
    updateInfo[userFields.LAST_TIME_FAILED_LOGIN] = Date.now();
    updateInfo[userFields.FAILED_LOGIN_COUNT] = !isNil(userDto.failedLoginCount)
      ? userDto.failedLoginCount + 1
      : 1;
    updateInfo[userFields.REFRESH_TOKEN] = ''; // Clear refesh token

    // Update user in database
    return await this.userRepository.update(userDto._id, updateInfo);
  }

  async getUserGroupIdByName(userGroupName: string) {
    return await this.userGroupRepository.findOne({ [UserGroupFields.NAME]: userGroupName }, ['_id']);
  }

  async getUserGroupById(ugId: string) {
    return await this.userGroupRepository.findById(ugId, ['_id']);
  }

  private async sendNotificationEmail(subjectName: string, templateName: string, userDto: UserDto) {
    const email = {
      to: userDto.email,
      subject: subjectName,
      template: this.emailService.buildLingualFileName(templateName),
      context: {
        username: userDto.username,
        cmslink: this.configService.adminConfig.cmsGuiUrl,
        email: userDto.email,
        password: userDto.password,
        brandName: this.configService.env.brandName
      },
    };

    this.emailService.sendMail(email);

    this.logger.debug(
      `Send email to user ${userDto.email} done`,
    );
  }

  async getUserByResetToken(token: string): Promise<UserDto> {
    const searchCondition = {};
    searchCondition[userFields.RESET_PASSWORD_TOKEN] = token;
    searchCondition[userFields.RESET_PASSWORD_EXPIRES] > Date.now();
    return await this.userRepository.findOne(searchCondition);
  }

  async changePassword(oldpassword: string, newPassword: string) {
    const userName = RequestContext.currentRequestContext().username;
    const user = await this.getUserByUsername(userName);
    const hashNewPassword = await Hash.getHash(newPassword);

    // if user does not exist, throw exception
    if (!user) {
      throw new LingualUnauthorizedException(MESSAGE_CODE.ForbiddenResource);
    }

    // if the password is not correct, throw ex.
    if (! await Hash.compareHash(
      oldpassword,
      user.passwordHash)) {
      throw new LingualBadRequestException(USER_MESSAGE_CODE.OldPasswordIncorrect);
    }

    // if the newPassword is equal password, throw ex
    if (await Hash.compareHash(
      newPassword,
      user.passwordHash)) {
      throw new LingualBadGatewayException(USER_MESSAGE_CODE.InvalidNewPassword);
    }

    const id = user._id.toString();
    await this.userRepository.update(id, {
      passwordHash: hashNewPassword,
    });
  }

  async updatePassword(
    id: any,
    password: string,
  ): Promise<void> {
    return await this.userRepository.update(id, {
      passwordHash: await Hash.getHash(password),
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
  }

  async updateResetToken(id: any, resetToken: string) {
    return await this.userRepository.update(id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: Date.now() + 1800000, // 30 mins
    });
  }

  private buildSearchQuery(searchKey: string, groupId?: string) {

    // Build search query with search key
    const defaultQuery = {
      [userFields.USER_NAME]: { $ne: DefaultRootUserName }
    };

    if (!isNullOrEmptyOrUndefined(groupId)) {
      Object.assign(defaultQuery, { [userFields.USER_GROUP]: groupId });
    }

    let searchKeyConditions = {};
    if (!isNullOrEmptyOrUndefined(searchKey)) {

      searchKeyConditions = {
        $and: [
          defaultQuery,
          {
            $or: [
              { [userFields.USER_NAME]: { $regex: searchKey } },
              { [userFields.EMAIL]: { $regex: searchKey } },
              { [userFields.FULLNAME]: { $regex: searchKey } }
            ]
          }]
      };
    } else {
      Object.assign(searchKeyConditions, defaultQuery);
    }

    return searchKeyConditions;
  }

  async getPermissionSchemeByUser(user: UserDto) {
    const userGroup = await this.userGroupRepository.findById(user.userGroup, [UserGroupFields.PERMISSION_SCHEME]);

    const populateQuery = {
      path: `${PermissionFields.PERMISSION_DETAIL}.${PermissionDetailFields.CONTROLLER}`,
      model: DOCUMENT_NAME.Controller,
      select: [controllerFields.KEY, controllerFields.NAME]
    };
    const schemes = await this.permissionSchemeRepository.findAndPopulate(userGroup.permissionScheme, populateQuery,
      [PermissionFields.NAME, PermissionFields.PERMISSION_DETAIL], -1);
    return head(schemes);
  }
}
