import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

  export function log(methodName:string, note?: string,  data?: any): void {
    if (!environment.production) {
      if (note === null && data === null) {
        console.log(methodName);
      }
      else if (note && data === null) {
        console.log(methodName, {'note': note});
      }
      else if (note === null && data) {
        console.log(methodName, {'data': data})
      }
      else {
        console.log(methodName, {'note': note, 'data': data});
      }
    }
  }
