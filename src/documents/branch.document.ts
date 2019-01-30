import { IsNotEmpty } from 'class-validator';
import { DTOBase, InterfaceBase, SchemaBase } from '../core/modules/database/base.document';

/**
 * Define branch data transfer object
 *
 * @class UserDto
 */
class BranchDto extends DTOBase {

    @IsNotEmpty()
    name: string;
}

/**
 * Define name of field in branch model
 *
 */
const branchFields = {
    NAME: 'name',
};

/**
 * Define branch interface
 *
 * @interface Branch
 * @extends {InterfaceBase}
 */
interface Branch extends InterfaceBase {
    name: string;
}

/**
 * Define schema for branch
 *
 */
const BranchSchema = new SchemaBase({
    name: { type: String, required: true, index: { unique: true } }
});

export { branchFields, Branch, BranchSchema, BranchDto };
