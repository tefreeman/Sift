type Type = 'number' | 'text' | 'object' | 'array';

interface ITags {
    tag: string, func: any
}
export class MockService {

    constructor(){}




    public repeater(str: any) {
        let num: number;
        let returnString: any = "";
        let match = str.match(/(?!\[)(\d+)(?=])/);
        let numLength = match[0].length;
        if(match != null)
            num = parseInt(match[0]);
        else return str;
        str = str.slice(numLength + 5, -2);
        let oldStr = str;
        for(let i = 0; i < num; i++) {
        str = str.replace(/{{.+?}}/gi, replacer);
        returnString = returnString + str + ',';
        str = oldStr;
        }
        let result = '[' + returnString.substring(0, returnString.length -1) + ']';
        return result;

    }
    public generateObject(obj: any): any {
        let str: any = JSON.stringify(obj);
        str = str.replace(/\[\[.+?\]\]/gi, this.repeater);
        console.log(str);
        str = str.replace(/{{.+?}}/gi, replacer);
        console.log(str);
        return JSON.parse(str);
    }




}

function rBool(){
    let num = getRandomInt(0,1);
    if(num === 1)
       return "true";
   else
       return "false";
}

function rText(amt: string[]): string{
    return makeText(parseInt(amt[0]), parseInt(amt[1]));
}

function rChar(amt: string[]): string{
    return makeid(Number(amt[0]));
}

function rDate(){
   return (new Date().getTime() * Math.random()).toString()
}

function rFloat(arr: number[]){
   return getRandomFloat(arr[0], arr[1]).toPrecision(4).toString();
}

function rInt(arr: string[]) {
   return getRandomInt(parseInt(arr[0]), parseInt(arr[1])).toString()
}



function getRandomFloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }

  function makeid(length: number) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }

  function makeText(minWords: number, maxWords: number) {
    let tlt = getRandomInt(minWords, maxWords)
    let text = "";
    for(let i = 0; i < tlt; i++) {
        text += makeid(getRandomInt(1,10));
    }
    return text;

  }


  function replacer(str: string) {
   let tags: Array<ITags> = [
        { tag: 'bool' , func: rBool},
        { tag: 'date', func: rDate},
        { tag: 'int', func: (arr: Array<any>) => {
            return rInt(arr);
        }},
        { tag: 'float', func: (arr: Array<any>) => {
            return rFloat(arr);
        }},
        { tag: 'char', func: (arr: Array<any>) => {
            return rChar(arr);
        }},
        { tag: 'text', func: (arr: Array<any>) => {
            return rText(arr);
        }}
    ]

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
    if(pStart !== -1 && pEnd !== -1) {
        pStart += 1;
        paramList = str.substring(pStart, pEnd)
        paramList = paramList.split(',');
        str = str.substring(0, pStart-1);
    }
    for (let j = 0 ; j < tags.length; j++) {
        if(tags[j].tag === str) {
            if (paramList !== null) {
              return  tags[j].func(paramList)
            } else {
               return tags[j].func();
            }
         }
    }


}

let test = new MockService()
let obj = {test: '{{bool}}', val: '{{char(10)}}', items: [[20],[{'test1': '{{char(5)}}'}]], 'test1': 'blah'};

console.log(test.generateObject(obj));