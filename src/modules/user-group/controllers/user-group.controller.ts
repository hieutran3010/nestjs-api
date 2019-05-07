import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Permission } from '../../../core/permission/common';
import { UserGroupDto } from '../../../documents/user-group';
import { UserGroupService } from '../services/user-group.service';

@Permission('7CC932248A2B', 'User Group')
@Controller('user-group')
export class UserGroupController {
  constructor(private readonly userGroupService: UserGroupService) { }

  @Get()
  async find(@Query() params) {
    const { searchKey, pageSize, pageNumber } = params;
    return await this.userGroupService.find(+pageNumber, +pageSize, searchKey);
  }

  @Get('count')
  async count(@Query() params) {
    const { searchKey } = params;
    return await this.userGroupService.count(searchKey);
  }

  @Get('getUserListExceptInGroup/:id/count')
  async countUserListExceptInGroup(@Param() params, @Query() queryParams) {
    const { searchKey } = queryParams;
    return await this.userGroupService.countUserListExceptInGroup(params.id, searchKey);
  }

  @Get('getUserListExceptInGroup/:id')
  async getUserListExceptInGroup(@Param() params, @Query() queryParams) {
    const { searchKey, pageNumber, pageSize } = queryParams;
    return await this.userGroupService.getUserListExceptInGroup(params.id, searchKey, +pageSize, +pageNumber);
  }

  @Get(':id')
  async findOne(@Param() params) {
    return await this.userGroupService.findById(params.id);
  }

  @Post('')
  async create(@Body() createdUserGroupDto: UserGroupDto) {
    return await this.userGroupService.create(createdUserGroupDto);
  }

  @Put('updateMembersUserGroup/:id')
  async updateMembersUserGroup(@Param() params, @Body() body) {
    const { id } = params;
    const userIds = body;
    return await this.userGroupService.updateMembersUserGroup(id, userIds);
  }

  @Put('updateSchemeForUserGroup/:id')
  async updateSchemeForUserGroup(@Param('id') id: string,
                                 @Body() body: any) {

    const { schemeId } = body;
    return await this.userGroupService.updateSchemeForUserGroup(id, schemeId);
  }

  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updatedUserGroupDto: UserGroupDto,
  ) {
    return await this.userGroupService.update(id, updatedUserGroupDto);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.userGroupService.delete(id);
  }
}
