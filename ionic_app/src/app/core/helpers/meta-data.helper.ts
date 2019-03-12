import { IDocMeta } from "../../models/user/userProfile.interface";

export function createMetaData(): IDocMeta {
   const time = new Date().getTime();
   return {
      lastActive: time,
      lastUpdate: time,
      created: time
   };
}