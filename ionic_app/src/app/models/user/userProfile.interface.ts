import { Cuisines } from '../food/cuisines.interface';
import { Review } from '../review/review.interface';
import { Health } from './userHealth.interface';
import { History } from './userProfile.interface';

export interface Taste {
    cuisinesPref: Cuisines;
    favoriteIngredients: string[];
  }
  export interface Goal {
    tasteVsHealth: number; // TODO should I move this only into filters?
    goalAmt: number;
    goalTimeline: number;
    timeStamp: number;
  }
  
  export interface Personal {
    age: number;
    displayName: string;
    gender: string;
    ethnicity: string;
    photoUrl: string;
  }
  export interface Profile {
    email: string;
    filterIds: string[];
    quickSetup: boolean;
    profile: Personal;
    Health: Health;
    history: History;
    goal: Goal;
    taste: Taste;
  }

  export interface History {
    userCreated: number;
    userTimeSpent: number;
    ProfileChanges: Profile[]
    reviewIds: number[]
  }