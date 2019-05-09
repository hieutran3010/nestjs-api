import { Module, OnModuleInit } from '@nestjs/common';
import { SeedPriority } from '../../core/modules/database/contract/seeding';
import { DatabaseSeedingService } from './../../core/modules/database/service';
import { SettingController } from './controller';
import SettingSeeder from './seeder';
import SettingDataService from './service';

@Module({
  providers: [SettingSeeder, SettingDataService],
  controllers: [SettingController],
  exports: [],
})
export class SettingModule implements OnModuleInit {
  constructor(private seederService: DatabaseSeedingService,
              private readonly settingSeeder: SettingSeeder) {
  }

  onModuleInit() {
    this.seederService.register(SeedPriority.HIGHEST, this.settingSeeder);
  }
}
