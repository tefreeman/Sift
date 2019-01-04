import { Injectable } from '@angular/core';
import { Profile, Personal, Goal, Taste } from './profile.interfaces';


@Injectable()
export class ProfileFormService {
    userProfile: Profile;
    constructor() {
        // TODO grab info from server if it already exists and autofill fields
    }

    setProfileMe(personalData: Personal) {
        this.userProfile.personal = personalData;
    }

    getProfileMe(): Personal {
       return this.userProfile.personal;
    }

    setProfileGoal(goalData: Goal) {
        this.userProfile.goal = goalData;
    }

    getProfileGoal(): Goal {
       return this.userProfile.goal;
    }

    setProfileTaste(tasteData: Taste) {
        this.userProfile.taste = tasteData;
    }

    getProfileTaste(): Taste {
       return this.userProfile.taste;
    }
}
