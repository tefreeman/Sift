import { throws } from 'assert';
import * as fs from 'fs';
import { normalize } from 'path';

import { GenerateObject, getRandomInt } from './mock.obj';

const Loki = require('lokijs');
const brotli = require('brotli');

const nutrients = {
    calories:  '{{int(300,1400)}}', //Kcal
    fat:  '{{int(0,60)}}', //g
    fatTrans:  '{{int(0,60)}}', //g
    fatSat:   '{{int(0,60)}}', //g
    monoUnsaturated:  '{{int(0,60)}}', //g
    polyUnsaturated:  '{{int(0,60)}}', //g
    carb:  '{{int(0,100)}}', //g
    protein:  '{{int(0,80)}}', //g
    fiber:  '{{int(0, 25)}}', //g/ Liters
    cholesterol:  '{{int(0,500)}}', //mg
    vitaminA:  '{{int(0,500)}}', // iu
    vitaminB6:  '{{int(0,500)}}', //mg
    vitaminB12:  '{{int(0,500)}}', //mcg
    vitaminC:  '{{int(0,500)}}', //mg
    vitaminD:  '{{int(0,500)}}', // iu
    vitaminE:  '{{int(0,500)}}', // mg
    vitaminK:  '{{int(0,500)}}', //mcg
    thiamin:  '{{int(0,500)}}', //mg
    riboflavin: '{{int(0,500)}}', //mg
    niacin: '{{int(0,500)}}', //mg
    pantothenicAcid:  '{{int(0,500)}}', //mg
    folate:  '{{int(0,500)}}', //mcg
    calcium:  '{{int(0,500)}}', // mg
    iron:  '{{int(0,500)}}', // mg
    magnesium:  '{{int(0,500)}}', //mg
    phosphorus:  '{{int(0,500)}}', //mg
    potassium:  '{{int(0,500)}}', //mg
    sodium:  '{{int(0,3000)}}', //mg
    zinc:   '{{int(0,500)}}', //mg]
}

const c_nutrients = {
    a:  '{{int(300,1400)}}', //Kcal
    b:  '{{int(0,60)}}', //g
    c:  '{{int(0,60)}}', //g
    d:   '{{int(0,60)}}', //g
    e:  '{{int(0,60)}}', //g
    f:  '{{int(0,60)}}', //g
    g:  '{{int(0,100)}}', //g
    h:  '{{int(0,80)}}', //g
    i:  '{{int(0, 25)}}', //g/ Liters
    j:  '{{int(0,500)}}', //mg
    k:  '{{int(0,500)}}', // iu
    l:  '{{int(0,500)}}', //mg
    m:  '{{int(0,500)}}', //mcg
    o:  '{{int(0,500)}}', //mg
    p:  '{{int(0,500)}}', // iu
    q:  '{{int(0,500)}}', // mg
    r:  '{{int(0,500)}}', //mcg
    s:  '{{int(0,500)}}', //mg
    t: '{{int(0,500)}}', //mg
    u: '{{int(0,500)}}', //mg
    v:  '{{int(0,500)}}', //mg
    w:  '{{int(0,500)}}', //mcg
    y:  '{{int(0,500)}}', // mg
    x:  '{{int(0,500)}}', // mg
    z:  '{{int(0,500)}}', //mg
    0:  '{{int(0,500)}}', //mg
    1:  '{{int(0,500)}}', //mg
    2:  '{{int(0,3000)}}', //mg
    3:   '{{int(0,500)}}', //mg]
}
const ingredients = {
    'name': '{{char(4,14)}}',
}

const tags = {
    'name': '{{char(4,14)}}',
}

const item = {
    'name': '{{char(5,14)}}',
    'price': '{{float(4.0, 30.0)}}',
    'reviewCount': '{{int(1,1000)}}',
    'reviewScore': '{{float(1,5,2)}}',
    'mQty': '{{int(1,2)}}',
    'mUnit': 'g',
    'servingQty': '{{int(1,2)}}',
    'servingUnit': '{{char(4,10)}}',
    'isApproved': '{{int(0 ,1)}}',
    'tag_ids': [],
    'nutrition_id': -1,
    'restaurant_id': -1,
    'ingredient_ids': []
}

const restaurant =
    {
    'name': '{{char(5,14)}}',
    'phone': '{{phone()}}',
    'address': '{{text(2,4)}}',
    'distance': -1,
    'type':  '{{char(5,14)}}',
    'price': '{{int(1,3)}}',
    'reviewCount': '{{int(1,1000)}}',
    'reviewScore': '{{float(1,5,2)}}',
    'lastUpdated': '{{date()}}',
    'isApproved': '{{int(0,1)}}',
    'coords': {
        'lat': '{{float(33.00696069, 33.40696069, 8)}}',
        'lon': '{{float(-87.7642943, -87.3642943, 8)}}',
    },
    'tag_ids': [],
}



//let text = brotli.decompress(fs.readFileSync('jsonTestFile500'));

const db = new Loki('localData', {
  verbose: true,
  disableMeta: true,
  disableChangesApi: true,

  destructureDelimiter: '='
});

let itemsCol = db.addCollection('items');
let restaurantsCol = db.addCollection('restaurants');
let nutrientsCol = db.addCollection('nutrients');
let ingredientCol = db.addCollection('ingredients');
let tagsCol = db.addCollection('tags');
let cacheCol = db.addCollection('cache');
let filtersCol = db.addCollection('filters');


// This function handles arrays and objects

var tryToNumber = function (obj) {
    for (var property in obj) {
        if (obj.hasOwnProperty(property) && obj[property] != null) {
            if (obj[property].constructor == Object) {
                tryToNumber(obj[property]);
            } else if (obj[property].constructor == Array) {
                for (var i = 0; i < obj[property].length; i++) {
                    tryToNumber(obj[property][i]);
                }
            } else {
                obj[property] = (isNaN(obj[property])) ? obj[property] : Number(obj[property]);
            }
        }
    }
    return obj;
}
let amtTlt = 400;
let itemAmt = 50;
let ingredientIndex = 1000;

for (let p = 0; p < ingredientIndex; p++) {
    ingredientCol.insert(tryToNumber(GenerateObject(ingredients)));
}

for (let i = 0; i < amtTlt; i++) {
    let restaurantsItemsArr = []
    for (let j = 0; j < itemAmt; j++) {
        let ingredientIdsArr = []
        let tagIdsArr = []
        let ingredientAmt = getRandomInt(5,20);
        for(let k = 0; k < ingredientAmt; k++) {
            ingredientIdsArr.push(getRandomInt(1,1000));
            tagIdsArr.push(getRandomInt(1,1000));
        }

        let nutrient = tryToNumber(GenerateObject(nutrients));
        let nutriID = nutrientsCol.insert(nutrient)['$loki'];

        let itemWId = item;
        itemWId['nutrition_id'] = nutriID;
        itemWId['ingredient_ids'] = ingredientIdsArr;
        itemWId['restaurant_id'] = i;
        itemWId['tag_ids'] = tagIdsArr;

        let itemObj = tryToNumber(GenerateObject(itemWId))
        let tempItem_id = itemsCol.insert(itemObj)['$loki'];
    }
    // for restaurants
    let tagIdsArr1 = []
    let tagAmt = getRandomInt(5,20);
    for(let k = 0; k < tagAmt; k++) {
        tagIdsArr1.push(getRandomInt(1,1000));
    }

    let restaurantWId = restaurant;
    restaurantWId['tag_ids'] = tagIdsArr1;

    let restaurantObj = tryToNumber(GenerateObject(restaurantWId));
    restaurantsCol.insert(restaurantObj);
}


console.log('starting normailization');
normalizeDB([itemsCol, restaurantsCol, nutrientsCol]);
console.log('done normalizing');

let itemIndices = ['name', 'price', 'reviewCount', 'reviewScore', 'nutrition_id', 'restaurant_id', 'tag_ids', 'ingredient_ids' ]
let restaurantIndices =['price', 'reviewCount', 'reviewScore', 'name', 'item_ids', 'tag_ids', 'type', 'distance']
let nutrientIndices =
[
    'calories',
    'fat',
    'fatTrans',
    'fatSat',
    'monoUnsaturated',
    'polyUnsaturated',
    'carb',
    'protein',
    'fiber',
    'cholesterol',
    'vitaminA',
    'vitaminB6',
    'vitaminB12',
    'vitaminC',
    'vitaminD',
    'vitaminE',
    'vitaminK',
    'thiamin',
    'riboflavin',
    'niacin',
    'pantothenicAcid',
    'folate',
    'calcium',
    'iron',
    'magnesium',
    'phosphorus',
    'potassium',
    'sodium',
    'zinc', 
]
let ingredientIndices = ['name'];
let tagsIndices = ['name'];
let cacheIndices = ['name', 'type'];

addIndices(itemsCol, itemIndices);
addIndices(restaurantsCol, restaurantIndices);
addIndices(nutrientsCol,nutrientIndices);

addIndices(ingredientCol, ingredientIndices);
addIndices(tagsCol, tagsIndices);
addIndices(cacheCol, cacheIndices);

addIndices(filtersCol, ['name']);

cacheCol.ensureAllIndexes(true);
itemsCol.ensureAllIndexes(true);
nutrientsCol.ensureAllIndexes(true);
restaurantsCol.ensureAllIndexes(true);
tagsCol.ensureAllIndexes(true);
ingredientCol.ensureAllIndexes(true);

let textDb = db.serialize();
fs.writeFileSync('jsonTestFile500', textDb);

db.close();



function normalizeDB(collection) {
    for (const col of collection ) {
        let obj = col.data[0];
    for (let prop in obj) {
        if (typeof(obj[prop]) === 'number' && prop !== '$loki' && prop.substr(prop.length - 2) !== 'id') {
            normalizeProp(col, prop);
        }
    }
}
}

function normalizeProp(col, field: string) {

    let min = col.min(field);
    let max = col.max(field);
    let mode = col.mode(field);
    let stdDev = col.stdDev(field);
    let median = col.median(field);
    let avg = col.avg(field);
    
   if (isNaN(min) || isNaN(max) || isNaN(stdDev) || isNaN(median) || isNaN(avg) || avg <= 1) {
       return;
   }

    let roundTo = (numDigits(max) - numDigits(min)) + 2
    col.findAndUpdate({}, (obj) => { obj[field] = Number(normalizeVar(obj[field], min, max).toFixed(roundTo)); return obj})

    let dataCache = roundObject({name: col.name + '.' + field, type: 'dataCache', collection: col.name, field: field, min: min, max: max, mode: mode, stdDev: stdDev, median: median, avg: avg }, 6);
    cacheCol.insert(dataCache);
    return;
}


function normalizeVar(x: number, min: number, max: number) {
    return (x - min) / (max - min);
}

function roundObject(obj: object, dPts: number) {
    for (let prop in obj) {
        if (typeof(obj[prop]) === 'number') {
            obj[prop] = Number(obj[prop].toFixed(dPts));
        }
    }
    console.log(obj);
    return obj;
}

function numDigits(x) {
    x = Number(String(x).replace(/[^0-9]/g, ''));
    return (log10((x ^ (x >> 31)) - (x >> 31)) | 0) + 1;
  }

  function log10(val) {
    return Math.log(val) / Math.log(10);
  }

  function addIndices(col, indices: Array<string>) {
      console.log('adding ' + indices +  ' Indices');
      for (const string of indices) {
      col.ensureIndex(string, true);
      }
  }