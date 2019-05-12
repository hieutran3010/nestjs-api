import { InterfaceBase, SchemaBase } from '../core/modules/database/contract/base.document';

interface ICrawlDataHistoryDocument extends InterfaceBase {
  fileName: string;
  time: Date;
}

  /**
   * Define history schema
   *
   */
const CrawlDataHistorySchema = new SchemaBase({
  fileName: { type: String },
  time: { type: Date },
});

export { ICrawlDataHistoryDocument, CrawlDataHistorySchema };