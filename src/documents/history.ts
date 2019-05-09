import { InterfaceBase, SchemaBase } from 'core/modules/database/contract/base.document';

interface IHistoryDocument extends InterfaceBase {
  sequence: number;
  source: string;
  destination: string;
  callOrigin: string;
  connectTime?: number;
  disconnectTime?: number;
  duration: number;
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
  connectTime: { type: Number },
  disconnectTime: { type: Number },
  duration: { type: Number }
});

export { IHistoryDocument, HistorySchema };