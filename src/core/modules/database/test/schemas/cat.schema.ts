import * as mongoose from 'mongoose';
import { SchemaBase } from '../../base.document';

export const catSchema = new SchemaBase({
  name: String,
  age: Number,
  ipAdress: String,
});
