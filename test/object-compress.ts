const obj =
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
    'tag_ids': [{'test': 1, 'test1': 2}],
}

function renameObjectKey(oldObj, oldName, newName) {
    const newObj = {};

    Object.keys(oldObj).forEach(key => {
        const value = oldObj[key];

        if (key === oldName) {
            newObj[newName] = value;
        } else {
            newObj[key] = value;
        }
    });

    return newObj;
}

function nextId(count: number) {
    const possible =[
        'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
        '0','1','2','3','4','5','6','7','8','9',
        'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
        'ab', 'ac', 'ad', 'ae', 'af', 'ag', 'ah', 'ai', 'aj', 'ak', 'al', 'am', 'an', 'ao', 'ap'
        ];
    
    return possible[count];
}


function compressJObject(obj: object, keys= [], count = 0, wantKeys = false): any {
    for (var property in obj) {
        if (obj.hasOwnProperty(property) && obj[property] != null) {
                keys.push(property);
                obj = renameObjectKey(obj, property, nextId(count));
                property = nextId(count);
                count++;
            } 
            if (obj[property].constructor == Object) {
                obj[property] = compressJObject(obj[property], keys);
            }
            if (obj[property].constructor == Array) {
                for (var i = 0; i < obj[property].length; i++) {
                    obj[property][i] = compressJObject(obj[property][i], keys);
                }
            } 
    }
    if(wantKeys === true)
        return [obj, keys];
    else
        return obj;
}

function deCompressJObject(obj: object, keys: any[], count: any= 0) {
    for (var property in obj) {
        if (obj.hasOwnProperty(property) && obj[property] != null) {
                obj = renameObjectKey(obj, property, keys[count]);
                property =  keys[count]
                count++;
            } 
            if (obj[property].constructor == Object) {
                let result = deCompressJObject(obj[property], keys, count);
                obj[property] = result[0];
                count = result[1];
            }
            if (obj[property].constructor == Array) {
                for (var i = 0; i < obj[property].length; i++) {
                    let result = deCompressJObject(obj[property][i], keys, count);
                    obj[property][i] = result[0];
                    count = result[1];
                }
            } 
    }
    return [obj, count];
}

let test = compressJObject(obj, [], 0, true);
console.log(test[1]);
let test1 = deCompressJObject(test[0], test[1]);
console.log(test1);