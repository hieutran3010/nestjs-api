import { Injectable } from '@nestjs/common';
import { isNil } from 'ramda';
import { IDatabaseSeeder } from '../../../core/modules/database/contract/seeding';
import { RepositoryBase, RepositoryFactory } from '../../../core/modules/database/factory';
import { DOCUMENT_NAME } from '../../../documents/const';
import { DataScope, PermissionDTO, PermissionInterface, PermissionSchema } from '../../../documents/permission';
import { Controller, controllerFields, ControllerSchema, schemeName } from '../../../documents/permission-controller';
import { PermissionDetailDTO } from '../../../documents/permission-detail';

@Injectable()
export class PermissionSchemeSeeder implements IDatabaseSeeder {
    controllerRepository: RepositoryBase<Controller>;
    schemeRepository: RepositoryBase<PermissionInterface>;

    constructor(private readonly repositoryFactory: RepositoryFactory) {
        this.resolveServices();
    }

    async resolveServices() {
        this.controllerRepository = await this.repositoryFactory.getRepository<Controller>(DOCUMENT_NAME.Controller, ControllerSchema);
        this.schemeRepository = await this.repositoryFactory.getRepository<PermissionInterface>(DOCUMENT_NAME.Permission, PermissionSchema);
    }

    getName(): string {
        return DOCUMENT_NAME.Permission;
    }

    async seed(): Promise<void> {
        await this.createDefaultScheme(true);
        await this.createDefaultScheme(false);
    }

    async createDefaultScheme(isAdmin: boolean): Promise<void> {
        const defaultScheme = await this.getPermissionScheme(isAdmin);
        const existedScheme = await this.schemeRepository.findOne({ name: defaultScheme.name });
        if (isNil(existedScheme)) {
            await this.schemeRepository.create(defaultScheme);
        }
    }

    async getPermissionScheme(isAdmin: boolean): Promise<PermissionDTO> {
        const controllerCodes = await this.getControllerCodes();
        const defaultPermissionDTO = this.getDefaultScheme();
        defaultPermissionDTO.name = isAdmin ? schemeName.DefaultAdmin : schemeName.DefaultUser;
        defaultPermissionDTO.permission_details = [];
        // set permission detail
        controllerCodes.forEach((controller) => {
            const permissionDetail = new PermissionDetailDTO();
            permissionDetail.controller = controller._id;
            permissionDetail.data_scope = isAdmin ? DataScope.full : DataScope.branch;
            permissionDetail.is_delete = isAdmin ? true : false;
            permissionDetail.is_insert = isAdmin ? true : false;
            permissionDetail.is_update = isAdmin ? true : false;
            defaultPermissionDTO.permission_details.push(permissionDetail);
        });

        return defaultPermissionDTO;
    }

    async getControllerCodes(): Promise<any[]> {
        const field = [];
        field.push(controllerFields.KEY);
        return await this.controllerRepository.findAll(field);
    }

    getDefaultScheme() {
        return new PermissionDTO();
    }
}