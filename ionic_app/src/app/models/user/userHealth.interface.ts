import { Tactivities, TactivityLevel } from '../activities/activity.interface';
import { INutrition } from '../nutrition/nutrition.interface';

export interface IChildHealthHistory {
    childSports: Tactivities[];
    childActivityLvl: TactivityLevel;
    childHoodBodyType: number;
  }

  export interface ICurrentHealth {
    weightKg: number;
    heightCm: number;
    activityLevel: TactivityLevel;
    workoutFreq: number;
    workoutType: number;
    appetiteLvl: number;
    bodyMeasurementMethod: number;
    basalMetabolicRate: number;
    gymExperience: number;
    bodyFatPer: number;
    bodType: EbodyType;
    leanBodyMass: number;
    skeletalMuscleMass: number;
    macroGoal: INutrition;
  }
  export interface IHealth extends ICurrentHealth {
    healthHistory: IChildHealthHistory;
  }

  export enum EbodyType {
    slim,
    average,
    large,
    toned,
    muscular
  }