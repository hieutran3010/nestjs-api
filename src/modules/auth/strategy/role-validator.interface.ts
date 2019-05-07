import { ExecutionContext } from '@nestjs/common';

export interface IRoleValidator {
    hasPermission(username: string, context: ExecutionContext);
}
