import { BranchSeeder } from '../migrations/branch.seeder';
import { BranchService } from './branch.service';

export const dataServices = [
    BranchService,
    BranchSeeder
];