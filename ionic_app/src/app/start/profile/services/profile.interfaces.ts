export interface Cuisines {
    mexican: number;
    italian: number;
    chinese: number;
    japanese: number;
    greek: number;
    french: number;
    thai: number;
    spanish: number;
    indian: number;
    mediterranean: number;
    ethiopian: number;
    brazilian: number;
    korean: number;
    american: number;
}

export interface MacroGoal {
    calories: number;
    fatGrams: number;
    carbGrams: number;
    proteinGrams: number;
    fiberGrams: number;
    waterLiters: number;
    vitaminBMg: number;
    vitaminCMg: number;
    vitaminDMg: number;
    vitaminEMg: number;
    calciumMg: number;
    ironMg: number;
    magnesiumMg: number;
    PotassiumPMg: number;
    sodiumMg: number;




}

enum EactivityLevel {
    sedentary,
    LightlyActive,
    active,
    veryActive
}

enum Eactivites {
    aerobics,
    americanFootball,
    badminton,
    baseball,
    basketball,
    bodyBuilding,
    bowling,
    boxing,
    canoeing,
    cheerLeading,
    climbing,
    cricket,
    cycling,
    dance,
    fencing,
    figureSkating,
    fishing,
    flagFootball,
    golf,
    gymnastics,
    handBall,
    hiking,
    horseRacing,
    iceHockey,
    iceSkating,
    judo,
    karate,
    kayaking,
    kickBall,
    lacrosse,
    martialArts,
    pickleBall,
    powerLifting,
    racquetBall,
    rodeo,
    rollerSkating,
    rowing,
    rugby,
    skateBoarding,
    skiing,
    soccer,
    softball,
    speedSkating,
    surfing,
    swimming,
    tableTennis,
    taekwondo,
    tennis,
    trackAndField,
    ultimateFrisbee,
    volleyball,
    waterPolo,
    weightLifting,
    wrestling,
}

enum EbodyType {
    slim,
    average,
    large,
    toned,
    muscular,
}


export interface HealthHistory {
    childSports: Array<number>;
    childActivityLvl: number;
    childHoodBodyType: number;

}
export interface HealthPref {
    weightKg: number;
    heightCm: number;
    activityLevel: number;
    workoutFreq: number;
    workoutType: number;
    appetiteLvl: number;
    bodyMeasurementMethod: number;
    basalMetabolicRate: number;
    gymExperience: number;
    bodyFatPer: number;
    leanBodyMass: number;
    skeletalMuscleMass: number;
    macroGoal: MacroGoal;
    healthHistory: HealthHistory;

}

export interface Taste {
    allergies: Array<string>;
    cuisinesPref: Cuisines;
    favoriteIngredients: Array<string>;
}
export interface Goal {
    tasteVsHealth: number;
    goalAmt: number;
    goalTimeline: number;
}

export interface Personal {
    age: number;
    gender: string;
    ethnicity: string;
    childHoodCity: string;
}

export interface Profile {
    firstName: string;
    quickSetup: boolean;
    personal: Personal;
    goal: Goal;
    taste: Taste;
}
