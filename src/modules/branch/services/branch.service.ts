import { Injectable } from '@nestjs/common';
import { ObjectId } from 'bson';
import { LingualBadRequestException } from '../../../core/exception/lingual-exceptions';
import { RepositoryFactory } from '../../../core/modules/database/factory/repository.factory';
import { ServiceBase } from '../../../core/modules/database/service/service.base';
import { isNullOrEmptyOrUndefined } from '../../../core/utils';
import { Branch, BranchDto, branchFields, BranchSchema } from '../../../documents/branch';
import { DOCUMENT_NAME } from '../../../documents/const';
import { BRANCH_MESSAGE_CODE } from '../branch.constant';

@Injectable()
export class BranchService extends ServiceBase {
    private branchRepostitory;

    constructor(repositoryFactory: RepositoryFactory) {
        super(repositoryFactory);
        this.branchRepostitory = repositoryFactory.getRepository(
            DOCUMENT_NAME.Branch,
            BranchSchema,
        );
    }
    async findOneByName(name: string): Promise<Branch> {
        const searchCondition = {};
        searchCondition[branchFields.NAME] = name;
        return await this.branchRepostitory.findOne(searchCondition);
    }

    async findAll() {
        return this.branchRepostitory.findAll();
    }

    async findById(_id: string): Promise<Branch> {
        return this.branchRepostitory.findById(_id);
    }

    async create(branchDto: BranchDto): Promise<Branch> {

        // Validate user information
        await this.validateDuplicateBranch(branchDto);

        // Add user to database
        return await this.branchRepostitory.create(branchDto);
    }

    async update(branchDto: BranchDto): Promise<void> {
        // Validate user information
        await this.validateDuplicateBranch(branchDto);

        const updatedBranch = {};
        updatedBranch[branchFields.NAME] = branchDto.name;

        // Update user in database
        return await this.branchRepostitory.update(branchDto._id, updatedBranch);
    }

    async delete(_id: string): Promise<void> {
        return await this.branchRepostitory.delete(_id);
    }

    private async validateDuplicateBranch(branch: BranchDto) {
        let branchId: ObjectId;
        if (branch._id) {
            branchId = new ObjectId(branch._id);
        }
        // Is taken branch name
        const foundBranch = await this.findOneByName(branch.name);
        if (foundBranch !== null && !isNullOrEmptyOrUndefined(foundBranch)) {
            if (!branchId || !branchId.equals(foundBranch._id)) {
                throw new LingualBadRequestException(BRANCH_MESSAGE_CODE.DuplicateBranch, [foundBranch.name]);
            }
        }
    }
}
