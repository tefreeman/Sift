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
    'item_ids': [],
}



//let text = brotli.decompress(fs.readFileSync('jsonTestFile500'));

const db: LokiConstructor = new Loki('localData', {
  verbose: true,
  disableMeta: true,
  disableChangesApi: true,

  destructureDelimiter: '='
});

let itemsCol = db.addCollection('items', {
    indices: ['name', 'price', 'reviewCount', 'reviewScore', 'nutrition_id', 'tag_ids', 'ingredient_ids' ]
});
let restaurantsCol = db.addCollection('restaurants', {
    indices: ['price', 'reviewCount', 'reviewScore', 'name', 'item_ids', 'tag_ids', 'type', 'distance']
});
let nutrientsCol = db.addCollection('nutrients', {
    indices: 
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
});

let c_nutrientsCol =  db.addCollection('nutrients', {
    indices: 
    [
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        'k',
        'l',
        'm',
        'o',
        'p',
        'q',
        'r',
        's',
        't',
        'u',
        'v',
        'w',
        'y',
        'x',
        'z',
        '0',
        '1',
        '2',
        'zinc', 
    ]
});
 
let ingredientCol = db.addCollection('ingredients', {
    indices: ['name']
});


let tagsCol = db.addCollection('tags', {
    indices: ['name']
});


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
let amtTlt = 500;
let itemAmt = 60;
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
        itemWId['tag_ids'] = tagIdsArr;

        let itemObj = tryToNumber(GenerateObject(itemWId))
        let tempItem_id = itemsCol.insert(itemObj)['$loki'];
        restaurantsItemsArr.push(tempItem_id);
    }
    // for restaurants
    let tagIdsArr1 = []
    let tagAmt = getRandomInt(5,20);
    for(let k = 0; k < tagAmt; k++) {
        tagIdsArr1.push(getRandomInt(1,1000));
    }

    let restaurantWId = restaurant;
    restaurantWId['items_id'] = restaurantsItemsArr;
    restaurantWId['tag_ids'] = tagIdsArr1;

    let restaurantObj = tryToNumber(GenerateObject(restaurantWId));
    restaurantsCol.insert(restaurantObj);
}

itemsCol.ensureAllIndexes(true);
nutrientsCol.ensureAllIndexes(true);
restaurantsCol.ensureAllIndexes(true);
tagsCol.ensureAllIndexes(true);
ingredientCol.ensureAllIndexes(true);


let textDb = db.serialize();
fs.writeFileSync('jsonTestFile500', textDb);

db.close();
