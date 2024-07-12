import { environment } from '../../environments/environment';

let prevTime: number = new Date().getTime();
  export function log(methodName: string, note?: string,  data?: any): void {
    if (!environment.production) {
      const timeTook: string = ((new Date().getTime() - prevTime) / 1000).toPrecision(4).toString();
      prevTime = new Date().getTime();
      if (note === null && data === null) {
        console.log(methodName);
      } else if (note && data === null) {
        console.log(methodName + ` (${timeTook})` , {'note': note});
      } else if (note === null && data) {
        console.log(methodName + ` (${timeTook})`, {'data': data});
      } else {
        console.log(methodName + ` (${timeTook})`, {'note': note, 'data': data});
      }
    }
  }

