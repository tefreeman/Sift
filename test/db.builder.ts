import { throws } from 'assert';
import * as fs from 'fs';

import { GenerateObject } from './mock.obj';

const Loki = require('lokijs');

const nutrients = {
    calories: '{{int(300,1400)}}', //Kcal
    fat: '{{int(0,60)}}', //g
    carb: '{{int(0,100)}}', //g
    protein: '{{int(0,80)}}', //g
    fiber: '{{int(0, 25)}}', //g/ Liters
    vitaminB: '{{int(0,500)}}', //g
    vitaminC: '{{int(0,500)}}', //g
    vitaminD: '{{int(0,500)}}', //g
    vitaminE: '{{int(0,500)}}', //g
    calcium: '{{int(0,500)}}', //g
    iron: '{{int(0,500)}}', //g
    magnesium: '{{int(0,500)}}', //g
    Potassium: '{{int(0,500)}}', //g
    sodium: '{{int(0,3000)}}', //g
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

const db: LokiConstructor = new Loki('localData', {
  verbose: true,
  destructureDelimiter: '='
});

let itemsCol = db.addCollection('items', {
    indices: ['ingredients']
});
let restaurantsCol = db.addCollection('restaurants', {
    indices: ['price', 'reviewCount', 'reviewScore', 'name']
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


fs.writeFileSync('jsonTestFile500',db.serialize());
db.close();