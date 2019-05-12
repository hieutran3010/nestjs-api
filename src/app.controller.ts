import {
  Controller,
  Get,
} from '@nestjs/common';
import { DatabaseSeedingService } from './core/modules/database/service';
import { fileToJSON } from './core/utils';

@Controller('app')
export class AppController {

  constructor(private readonly databaseSeedingService: DatabaseSeedingService) {}

  @Get()
  ping(): string {
    return 'ok';
  }

  @Get('seedData')
  seed() {
    this.databaseSeedingService.seed();
  }

  @Get('version')
  getVersion() {
    const obj = fileToJSON('package.json');
    if (obj) {
      return {
        name: obj.name,
        version: obj.version,
      };
    }
  }
}
