import { ICuisines } from "../food/cuisines.interface";
import { IHealth } from "./userHealth.interface";
import { IHistory } from "./userProfile.interface";

export interface ITaste {
   cuisinesPref: ICuisines;
   favoriteIngredients: string[];
}

export interface IGoal {
   goalAmt: number;
   goalTimeline: number;
   tasteVsHealth: number; // TODO should I move this only into filters?
   timeStamp: number;
}

export interface IPersonal {
   age: number;
   displayName: string;
   ethnicity: string;
   gender: string;
   photoUrl: string;
}

export interface IProfile {
   Health: IHealth;
   email: string;
   filters: userMetaMap[];
   goal: IGoal;
   history: IHistory;
   profile: IPersonal;
   quickSetup: boolean;
   taste: ITaste;
   uid: string;
}

export interface userMetaMap {
   [key: string]: number
}

// the property name using IcachedId must match cached collection name
export interface IDocMeta {
   created?: number;
   inActiveLife?: number;
   lastActive?: number;
   lastUpdate?: number;
}

export interface IDataDoc {
   cacheId?: string;
   id?: string;
   meta: IDocMeta
}

export interface IHistory {
   ProfileChanges: IProfile[];
   reviewIds: number[];
   userCreated: number;
   userTimeSpent: number;
}
