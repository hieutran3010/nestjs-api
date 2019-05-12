import { InterfaceBase, SchemaBase } from '../core/modules/database/contract/base.document';

interface IHistoryDocument extends InterfaceBase {
  sequence: number;
  source: string;
  destination: string;
  callOrigin: string;
  connectTime?: Date;
  disconnectTime?: Date;
  duration: number;
  durationFormat: string;
}

  /**
   * Define history schema
   *
   */
const HistorySchema = new SchemaBase({
  sequence: { type: Number },
  source: { type: String },
  destination: { type: String },
  callOrigin: { type: String },
  connectTime: { type: Date },
  disconnectTime: { type: Date },
  duration: { type: Number },
  durationFormat: { type: String },
});

export { IHistoryDocument, HistorySchema };