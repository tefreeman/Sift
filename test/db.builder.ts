import { throws } from 'assert';
import * as fs from 'fs';

import { GenerateObject } from './mock.obj';

const Loki = require('lokijs');

const nutrients = {
    calories: '{{int(300,1400)}}', //Kcal
    fat: '{{int(0,60)}}', //g
    fatTrans: '{{int(0,60)}}', //g
    fatSat:  '{{int(0,60)}}', //g
    monoUnsaturated: '{{int(0,60)}}', //g
    polyUnsaturated: '{{int(0,60)}}', //g
    carb: '{{int(0,100)}}', //g
    protein: '{{int(0,80)}}', //g
    fiber: '{{int(0, 25)}}', //g/ Liters
    cholesterol: '{{int(0,500)}}', //mg
    vitaminA: '{{int(0,500)}}', // iu
    vitaminB6: '{{int(0,500)}}', //mg
    vitaminB12: '{{int(0,500)}}', //mcg
    vitaminC: '{{int(0,500)}}', //mg
    vitaminD: '{{int(0,500)}}', // iu
    vitaminE: '{{int(0,500)}}', // mg
    vitaminK: '{{int(0,500)}}', //mcg
    thiamin: '{{int(0,500)}}', //mg
    riboflavin:'{{int(0,500)}}', //mg
    niacin:'{{int(0,500)}}', //mg
    pantothenicAcid: '{{int(0,500)}}', //mg
    folate: '{{int(0,500)}}', //mcg
    calcium: '{{int(0,500)}}', // mg
    iron: '{{int(0,500)}}', // mg
    magnesium: '{{int(0,500)}}', //mg
    phosphorus: '{{int(0,500)}}', //mg
    potassium: '{{int(0,500)}}', //mg
    sodium: '{{int(0,3000)}}', //mg
    zinc:  '{{int(0,500)}}', //mg
}

const nutrientsCompressed = {
    a: '{{int(300,1400)}}', //Kcal
    b: '{{int(0,60)}}', //g
    c: '{{int(0,60)}}', //g
    d:  '{{int(0,60)}}', //g
    e: '{{int(0,60)}}', //g
    f: '{{int(0,60)}}', //g
    g: '{{int(0,100)}}', //g
    h: '{{int(0,80)}}', //g
    i: '{{int(0, 25)}}', //g/ Liters
    j: '{{int(0,500)}}', //mg
    k: '{{int(0,500)}}', // iu
    l: '{{int(0,500)}}', //mg
    m: '{{int(0,500)}}', //mcg
    n: '{{int(0,500)}}', //mg
    o: '{{int(0,500)}}', // iu
    p: '{{int(0,500)}}', // mg
    q: '{{int(0,500)}}', //mcg
    r: '{{int(0,500)}}', //mg
    s:'{{int(0,500)}}', //mg
    t:'{{int(0,500)}}', //mg
    u: '{{int(0,500)}}', //mg
    v: '{{int(0,500)}}', //mcg
    w: '{{int(0,500)}}', // mg
    y: '{{int(0,500)}}', // mg
    x: '{{int(0,500)}}', //mg
    z: '{{int(0,500)}}', //mg
    0: '{{int(0,500)}}', //mg
    1: '{{int(0,3000)}}', //mg
    2:  '{{int(0,500)}}', //mg
}
const item = {
    'name': '{{char(5,14)}}',
    'mQty': '{{int(1,2)}}',
    'mUnit': 'grams',
    'servingQty': '{{int(1,2)}}',
    'servingUnit': '{{char(4,10)}}',
    'isApproved': '{{bool}}',
    'keys': [],
    'nutrition_id': 0,
    'ingredients': [
    '{{list(flour, sugar)}}',
    '{{list( sodium, chicken)}}',
    '{{list(milk, corn)}}',
    '{{list(steak,onion)}}'
    ,]
}

const itemCompressed = {
    'a': '{{char(5,14)}}',
    'b': '{{int(1,2)}}',
    'c': 'grams',
    'd': '{{int(1,2)}}',
    'e': '{{char(4,10)}}',
    'f': '{{bool}}',
    'g': [],
    'nutrition_id': 0,
    'h': [
    '{{list(flour, sugar)}}',
    '{{list( sodium, chicken)}}',
    '{{list(milk, corn)}}',
    '{{list(steak,onion)}}'
    ,]
}

const restaurant =
    {
    'name': '{{char(5,14)}}',
    'phone': '{{phone()}}',
    'address': '{{text(2,4)}}',
    'price': '{{int(1,3)}}',
    'reviewCount': '{{int(1,1000)}}',
    'reviewScore': '{{float(1,5,2)}}',
    'lastUpdated': '{{date()}}',
    'isApproved': '{{bool}}',
    'coords': {
        'lat': '{{float(33.00696069, 33.40696069, 8)}}',
        'lon': '{{float(-87.7642943, -87.3642943, 8)}}'
    },
    'keys': [],
    'items_id': []
}

const restaurantCompressed = {
    'a': '{{char(5,14)}}',
    'b': '{{phone()}}',
    'c': '{{text(2,4)}}',
    'd': '{{int(1,3)}}',
    'e': '{{int(1,1000)}}',
    'f': '{{float(1,5,2)}}',
    'g': '{{date()}}',
    'h': '{{bool}}',
    'i': {
        'a': '{{float(33.00696069, 33.40696069, 8)}}',
        'b': '{{float(-87.7642943, -87.3642943, 8)}}'
    },
    'j': [],
    'items_id': []
}

const db: LokiConstructor = new Loki('localData', {
  verbose: true,
  disableMeta: true,
  disableChangesApi: true,

  destructureDelimiter: '='
});

let itemsCol = db.addCollection('items', {
    indices: ['ingredients', 'nutrition_id' ]
});
let restaurantsCol = db.addCollection('restaurants', {
    indices: ['price', 'reviewCount', 'reviewScore', 'name', 'items_id']
});
let nutrientsCol = db.addCollection('nutrients', {
    indices: ['calories', 'fat', 'carb', 'protein', 'fiber']
});

let amtTlt = 500;
let itemAmt = 60;
for (let i = 0; i < amtTlt; i++) {
    let restaurantsItemsArr = []
    for (let j = 0; j < itemAmt; j++) {
        let nutrient = GenerateObject(nutrients);
        let nutriID = nutrientsCol.insert(nutrient);
        let itemWId = item;
        itemWId['nutrition_id'] = nutriID['$loki'];
        let itemObj = GenerateObject(itemWId)
        let tempItem = itemsCol.insert(itemObj);
        restaurantsItemsArr.push(tempItem['$loki']);
    }
    let restaurantWId = restaurant;
    restaurantWId['items_id'] = restaurantsItemsArr;
    let restaurantObj = GenerateObject(restaurantWId);
    restaurantsCol.insert(restaurantObj);
}

itemsCol.ensureAllIndexes(true);
nutrientsCol.ensureAllIndexes(true);
restaurantsCol.ensureAllIndexes(true);


fs.writeFileSync('jsonTestFile500',db.serialize());
db.close();