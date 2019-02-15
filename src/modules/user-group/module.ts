import { Module } from '@nestjs/common';
import { PermissionControllerCollectService } from '../../app.service';
import { SeedPriority } from '../../core/modules/database/contract/seeding';
import { LoggingService } from '../../core/modules/logging';
import { PermissionModuleBase } from '../../core/permission';
import { DatabaseSeedingService } from './../../core/modules/database/service';
import { controllers } from './controllers';
import { UserGroupSeeder } from './migrations/user-group.seeder';
import { UserGroupService } from './services/user-group.service';

@Module({
  imports: [],
  providers: [UserGroupService, LoggingService, UserGroupSeeder],
  controllers: [...controllers],
})
export class UserGroupModule extends PermissionModuleBase {
  constructor(service: PermissionControllerCollectService, private seederService: DatabaseSeedingService, private userGroupSeeder: UserGroupSeeder) {
    super(service, controllers);
  }
  onModuleInit() {
    this.seederService.register(SeedPriority.HIGH, this.userGroupSeeder);
  }
}
