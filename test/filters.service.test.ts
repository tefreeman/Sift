type Type = 'number' | 'text' | 'object' | 'array';

interface ITags {
    tag: string, func: any
}
export class MockService {
    private tags: Array<ITags> = [
        { tag: 'bool' , func: this.rBoolean},
        { tag: 'date', func: this.rDate},
        { tag: 'int(number, number)', func: this.rInt},
    ]
    constructor(){}

    private parseString(str: string) {
        str = String(str);
        let start = str.search(/\{{2}/);
        let end = str.search(/\}{2}/);
        
        if(start === -1 || end === -1) {
            return str;
        }
        else start =+ 2;
        
        str = str.substring(start, end);

        let pStart = str.search(/\({1}/);
        let pEnd = str.search(/\){1}/);
        
        let paramList: any = null;
        if(pStart !== -1 || pEnd !== -1) {
            console.log('valid!')
            pStart += 1;
            paramList = str.substring(pStart, pEnd)
            console.log(paramList);
            paramList = str.split(',');
        }
        console.log(paramList);
        
        for (let j = 0 ; j < this.tags.length; j++) {
            if(this.tags[j].tag === str) {
                if (paramList !== null) {
                    console.log('return')
                  return  this.tags[j].func(paramList)
                } else {
                    console.log('return1')
                   return this.tags[j].func();
                }
             }
        }
        


        console.log(paramList);
    }
    public generateObject(obj: any) {
        let genObj: any = obj;
        let loopNestedObj = (genObj: any) => {
            Object.keys(genObj).forEach(key => {
              if (genObj[key] && typeof genObj[key] === 'object') loopNestedObj(genObj[key]); // recurse.
                genObj[key] = this.parseString(genObj[key]);
            });
          };
          loopNestedObj(obj);
          return genObj;

    }


    private rBoolean(){
         let num = getRandomInt(0,1);
         if(num === 1)
            return true;
        else
            return false;
    }

    private rDate(){
        return new Date().getTime() * Math.random()
    }

    private rFloat(arr: number[]){
        return getRandomFloat(arr[0], arr[1]);
    }

    private rInt(arr: string[]) {
        return getRandomInt(parseInt(arr[0]), parseInt(arr[1]));
    }

}

function getRandomFloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }

let test = new MockService()
let obj = {test: 'test', val: '{{bool}}', obj: {test: '{{int(1,5)}}'}};

console.log(test.generateObject(obj)['test'])