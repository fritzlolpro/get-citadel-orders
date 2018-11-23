require('dotenv').config();
const Order = require('./ordersSucker')
const writeJsonToFile = require('./fileWriter')
const { goonDB, forgeDB } = require('./dbConnector')






const comparePrices = async() => {

    const goonOrders = Array.from(await goonDB.find({}))
    const goonOrderIdList = Array.from(new Set(goonOrders.map(x => x.order.typeId)))

    const query = {
        'order.typeId': { $nin: goonOrderIdList }
    }

    const forgeOrders = await forgeDB.find(query)
    const forgeOrderIdList = Array.from(new Set(forgeOrders.map(x => x.order.typeId)))

    // 1. group all orders with same type ID

    const orderMerger = (idList, orders) => {
        // !!! FUCK PIPELINES, DONT NEED THEM AS I CAN O(n) THIS SHIT
        let separatedOrders = {}
        let existingItemsKeys = []

        orders.forEach(item => {
            const order = item.order


            if (existingItemsKeys.includes(order.typeId)) {
                console.log('hui')
            } else {
                separatedOrders[order.typeId] = {}
                separatedOrders[order.typeId][order.body.isBuy ? 'buy' : 'sell'] = {
                    price: [order.body.price]
                }
                existingItemsKeys.push(order.typeId)
            }
        })
        console.log(separatedOrders)
            // return separatedOrders
    }

    const cutTooSmall = prices => prices.sort((a, b) => a - b).map((price, i, arr) => {
        if (price * 10 < arr[arr.length - 1]) {
            arr[arr.length - 1] = ''
        }
        return price
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
//     .getPriceData()
//     .then((data) => {
//         writeJsonToFile(data, GoonHome)
//     })

// const ForgeOrders = new Order()
// ForgeOrders.structure = Forge
// ForgeOrders.callUrl = regionCallUrl
// ForgeOrders
//     .getPriceData()
//     .then((data) => {
//         writeJsonToFile(data, Forge)

//     })

comparePrices()