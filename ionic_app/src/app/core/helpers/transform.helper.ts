import { IDataDoc } from "../../models/user/userProfile.interface";

export function arrToMap<T extends IDataDoc>(arr: T[]): Map<string, T> {
   let tempMap = new Map();
   for (let obj of arr) {
      //TODO add tpe check to obj['name'] so we can refactor to obj.name safely
      tempMap.set(obj["name"], obj);
   }
   return tempMap;
}