const Order = require('./ordersSucker')
const writeJsonToFile = require('./fileWriter')


// const MongoClient = require('mongodb').MongoClient
// const assert = require('assert');

// // Connection URL
// const dbUrl = 'mongodb://localhost:27017/market';

// // Use connect method to connect to the server

// writeToBase = async (data, structureData) =>  {
//   const {name} = structureData
//   MongoClient.connect(dbUrl, function(err, client) {
//     assert.equal(null, err);
//     console.log("Connected successfully to database");
//      const db = client.db('market');
//     db.collection(name).insertMany([{...data}], function(err, r) {
//       assert.equal(null, err);
//       assert.equal(1, r.insertedCount);

//       client.close();
//     });
// });

// }

const GoonHome = {
  placeId: 1022734985679,
  name: 'Goon_Capital'
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

const ForgeOrders = new Order()
ForgeOrders.structure = Forge
ForgeOrders.callUrl = regionCallUrl
ForgeOrders
  .getPriceData()
  .then((data) => {
    writeJsonToFile(data, Forge)

    })