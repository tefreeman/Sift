const distance = require('fast-haversine');
const geolib = require('geolib');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

//avl tree
const AVLTree = require('avl');

    


// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'yelp';

// Create a new MongoClient
const client = new MongoClient(url, { useNewUrlParser: true });



function getYelpCoords(dbName) {

    return new Promise( (resolve) => {

        // Use connect method to connect to the Server
        client.connect(function(err) {
            assert.equal(null, err);
            console.log("Connected successfully to server");
        
            const db = client.db(dbName);
        
            // Get the documents collection
            const collection = db.collection('coords');
            // Find some documents
            collection.find({}).toArray(function(err, docs) {
                assert.equal(err, null);
                // init Tree with custom compare function
                const tree = new AVLTree((a, b) => 
                {
                    if (a == b) {
                        return 0;
                    } else if (a < b) {
                        return -1;
                    } else {
                        return 1;
                    }
                }, true);
                let total = 0;
                for(let j = 0; j < docs.length; j++) {
                    let doc = docs[j];
                    for (let i = 0; i < doc['items'].length; i++) {
                        total++;
                        tree.insert(doc['items'][i]['bizId'], doc['items'][i]);
                        
                    }
                }

                client.close();
                console.log(` ${total - tree.size} duplicates`)
                resolve(tree);
            });
        });

    });
}

function cleanCategories(cats) {
    let arr = [];
    for(let i = 0; i < cats.length; i++) {
    arr.push(cats[i]['title']);
    }
    return arr;
}
// gets rid of useless fields and storage rdy form
let count = 0
function clean(dirty) {
    const time = new Date().getTime();
try {
    let keys = cleanCategories(dirty.searchResultBusiness['categories']);
    obj = {
        'address': dirty.searchResultBusiness['formattedAddress'],
        'location': {'type': 'Point', 'coordinates': [dirty['loc']['longitude'], dirty['loc']['latitude']]},
        'isApproved': true,
        'items': [],
        'keys': keys,
        'lastUpdated': time,
        'name': dirty.searchResultBusiness['name'],
        'phone': dirty.searchResultBusiness['phone'],
        'price': dirty.searchResultBusiness['priceRange'],
        'reviewCount': dirty.searchResultBusiness['reviewCount'],
        'reviewScore': dirty.searchResultBusiness['rating']
    }
    return obj;
} catch (e) {
    //console.log(e);
    count++;
    return null;
}
}

function insertRestaurantsFromCoords(){
    return new Promise((resolve) => {
        getYelpCoords('yelp').then((tree) => {
            let cleanRestaurants = []
            tree.forEach( (node) => {
                let cleaned = clean(node.data) ;
                if(cleaned != null){
                    cleanRestaurants.push(cleaned);
                }
            });
        
            client.connect(function(err) {
                assert.equal(null, err);
                console.log("Connected successfully to server");
            
                const db = client.db('places');
            
                // Get the documents collection
                const collection = db.collection('restaurants');
        
                collection.insertMany(cleanRestaurants, function(err, result) {
                    assert.equal(err, null);
                    assert.equal(cleanRestaurants.length, result.result.n);
                    assert.equal(cleanRestaurants.length, result.ops.length);
        
                    console.log(`Inserted ${cleanRestaurants.length} documents into the collection`);
                    
                    collection.createIndex({ 'location' : "2dsphere" } ).then((res)=> {
                        console.log(res);
                    }, (err) => {
                        console.log(err);
                    })

                    client.close();
                    resolve();
                  });
            });
        });
    })
  
}









//TODO load mongodb and take resturant corods and put them into seperate mongo collection

// additional Overlap for the user
const OVERLAP_BOUNDRY_DISTANCE = 10;
// get all coords in united states
function getAllCoordsUS() {
    gpsObj = []
    let id = 0;
    let lastCord;
    let maxDist = -1;
    let leastDist = 999999999;
    for (let i = 22.0; i < 50.0; i  = i + 0.25000){
        for(let j = -130.0; j < -60.0; j = j+ 0.25000) {
            let location = [j,i];
            let myKey = `${j}-${i}`;
            gpsObj.push({'key': myKey, 'location': location});
            id++;
    
            if(lastCord) {
                let dist = distance({'lat': i, 'lon': j}, lastCord);
                if(maxDist < dist) {
                    maxDist = dist;
                }
                if(leastDist > dist) {
                    leastDist = dist;
                }
            }
    
            lastCord = {'lat': i, 'lon': j};
        }
        lastCord = null;
    }
    let searchDistance = ((maxDist)) + (OVERLAP_BOUNDRY_DISTANCE * 1000);
    let userMinRestaurants = (((maxDist) + (OVERLAP_BOUNDRY_DISTANCE * 1000) /2));
    console.log('dbSearchDistance: ', searchDistance, ' userMinDistance: ', userMinRestaurants);
    console.log('max distance:', maxDist, ' min distance: ', leastDist);

    return([gpsObj, searchDistance]);
}


function fillGrid() {

    return new Promise((resolve) => {

        client.connect(function(err) {
            assert.equal(null, err);
            console.log("Connected successfully to server");
        
            const db = client.db('places');
        
            // Get the documents collection
            const collection = db.collection('restaurants');

            collection.find({}).toArray(function(err, docs) {
                let obj = getAllCoordsUS();
                let coords = obj[0];
                let maxDistance = obj[1];

            for(let i = 0; i < 50; i++) {
                collection.find({ 'location':   {
                     '$geoWithin': { '$centerSphere': [[-88, 30], (maxDistance/ 1000 )/ 6378.15214 ] } 
                } }).toArray(function(err, docs) {
                if (err) {console.log(err);}
                    console.log(docs);
                    coords[i]['items'] = docs;
                    })
                }
           // client.close();
            resolve();
            })
        })
    }) 
}

fillGrid().then((d) => {console.log(d)});




// Load MongoDB
// remove all duplicates
// gpsQuery and get all within minDistance of edge



