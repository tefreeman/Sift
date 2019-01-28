import * as timsort from 'timsort';

let times = 10000
let maxRandomValue = 100000
let arr = [];



let start = new Date().getTime();
for (let i = 0; i < times; i++) {
    arr.push(Math.random() *  maxRandomValue);
    }
timsort.sort(arr);






let end = new Date().getTime() - start;
console.log(end);