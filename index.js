const Order = require('./ordersSucker')
const writeJsonToFile = require('./fileWriter')


const MongoClient = require('mongodb').MongoClient
const assert = require('assert');
const co = require('co')
// Connection URL
const dbUrl = 'mongodb://localhost:27017/market';

// // Use connect method to connect to the server

const comparePrices = async () => {

  co(function*() {
    const db = yield MongoClient.connect(dbUrl)
    // console.log(db)
    const goonCollection = db.collection('Goon_Capital_07-21-18--13')
    const forgeCollection = db.collection('Forge_07-21-18--14')
    const goonOrderList = yield goonCollection.find().toArray()
    const goonTypeIds = goonOrderList.map(x => x['typeId'])
    const query = {
      typeId: { $nin: goonTypeIds }
    }
    const forgeOrderList = yield forgeCollection.find(query).toArray()
    // forgeOrderList.map(forgeOrder => {
    //   if (forgeOrder['typeId'] === )
    // })
    console.log(forgeOrderList.length)
    db.close()
  }).catch(error => console.log(error.stack))
  // const db = await mongo.MongoClient.connect(dbUrl)

  // // MongoClient.connect(dbUrl, function(err, client) {
  // //   assert.equal(null, err);
  // //   // console.log("Connected successfully to database");
  // //    const db = client.db('market');
  //   // db.collection(name).insertMany([{...data}], function(err, r) {
  //   //   assert.equal(null, err);
  //   //   assert.equal(1, r.insertedCount);


  //   // });
  // // const goonOrdersCursor = db.collection('Goon_Capital').find()

  // //   const goonOrderList = await goonOrdersCursor.next()
  // //   console.log(goonOrderList)
  // console.log(db)
  //   db.close();
  // })
}


const GoonHome = {
  placeId: 1022734985679,
  name: 'Delve'
}

const Forge = {
  placeId: 10000002,
  name: 'Forge',
  queryModificator: '/orders'
}


const structuresCallUrl = 'https://esi.tech.ccp.is/latest/markets/structures/'
const regionCallUrl = 'https://esi.evetech.net/latest/markets/'


// const goonOrders = new Order()
// goonOrders.structure = GoonHome;
// goonOrders
//   .getPriceData()
//   .then((data) => {
//     writeJsonToFile(data, GoonHome)
//     })

// const ForgeOrders = new Order()
// ForgeOrders.structure = Forge
// ForgeOrders.callUrl = regionCallUrl
// ForgeOrders
//   .getPriceData()
//   .then((data) => {
//     writeJsonToFile(data, Forge)

//     })

// comparePrices()