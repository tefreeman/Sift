import { IDataDoc } from "../../../models/user/userProfile.interface";

export class MetaService {

   constructor() {
   }

   public static initMeta<T extends IDataDoc>(doc: T, id, lastUpdate, propPath) {
      doc.id = id;
      doc.cacheId = propPath + id;
      doc.meta.lastUpdate = lastUpdate;
      return doc;
   }

}