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
  const goonOrders = Array.from(await goonDB.find({}))
  const goonOrderIdList = Array.from(new Set(goonOrders.map(x => x.order.typeId)))

  const query = {
    'order.typeId': { $nin: goonOrderIdList }
  }

  const forgeOrders = await forgeDB.find(query)
  const forgeOrderIdList = Array.from(new Set(forgeOrders.map(x => x.order.typeId)))

  // 1. group all orders with same type ID

  const orderMerger = (idList, orders) => {
    // ! figure out why this shit works so sloow
    // TODO get sober, try mongo pipeline aggregations(???)
    const merge = (acc, curr) => ({
      typeId: curr.order.typeId,
      isBuy: curr.order.body.isBuy,
      price: acc.price ? acc.price.concat([curr.order.body.price]) : [].concat([curr.order.body.price]),
    })
    const separatedOrders = idList.map(id => ({
      [id]: {
        buy: orders.filter(order => order.order.typeId === id && order.order.body.isBuy).reduce(merge, {}),
        sell: orders.filter(order => order.order.typeId === id && !order.order.body.isBuy).reduce(merge, {})
      }
    }))
    // console.log(separatedOrders)
    return separatedOrders
  }

  const findPriceDifference = cutLarger => prices => prices.sort((a, b) => a - b).forEach((price, i) => {
    if (price * 10 > prices[prices.length - 1]) {

    }
  })

  orderMerger(goonOrderIdList, goonOrders)
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