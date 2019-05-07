import { Injectable } from '@nestjs/common';
import { isNil } from 'ramda';
import { AppConfigService } from '../../../app.config';
import { IDatabaseSeeder } from '../../../core/modules/database/contract/seeding';
import { BranchDto } from '../../../documents/branch';
import { DefaultHOBranch, DOCUMENT_NAME } from '../../../documents/const';
import { BranchService } from '../services/branch.service';

@Injectable()
export class BranchSeeder implements IDatabaseSeeder {

    getName(): string {
        return DOCUMENT_NAME.Branch;
    }
    constructor(private branchService: BranchService, private configService: AppConfigService) { }

    async seed() {
        // Create default user root
        const defaultBranch = this.creatHeadOfficeBranch();

        // Determine whether root HO branch exist or not
        const branch = await this.branchService.findOneByName(defaultBranch.name);
        if (branch === null || isNil(branch)) {
            // Create HO branch in database
            await this.branchService.create(defaultBranch);
        }
    }

    private creatHeadOfficeBranch(): BranchDto {
        const branch = new BranchDto();
        branch.name = DefaultHOBranch.NAME;
        return branch;
    }
}