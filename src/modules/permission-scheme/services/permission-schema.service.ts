import { Injectable } from '@nestjs/common';
import { contains, isNil, map } from 'ramda';
import { LingualBadRequestException } from '../../../core/exception/lingual-exceptions';
import { RepositoryBase } from '../../../core/modules/database/factory/repository.base';
import { RepositoryFactory } from '../../../core/modules/database/factory/repository.factory';
import { ServiceBase } from '../../../core/modules/database/service/service.base';
import { isNullOrEmptyOrUndefined, stringToArray } from '../../../core/utils';
import { DefaultPermissionScheme, DOCUMENT_NAME } from '../../../documents/const';
import { Controller, ControllerDto, controllerFields, ControllerSchema, schemeName } from '../../../documents/permission-controller.document';
import { PermissionDetailFields } from '../../../documents/permission-detail.document';
import { PermissionDTO,
    PermissionFields,
    PermissionInterface,
    PermissionSchema,
    PermissionSchemesFields } from '../../../documents/permission.document';
import { UserGroup, UserGroupFields, UserGroupSchema } from '../../../documents/user-group.document';
import { MESSAGE_CODE } from '../../message-pack/languages/message-codes';
import { MessageCode } from '../constant';
import { LoggingService } from './../../../core/modules/logging/logging.service';

@Injectable()
export class PermissionSchemaService extends ServiceBase {

    repository: RepositoryBase<PermissionInterface>;
    userGroupRepository: RepositoryBase<UserGroup>;
    controllerRepository: RepositoryBase<Controller>;

    constructor(repositoryFactory: RepositoryFactory, private loggingService: LoggingService) {
        super(repositoryFactory);
        this.controllerRepository = repositoryFactory.getRepository<Controller>(DOCUMENT_NAME.Controller, ControllerSchema);
        this.repository = repositoryFactory.getRepository<PermissionInterface>(DOCUMENT_NAME.Permission, PermissionSchema);
        this.userGroupRepository = repositoryFactory.getRepository<UserGroup>(DOCUMENT_NAME.UserGroup, UserGroupSchema);
    }

    async create(permissionModel: PermissionDTO) {
        await this.checkDuplicated(permissionModel);
        return await this.repository.create(permissionModel);
    }

    async bulkCreate(permisionList: PermissionDTO[]) {
        this.repository.bulkCreate(permisionList);
    }

    async getAllController(): Promise<ControllerDto[]> {
        return await this.controllerRepository.findAll();
    }

    async getAll(searchKey: string, pageSize?: number, pageNumber?: number, fields?: string): Promise<PermissionDTO[]> {
        const query = {};
        if (!isNullOrEmptyOrUndefined(searchKey)) {
            query[PermissionFields.NAME] = { $regex: searchKey };
        }
        const fieldArray = stringToArray(fields);
        const sort = {
            [PermissionFields.NAME]: 1
        };

        return await this.repository.find(query, fieldArray, pageNumber, pageSize, sort);
    }

    async getPermissionSchemes(searchKey: string, pageSize?: number, pageNumber?: number) {
        const permissionSchemes = await this.getAll(searchKey,
            pageSize,
            pageNumber,
            `${PermissionFields.NAME},${PermissionSchemesFields.USER_GROUP}`);
        for (const permissionScheme of permissionSchemes) {

            // Get user groups of scheme
            const condition = {};
            condition[UserGroupFields.PERMISSION_SCHEME] = permissionScheme._id;
            const sort = {
                [UserGroupFields.NAME]: 1
            };
            const userGroups = await this.userGroupRepository.find(condition, [UserGroupFields.NAME], -1, -1, sort);
            permissionScheme[PermissionSchemesFields.USER_GROUP] = userGroups;
        }

        return permissionSchemes;
    }

    async count(searchKey: string, pageSize?: number, pageNumber?: number): Promise<number> {
        const condition = {};
        if (!isNullOrEmptyOrUndefined(searchKey)) {
            condition[PermissionFields.NAME] = { $regex: searchKey };
        }
        return await this.repository.countByCondition(condition);
    }

    async clone(permissionScheme: any) {
        // Get copied scheme
        const copiedScheme = await this.repository.findById(permissionScheme._id);
        // Update scheme name
        copiedScheme[PermissionFields.NAME] = permissionScheme.name;
        // Create new scheme
        copiedScheme._id = undefined;
        return await this.create(copiedScheme);
    }

    async findById(id) {
        return this.repository.findById(id, [PermissionFields.NAME]);
    }

    async updateScheme(permissionModel: PermissionDTO) {
        const permission = await this.repository.findById(permissionModel._id);
        if (!isNil(permission)) {
            this.validateEditSCheme(permissionModel, permission);
            return await this.repository.update(permissionModel._id,
                {
                    [PermissionFields.NAME]: permissionModel.name,
                    [PermissionFields.PERMISSION_DETAIL]: permissionModel.permission_details
                });
        }

        throw new LingualBadRequestException(
            MessageCode.NOT_FOUND,
        );
    }

    async getControllersOfPermissionScheme(id: string) {
        const scheme = await this.validateExistPermissionScheme(id);
        // const permissionDetails = pick([PermissionFields.PERMISSION_DETAIL], scheme);
        const result = await Promise.all(map(async (pd) => {
            const controllerId = pd.controller;
            const controller = await this.controllerRepository.findById(controllerId, [controllerFields.NAME, controllerFields.KEY]);
            Object.assign(pd, { [PermissionDetailFields.CONTROLLER]: controller });
            return pd;
        }, scheme.permission_details));
        return result;
    }

    async updateSchemeForUserGroup(schemeId: string, userGroupIds: string[]) {
        if (isNullOrEmptyOrUndefined(userGroupIds)) {
            return;
        }
        const updateQuery = {
            [UserGroupFields.PERMISSION_SCHEME]: schemeId
        };

        await this.userGroupRepository.bulkUpdate(userGroupIds, updateQuery);
    }

    getAllUserGroups() {
        const populate = { path: UserGroupFields.PERMISSION_SCHEME, select: PermissionFields.NAME };
        return this.userGroupRepository.findAndPopulate({}, populate);
    }

    async validateExistPermissionScheme(id: string) {

        // Throw exception if calling to update without id
        if (!id) {
            this.loggingService.logger.error(`Scheme id ${id} is not specified`);
            throw new LingualBadRequestException(MessageCode.ID_INVALID);
        }

        const scheme = await this.repository.findById(id);
        if (!scheme) {
            throw new LingualBadRequestException(
                MessageCode.NOT_FOUND,
            );
        }

        return scheme;
    }

    private async checkDuplicated(permissionModel: PermissionDTO) {
        const permission = await this.repository.findOne({ name: permissionModel.name });
        if (!isNil(permission)) {
            const params = [];
            params.push(permissionModel.name);
            throw new LingualBadRequestException(MessageCode.schemeduplicated, params);
        }
    }

    async delete(id: string) {
        await this.validateExistPermissionScheme(id);
        // move all user groups of scheme to default user scheme
        const ugQuery = {
            [UserGroupFields.PERMISSION_SCHEME]: id
        };
        const userGroups = await this.userGroupRepository.find(ugQuery, [UserGroupFields.ID]);
        if (!isNullOrEmptyOrUndefined(userGroups)) {
            const defaultUserScheme = await this.repository.findOne({ [PermissionFields.NAME]: DefaultPermissionScheme.USER }, [PermissionFields.ID]);
            if (isNullOrEmptyOrUndefined(defaultUserScheme)) {
                throw new LingualBadRequestException(MESSAGE_CODE.BAD_DATA_USER_SCHEME);
            } else {
                const updateQuery = { [UserGroupFields.PERMISSION_SCHEME]: defaultUserScheme[PermissionFields.ID] };
                await this.userGroupRepository.bulkUpdate(userGroups, updateQuery);
            }
        }

        // execute to delete scheme
        await this.repository.delete(id);
    }

    validateEditSCheme(updatePermisson: PermissionDTO, orginalPermission: PermissionInterface) {
        if (updatePermisson.name !== orginalPermission.name &&
            contains(orginalPermission.name, [schemeName.DefaultAdmin, schemeName.DefaultUser]))
            {
            throw new LingualBadRequestException(MessageCode.NOT_ALLOW_EDIT);
        }
    }
}