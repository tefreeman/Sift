const distance = require('fast-haversine');
const geolib = require('geolib');

// additional Overlap for the user
const OVERLAP_BOUNDRY_DISTANCE = 10;



//TODO load mongodb and take resturant corods and put them into seperate mongo collection


// get all coords in united states
gpsObj = []
let id = 0;
let lastCord;
let maxDist = -1;
let leastDist = 999999999;
for (let i = 22.0; i < 50.0; i = i += 0.25){
    for(let j = -130.0; j < -60.0; j += 0.25) {
        let myKey = `${i}${j}`;
        gpsObj.push({[myKey]: id});
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

let searchDistance = ((maxDist/1000)) + OVERLAP_BOUNDRY_DISTANCE;
let userMinRestaurants = (((maxDist/1000) + OVERLAP_BOUNDRY_DISTANCE) /2);
console.log('dbSearchDistance: ', searchDistance, ' userMinDistance: ', userMinRestaurants);
console.log('max distance:', maxDist/1000, ' min distance: ', leastDist/1000);
//console.log(gpsObj);

// Load MongoDB
// remove all duplicates
// gpsQuery and get all within minDistance of edge

