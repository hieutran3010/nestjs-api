
import { Global, Module } from '@nestjs/common';
import { ControllerService } from './services/controller.service';

@Global()
@Module({
    providers: [ControllerService],
    exports: [ControllerService]
})
export class PermissionControllerModule{}