import * as Loki from 'lokijs';

const db = new LokiConstructor('test', {
    verbose: true,
    destructureDelimiter: '=',
  });

  const col = db.addCollection('test', {
      indices: ['val', 'items.val' ]})

let amt = 100;

for (let i = 0; i < amt; i++) {
    let itemsArr = []
    for (let j = 0; j < amt; j++) {
        itemsArr.push({'val': Math.random() * 1000});
    }
    let obj = {
        'val' : Math.random() * 1000,
        'items': itemsArr
    }
    col.insert({
        'val' : Math.random() * 1000,
        'items': itemsArr
    })
}
