// TODO: add system to determine what properties are displayed
// based on the healthVsTaste preference
export interface ICuisines {
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

export interface INutrition {
    calories: [number,  number];
    fatGrams: [number,  number];
    carbGrams: [number,  number];
    proteinGrams: [number,  number];
    fiberGrams: [number,  number];
    waterLiters: [number,  number];
    vitaminBMg: [number,  number];
    vitaminCMg: [number,  number];
    vitaminDMg: [number,  number];
    vitaminEMg: [number,  number];
    calciumMg: [number,  number];
    ironMg: [number,  number];
    magnesiumMg: [number,  number];
    PotassiumPMg: [number,  number];
    sodiumMg: [number,  number];




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


export interface IHealthHistory {
    childSports: number[];
    childActivityLvl: number;
    childHoodBodyType: number;

}
export interface IHealth {
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
    macroGoal: INutrition;
    healthHistory: IHealthHistory;

}

export interface ITaste {
    cuisinesPref: ICuisines;
    favoriteIngredients: string[];
}
export interface IGoal {
    tasteVsHealth: number; // TODO should I move this only into filters?
    goalAmt: number;
    goalTimeline: number;
}

export interface IPersonal {
    age: number;
    gender: string;
    ethnicity: string;
    childHoodCity: string;
}

export interface IProfile {
    firstName: string;
    quickSetup: boolean;
    personal: IPersonal;
    goal: IGoal;
    taste: ITaste;
}

// objects send over the server will be reduced to Array<number> and then constructed to resemble 
export interface IIngredients {
    ingredients: Array<{'id': number, 'name': string, 'val': number}>;
}
export interface IFilter {
    uid: string;
    name: string;
    public: boolean;
    timestamp: number;
    restaurantFilters: {
        distance: number,
        price: number,
        resturantType: ICuisines
        takeOut: boolean;
        fullBar: boolean;
        outDoorSeating: boolean;
        orderDelivery: boolean;
    };
    // Create your own diet?
    diets: {

    }
    // Need to add preset diets to automatically set health and food filters
    advFilters: {
        tasteVsHealth: number; // can override user default settings
        nutrition: INutrition; // set a range for nutrition elements
        ingredients: IIngredients; // 0 == exclude, 1 == include,

    };
}
