import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Permission } from '../../../core/permission/common';
import { PermissionDTO } from '../../../documents/permission';
import { ControllerDto } from '../../../documents/permission-controller';
import { PermissionSchemeService } from '../services/permission-schema.service';

@Permission('3EE65047DF1C', 'Permission Scheme')
@Controller('permission-scheme')
export class PermissionSchemeController {

    constructor(private readonly service: PermissionSchemeService) { }

    @Get()
    async getAll(@Query() params): Promise<PermissionDTO[]> {
        const { searchKey, pageSize, pageNumber, fields } = params;
        return await this.service.getAll(searchKey, +pageSize, +pageNumber, fields);
    }

    @Get('permission-schemes')
    async getPermissionSchemes(@Query() params) {
        const { searchKey, pageSize, pageNumber } = params;
        return await this.service.getPermissionSchemes(searchKey, +pageSize, +pageNumber);
    }

    @Get('controllers')
    async getAllController(): Promise<ControllerDto[]> {
        return await this.service.getAllController();
    }

    @Get('count')
    async count(@Query() params) {
        const { searchKey, pageSize, pageNumber } = params;
        return await this.service.count(searchKey, pageSize, pageNumber);
    }

    @Get('user-groups')
    async getAllUserGroups() {
        return await this.service.getAllUserGroups();
    }

    @Get(':id')
    async getById(@Param('id') id) {
        return await this.service.findById(id);
    }

    @Get(':id/getControllers')
    async getControllersOfPermissionScheme(@Param() params) {
        const { id } = params;
        return await this.service.getControllersOfPermissionScheme(id);
    }

    @Post('clone')
    async clone(@Body() permissionSchemes) {
        return await this.service.clone(permissionSchemes);
    }

    @Post()
    async create(@Body() permissionModel: PermissionDTO) {
        return this.service.create(permissionModel);
    }

    @Put('updateSchemeForUserGroup/:id')
    async updateSchemeForUserGroup(@Param('id') id: string,
                                   @Body() body: any) {

        const userGroupIds = body;
        return await this.service.updateSchemeForUserGroup(id, userGroupIds);
    }

    @Put()
    async updateScheme(@Body() permissionModel: PermissionDTO) {
        return await this.service.updateScheme(permissionModel);
    }

    @Delete(':id')
    async delete(@Param() params) {
        const { id } = params;
        await this.service.delete(id);
    }
}