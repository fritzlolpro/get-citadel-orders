require('dotenv').config();
const Order = require('./ordersSucker')
const writeJsonToFile = require('./fileWriter')
const { goonDB, forgeDB } = require('./dbConnector')






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
  const goonOrderIdList = Array.from(await goonDB.find({}).select('order.typeId -_id')).map(x => x.order.typeId)
  const query = {
    'order.typeId': { $nin: goonOrderIdList }
  }
  const forgeOrderList = await forgeDB.find(query)
  // 1. group all orders with same type ID
  const mergedGoonOrders = Array.from(await goonDB.find({}).select('order.typeId -_id')).map(x => x.order.typeId)
  const orderMerger = async (idList) => await idList.map(id => {
    return async () => Array.from(await goonDB.find({ 'order.typeId': id }))
    // reduce
  }).then(console.log(orderMerger(goonOrderIdList)))

  /*
    order: {
      typeID: xxxx,
      price: [all prices],
      vol: xxx,
      ...other fields
    }
  */
  // 2. in every order balance prices
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
//   })

// const ForgeOrders = new Order()
// ForgeOrders.structure = Forge
// ForgeOrders.callUrl = regionCallUrl
// ForgeOrders
//   .getPriceData()
//   .then((data) => {
//     writeJsonToFile(data, Forge)

//   })

comparePrices()