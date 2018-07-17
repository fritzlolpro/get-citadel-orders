const Order = require('./ordersSucker')
const writeJsonToFile = require('./fileWriter')

/*
  refreshtoken: 'xxx',
  secret: 'yyy',
  clientid: 'zzz'
*/
// const inputTokens = require('./privateKeys.js')

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


const goonOrders = new Order()
goonOrders.structure = GoonHome;
goonOrders
  .getPriceData()
  .then((data) => writeJsonToFile(data, GoonHome))

// const ForgeOrders = new Order()
// ForgeOrders.structure = Forge
// ForgeOrders.callUrl = regionCallUrl
// ForgeOrders
//   .getPriceData()
//   .then((data) => writeJsonToFile(data, Forge))