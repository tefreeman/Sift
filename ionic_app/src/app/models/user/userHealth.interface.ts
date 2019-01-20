import { activities, activityLevel } from '../activities/activity.interface';
import { Nutrition } from '../nutrition/nutrition.interface';

export interface ChildHealthHistory {
    childSports: activities[];
    childActivityLvl: activityLevel;
    childHoodBodyType: number;
  }

  export interface CurrentHealth {
    weightKg: number;
    heightCm: number;
    activityLevel: activityLevel;
    workoutFreq: number;
    workoutType: number;
    appetiteLvl: number;
    bodyMeasurementMethod: number;
    basalMetabolicRate: number;
    gymExperience: number;
    bodyFatPer: number;
    leanBodyMass: number;
    skeletalMuscleMass: number;
    macroGoal: Nutrition;
  }
  export interface Health extends CurrentHealth {
    healthHistory: ChildHealthHistory;
  }

  export enum bodyType {
    slim,
    average,
    large,
    toned,
    muscular
  }