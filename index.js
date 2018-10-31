bconst Order = require('./ordersSucker')
const { getNewestDBName, currentDate } = require('./ordersSucker')
const writeJsonToFile = require('./fileWriter')

const MongoClient = require('mongodb').MongoClient
const assert = require('assert');
const co = require('co')
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// Connection URL
const dbUrl = 'mongodb://localhost:27017/market';


const orderComposer = (order) => {

}
const goonDB = mongoose.model(`${getNewestDBName('Delve')(currentDate)}`)
const forgeDB = mongoose.model(`${getNewestDBName('Forge')(currentDate)}`)


const comparePrices = async () => {
  // todo remove co, build actual name with function, use mongoose to suck
  // co(function* () {
  //   const db = yield MongoClient.connect(dbUrl)
  //   // console.log(db)
  //   const goonCollection = db.collection('Delve_07-22-18--02')
  //   const forgeCollection = db.collection('Forge_07-22-18--02')

  //   const goonOrderList = yield goonCollection.find().toArray()

  //   const goonTypeIds = goonOrderList.map(x => x.order['typeId'])

  //   const query = {
  //     'order.typeId': { $nin: goonTypeIds }
  //   }
  //   const forgeOrderList = yield forgeCollection.find(query).toArray()

   

  //   const sliceUpper = (orderList) => {
  //     orderList.map(order => {

  //     })
  //   }


  //   console.log(forgeOrderList.filter(x => x.order['40337']))

  //   db.close()
  // }).catch(error => console.log(error.stack))
  const goonOrderList = await goonDB.find().toArray()
  const goonTypeIds = goonOrderList.map(x => x.order['typeId'])
  const query = {
        'order.typeId': { $nin: goonTypeIds }
      }
  const forgeOrderList = await forgeCollection.find(query).toArray()
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