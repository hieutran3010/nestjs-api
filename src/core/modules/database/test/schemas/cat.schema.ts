import { SchemaBase } from '../../contract/base.document';

export const catSchema = new SchemaBase({
  name: String,
  age: Number,
  ipAdress: String,
});
