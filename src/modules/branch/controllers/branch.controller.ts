import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BranchDto } from '../../../documents/branch';
import { BranchService } from '../services/branch.service';

@Controller('branch')
export class BranchController {
    constructor(private readonly branchService: BranchService) { }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    async findOne(@Param('id') id: string) {
        return await this.branchService.findById(id);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async findAll() {
        return await this.branchService.findAll();
    }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async create(@Body() branchDto: BranchDto) {
        // Add new user to database
        return await this.branchService.create(branchDto);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    async update(@Param('id') id: string, @Body() branchDto: BranchDto) {
        return await this.branchService.update(branchDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    async delete(@Param('id') id: string) {
        return await this.branchService.delete(id);
    }

}