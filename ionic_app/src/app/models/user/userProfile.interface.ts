import { ICuisines } from '../food/cuisines.interface';
import { IReview } from '../review/review.interface';
import { IHealth } from './userHealth.interface';
import { IHistory } from './userProfile.interface';

export interface ITaste {
    cuisinesPref: ICuisines;
    favoriteIngredients: string[];
  }
  export interface IGoal {
    tasteVsHealth: number; // TODO should I move this only into filters?
    goalAmt: number;
    goalTimeline: number;
    timeStamp: number;
  }
  
  export interface IPersonal {
    age: number;
    displayName: string;
    gender: string;
    ethnicity: string;
    photoUrl: string;
  }
  export interface IProfile {
    email: string;
    filterIds: string[];
    quickSetup: boolean;
    profile: IPersonal;
    Health: IHealth;
    history: IHistory;
    goal: IGoal;
    taste: ITaste;
  }

  export interface IHistory {
    userCreated: number;
    userTimeSpent: number;
    ProfileChanges: IProfile[]
    reviewIds: number[]
  }