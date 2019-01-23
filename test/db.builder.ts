import { throws } from 'assert';
import * as fs from 'fs';

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
    zinc:   '{{int(0,500)}}', //mg
}

const ingredients = {
    'name': '{{char(4,14)}}',
}

const item = {
    'name': '{{char(5,14)}}',
    'mQty': '{{int(1,2)}}',
    'mUnit': 'g',
    'servingQty': '{{int(1,2)}}',
    'servingUnit': '{{char(4,10)}}',
    'isApproved': '{{int(0 ,1)}}',
    'keys': [],
    'nutrition_id': -1,
    'ingredient_ids': []
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
    'isApproved': '{{int(0,1)}}',
    'coords': {
        'lat': '{{float(33.00696069, 33.40696069, 8)}}',
        'lon': '{{float(-87.7642943, -87.3642943, 8)}}',
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


//let text = brotli.decompress(fs.readFileSync('jsonTestFile500'));

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

let ingredientCol = db.addCollection('ingredients', {
    indices: ['name']
});


let amtTlt = 500;
let itemAmt = 60;
let ingredientIndex = 1000;

for (let p = 0; p < ingredientIndex; p++) {
    ingredientCol.insert(GenerateObject(ingredients));
}

for (let i = 0; i < amtTlt; i++) {
    let restaurantsItemsArr = []
    for (let j = 0; j < itemAmt; j++) {
        let ingredientIdsArr = []
        let ingredientAmt = getRandomInt(5,20);
        for(let k = 0; k < ingredientAmt; k++) {
            ingredientIdsArr.push(getRandomInt(1,1000));
        }

        let nutrient = GenerateObject(nutrients);
        let nutriID = nutrientsCol.insert(nutrient)['$loki'];

        let itemWId = item;
        itemWId['nutrition_id'] = nutriID;
        itemWId['ingredient_ids'] = ingredientIdsArr;

        let itemObj = GenerateObject(itemWId)
        let tempItem_id = itemsCol.insert(itemObj)['$loki'];
        restaurantsItemsArr.push(tempItem_id);
    }
    let restaurantWId = restaurant;
    restaurantWId['items_id'] = restaurantsItemsArr;
    let restaurantObj = GenerateObject(restaurantWId);
    restaurantsCol.insert(restaurantObj);
}

itemsCol.ensureAllIndexes(true);
nutrientsCol.ensureAllIndexes(true);
restaurantsCol.ensureAllIndexes(true);
let textDb = db.serialize();
fs.writeFileSync('jsonTestFile500.bin', textDb);

db.close();
