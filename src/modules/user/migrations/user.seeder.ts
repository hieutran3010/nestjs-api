import { Injectable } from '@nestjs/common';
import { isNil } from 'ramda';
import { ConfigService } from '../../../core/modules/configuration/config.service';
import { IDatabaseSeeder } from '../../../core/modules/database-seeder/contract';
import { RepositoryBase } from '../../../core/modules/database/factory/repository.base';
import { RepositoryFactory } from '../../../core/modules/database/factory/repository.factory';
import { Branch, branchFields, BranchSchema } from '../../../documents/branch.document';
import { DefaultGroup, DOCUMENT_NAME } from '../../../documents/const';
import { DefaultHOBranch, DefaultRootUserName } from '../../../documents/const';
import { UserDto } from '../../../documents/user.document';
import { RequestContext } from './../../auth/context/request-context';
import { UserService } from './../services/user.service';

@Injectable()
export class UserSeeder implements IDatabaseSeeder {

    branchRepository: RepositoryBase<Branch>;

    constructor(private userService: UserService, private configService: ConfigService, private repositoryFactory: RepositoryFactory) {
        this.branchRepository = this.repositoryFactory.getRepository(DOCUMENT_NAME.Branch, BranchSchema);
    }

    async seed() {
        // Set default lang code for request context is en
        RequestContext.setLangCode('en');

        // Create default user root
        const userRoot = await this.creatRootUser();

        // Determine whether root user exist or not
        const rootUser = await this.userService.getUserByUsername(userRoot.username);
        if (rootUser === null || isNil(rootUser)) {
            // Create root user in database
            await this.userService.create(userRoot, false);
        }
    }

    getName(): string {
        return DOCUMENT_NAME.User;
    }

    private async creatRootUser() {
        const userRoot = new UserDto();
        userRoot.fullname = DefaultRootUserName;
        userRoot.username = DefaultRootUserName;
        userRoot.email = this.configService.adminConfig.email;
        userRoot.loginAttempts = 0;
        const headOfficeId = await this.getHeadOfficeBranch();
        userRoot.branch = headOfficeId;
        // tslint:disable-next-line:max-line-length
        userRoot.avatar = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAAAOVBMVEXu7u6ZmZnZ2dns7Oyfn5/p6emmpqawsLDe3t6rq6ucnJzT09O5ubnExMTW1tazs7Pi4uLKysrGxsYZPfTBAAAEIElEQVR4nO2d63aqMBCFBZIQuQj4/g97GtGKyi1JZzJy9ve7XWt2k7ky0NMJAAAAAAAAAAAAAAAAAAAAAAAYKXqb57YvUtvhz9NkXTelyu6osqn16Qv16OGcfXAedGq7PLHdp4qRzqa2zQNbLslwlN8iRTdrMhzNV1ywi9rSkWUmT23lNm21rSPLqja1nRsUi07+Tic6EuuZkLvEWbCj+OiQrKRYjbqflFJv12bYfadJbfE8ta+OLKtT2zxHvyvuvlL1qa2ewdNBRsrUVn8ScLEc4i5XsaMwmUNJi1xDmI4sG1Jb/oYJFWJSW/5KoIc4ZHnJ7lrxky617VN0QA55UEkquSJulqy75V1lTZFUcQXHLIeguKVjdGSZHCfJ44TImUQEp/UROcn9Gifkmtr+X9o4IXJGQ1HRV1L8hRBpQg7jI4eJWlE1o6Sq0cYJkfPg5zC11slreP3OObX1E6LClpygdTpdYoRcUls/IXQ855A1oovI7XLyuiOitZLTVt0IjluSYpYj2N0lufqNwCORdiDBZYqc8uSXoMAlK2SN6IApnRFUZj2x3pPsSuDFcniPt+QMtN7wdBOJDnLHS4lgHV5KROvw6EwkdSGz7NkE/KndxVUmjj7PL8+E0O/Y5SifOyj6kucCNlJ03Yx5UE1Cab1xKGoy/xnGnzVuTTsd9fSp9PmZ3XS7IkW1T5PttNTsUs23Lm81SdVO1uKHhYLFTJbKi/eNVJPCc/TMjsC4znuXY5sPLaa5n9rtR/IZrR37BcvnL8/rjrWu286onz97pUzXvnrBwr62Yu58h6UCUQ27hiLFsORFFWsBtlYemnpTSlGvlfyMSjam72b9VIqlQPCALXptNx6qXew07FpoHuFqU/a1gmZGS2Hbfb/LE7t2V7iqbGt7t0nbui13D1ZZKmPvCZYyxns0zJAZi6hNoL0Y+sl25N7JXshjsI54gOCDovZ3pgOhPxIWD3EQ79VFrpj5QFs9Rm6d+ECaS2L2e30h3QeO3NXwg7J2ZLxZpHcr5im0P4TPrRljloMubkUumPlCN1UNeh8sHLo3yRiDr6Oi0hG5X+YPVcvLVjA+oMokzL5O5+3Mvk7n7Wwl/AOqUp5bR5bR6Oj5hdA8ymIuUBw0RQp79KVq3NmjL1X8ZW1GRmhaksMIYc+HVBkxagE+DJqNR/bETpXaDyOEdfIwoiDkvxDC3LE7aLr2w5zIYYQcJvwepkQ5TNHI+nBkhGawdZie/TjjoMNMGkM+lxcD3af2mOMW3UNE3iOh/PZh5DcR/CD9ggJjdqf9hGPIq21hUO819kxKDPmrGJrldpUMe6bFlTx2VVeel/V74nzS8L3h0zdk7aJilHEjb7s/93vTLa+ik1L01uZ/hP3Kf+0BAAAAAAAAAAAAAAAAAAAAAJDKPzTVN7igTjnPAAAAAElFTkSuQmCC`;
        userRoot.isActive = true;
        const adminUserGroup = await this.userService.getUserGroupIdByName(DefaultGroup.ADMIN_GROUP); // Add user into cms-administrators-group
        userRoot.userGroup = adminUserGroup;
        return userRoot;
    }

    async getHeadOfficeBranch() {
        const searchCondition = {};
        searchCondition[branchFields.NAME] = DefaultHOBranch.NAME;
        return await this.branchRepository.findOne(searchCondition, ['_id']);
    }
}