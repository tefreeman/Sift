type Type = 'number' | 'text' | 'object' | 'array';

interface ITags {
    tag: string, func: any
}

export function GenerateObject(obj: any): any {
    let str: any = JSON.stringify(obj);
    str = str.replace(/\[\[.+\]\]/gi, repeater);
    str = str.replace(/{{.+?}}/gi, replacer);
    return  JSON.parse(str);
}

    function repeater(str: any) {
        let num: number;
        let returnString: any = "";
        let match = str.match(/(?!\[)(\d+)(?=])/);
        let numLength = match[0].length;
        if(match != null)
            num = parseInt(match[0]);
        else {
            return str; 
        }
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
function rPhone(): string{
    return makePhone();
}

function rChar(amt: string[]): string{
        if (amt.length == 1)
    return makeid(Number(amt[0]));
        else
        return makeid(Number(amt[0]),Number(amt[1]));
}


function rDate(){
   return (new Date().getTime() * Math.random()).toString()
}

function rList<T>(arr: T[]){
    return String(getRandomItemList(arr));
 }
function rFloat(arr: number[]){
   return getRandomFloat(Number(arr[0]), Number(arr[1])).toFixed(arr[2]);
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

  function getRandomItemList<T>(arr: Array<T>) {
      return arr[getRandomInt(0, arr.length)];
  }
  function makeid(length: number, max?: number) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    if(max) {
        length = getRandomInt(length, max);
    }
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }

  function makePhone() {
    var text = "";
    var possible1 = "123456789";
    var possible = "0123456789";
    text += possible1.charAt(Math.floor(Math.random() * possible1.length));
    for (var i = 0; i < 9; i++)
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
        }}, 
        { tag: 'phone', func: rPhone},
        { tag: 'list', func:<T> (arr: Array<T>) => {
            return rList(arr);
        }}, 
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
