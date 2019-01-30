import { Module } from '@nestjs/common';
import { SeedPriority } from '../../core/modules/database-seeder/contract';
import { LoggingService } from '../../core/modules/logging/logging.service';
import { PermissionModuleBase } from '../../core/permission/permission.module.base';
import { ControllerService } from '../../permission-controller/services/controller.service';
import { DatabaseSeedingService } from './../../core/modules/database-seeder/services/seed';
import { controllers } from './controllers';
import { UserGroupSeeder } from './migrations/user-group.seeder';
import { UserGroupService } from './services/user-group.service';

@Module({
  imports: [],
  providers: [UserGroupService, LoggingService, UserGroupSeeder],
  controllers: [...controllers],
})
export class UserGroupModule extends PermissionModuleBase {
  constructor(service: ControllerService, private seederService: DatabaseSeedingService, private userGroupSeeder: UserGroupSeeder) {
    super(service, controllers);
  }
  onModuleInit() {
    this.seederService.register(SeedPriority.HIGH, this.userGroupSeeder);
  }
}
