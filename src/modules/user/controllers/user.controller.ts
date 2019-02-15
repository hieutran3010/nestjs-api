import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query
} from '@nestjs/common';
import { Permission } from '../../../core/permission/common';
import { UserDto } from '../../../documents/user';
import { UserService } from '../services/user.service';

@Permission('06FDE342A965', 'User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  async find(@Query() params) {
    const { searchKey, pageSize, pageNumber } = params;
    return await this.userService.find(+pageNumber, +pageSize, searchKey);
  }

  @Get('count')
  async count(@Query() params) {
    const { searchKey } = params;
    return await this.userService.count(searchKey);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  @Get('getUsersByGroupName/:groupName')
  async getUsersByGroupName(@Param('groupName') groupName: string, @Query() params) {
    const { searchKey, pageSize, pageNumber } = params;
    return await this.userService.getUsersByGroupName(groupName, searchKey, pageSize, pageNumber);
  }

  @Get('getUsersByGroupName/:groupName/count')
  async countUsersByGroupName(@Param('groupName') groupName: string, @Query() params) {
    const { searchKey } = params;
    return await this.userService.countUserByGroupName(groupName, searchKey);
  }

  @Post()
  async create(@Body() createUserDto: UserDto) {
    // Add new user to database
    return await this.userService.create(createUserDto, true);
  }

  @Put(':id/changeUserGroup')
  async changeUserGroup(@Param('id') id: string, @Query() params) {
    const { ugId } = params;
    return await this.userService.changeUserGroup(id, ugId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UserDto) {
    updateUserDto._id = id;
    return await this.userService.update(updateUserDto);
  }

  @Patch('changepassword')
  async changePassword(@Body() model: any) {
    return await this.userService.changePassword(model.old_password, model.new_password);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.userService.delete(id);
  }
}
