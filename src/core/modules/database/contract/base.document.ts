import * as mongoose from 'mongoose';

const dtoBaseFields = {
  ID: '_id',
  CREATE_ON: 'create_on',
  CREATE_BY: 'create_by',
  UPDATED_BY: 'updated_by',
  UPDATED_ON: 'updated_on',
  BRANCH_ID: 'branch_id',
};

class DTOBase {
  _id?: any;
  create_on: Date;
  create_by: string;
  updated_by: string;
  updated_on: Date;
  branch_id: string;
}

interface InterfaceBase extends mongoose.Document {
  create_on: Date;
  create_by: string;
  updated_by: string;
  updated_on: Date;
  branch_id: string;
}

class SchemaBase extends mongoose.Schema {
  constructor(definition?: mongoose.SchemaDefinition, options?: mongoose.SchemaOptions) {
    super(definition, options);
    this.add({
      create_on: Date,
      create_by: String,
      updated_by: String,
      updated_on: Date,
      branch_id: String,
    });
    this.set('toJSON', { getters: true, virtuals: false });
  }
}
class Range {
  from: number;
  to: number;
}

export { dtoBaseFields, DTOBase, InterfaceBase, SchemaBase, Range };
