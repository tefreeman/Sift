import { Injectable } from '@angular/core';


interface Profile {
    me: Me;
}

interface Me {
    firstName: string;
    age: number;
    gender: string;
}
@Injectable()
export class ProfileFormService {
    userProfile: Profile;
    constructor() {
        // TODO grab info from server if it already exists and autofill fields
    }

    setProfileMe(me: Me) {
        this.userProfile.me = me;
    }

    getProfileMe() {
       return this.userProfile.me;
    }
}
