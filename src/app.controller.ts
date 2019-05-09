import {
  Controller,
  Get,
} from '@nestjs/common';
import { DatabaseSeedingService } from 'core/modules/database/service';

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
}
