const Order = require('./ordersSucker')
const { getNewestDBName, currentDate } = require('./ordersSucker')
const writeJsonToFile = require('./fileWriter')

const MongoClient = require('mongodb').MongoClient
const assert = require('assert');
const co = require('co')
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// Connection URL
module.exports dbUrl = 'mongodb://localhost:27017/market';


const orderComposer = (order) => {

}

const comparePrices = async () => {
  // todo remove co, build actual name with function, use mongoose to suck
  co(function* () {
    const db = yield MongoClient.connect(dbUrl)
    // console.log(db)
    const goonCollection = db.collection('Delve_07-22-18--02')
    const forgeCollection = db.collection('Forge_07-22-18--02')

    const goonOrderList = yield goonCollection.find().toArray()

    const goonTypeIds = goonOrderList.map(x => x.order['typeId'])

    const query = {
      'order.typeId': { $nin: goonTypeIds }
    }
    const forgeOrderList = yield forgeCollection.find(query).toArray()

    // const goodOrders =  forgeOrderList.map(forgeOrder => {
    //   const id = forgeOrder['typeId']
    //   const matchedGoonOrder = goonOrderList.filter(order => order['typeId'] === id)[0]

    //   const forgePrice = forgeOrder.order.id['price']
    //   const delvePrice = matchedGoonOrder.order[id]['price']

    //   if ((forgePrice * 1.2) <= delvePrice) {
    //     return {
    //       order: {
    //         typeId: id,
    //         fordge: {
    //           ...forgeOrder.order[id]
    //         },
    //         delve: {
    //           ...matchedGoonOrder.order[id]
    //         }
    //       }
    //     }
    //   }
    // })
    // console.log(goodOrders)

    const sliceUpper = (orderList) => {
      orderList.map(order => {

      })
    }


    console.log(forgeOrderList.filter(x => x.order['40337']))

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
  name: 'delve'
}

const Forge = {
  placeId: 10000002,
  name: 'forge',
  queryModificator: '/orders'
}


const structuresCallUrl = 'https://esi.tech.ccp.is/latest/markets/structures/'
const regionCallUrl = 'https://esi.evetech.net/latest/markets/'


const goonOrders = new Order()
goonOrders.structure = GoonHome;
goonOrders
  .getPriceData()
// .then((data) => {
//   writeJsonToFile(data, GoonHome)
// })

// const ForgeOrders = new Order()
// ForgeOrders.structure = Forge
// ForgeOrders.callUrl = regionCallUrl
// ForgeOrders
//   .getPriceData()
  // .then((data) => {
  //   writeJsonToFile(data, Forge)

  // })

// comparePrices()