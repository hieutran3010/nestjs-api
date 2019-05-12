import { Body, Controller, Get, Put } from '@nestjs/common';
import { ISettingDocument } from 'documents/setting';
import SettingDataService from './service';

@Controller('setting')
export class SettingController {

    constructor(private readonly settingDataService: SettingDataService) {}

    @Get()
    async get() {
        return await this.settingDataService.getAll();
    }

    @Put()
    async update(@Body() settings: ISettingDocument[]) {
        return await this.settingDataService.update(settings);
    }

    @Get('testFtpConnection')
    async testFtpConnection() {
        return await this.settingDataService.testConnection();
    }
}