
const fetch = require('node-fetch')
const base64 = require('base-64');
const moment = require('moment');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
dbUrl = require('./index.js')
exports.currentDate = moment()
  .format("MM DD YY, HH")
  .toString()
  .replace(/\,|\s+/g, '-')

exports.getNewestDBName = name => currentDate => name + '_' + currentDate
/*
  refreshtoken: 'xxx',
  secret: 'yyy',
  clientid: 'zzz'
*/

const inputTokens = require('./privateKeys.js')

const MongoClient = require('mongodb').MongoClient
const assert = require('assert');

// Connection URL
mongoose.connect(dbUrl);
// const dbUrl = 'mongodb://localhost:27017/market';

// Use connect method to connect to the server
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to DB!')
});

const storeSchema = new mongoose.Schema({
  order: {
    typeId: Number,
    body: {
      duration: Number,
      isBuy: Boolean,
      issued: String,
      location: Number,
      minVolume: Number,
      orderId: Number,
      price: Number,
      range: String,
      volumeRemaining: Number,
      volumeTotal: Number
    }
  }
});

storeSchema.pre('save', function (next) {
  if (!this.isModified()) {
    next(); // skip it
    return; // stop this function from running
  }
});


class Order {
  constructor(structure) {
    this.structure = null,
      this.pageCount = null,
      this.currentPage = 1,
      this.finalPriceData = [],
      this.callUrl = 'https://esi.tech.ccp.is/latest/markets/structures/'
    this.authUrl = 'https://login.eveonline.com/oauth/token?grant_type=refresh_token&refresh_token='
  }

  get authUrl() {
    return this._authUrl
  }

  set authUrl(url) {
    this._authUrl = url
  }

  set callUrl(url) {
    this._callUrl = url
  }

  get callUrl() {
    return this._callUrl
  }

  set structure(structure) {
    this._structure = structure
  }

  get structure() {
    return this._structure
  }

  set pageCount(val) {
    this._pageCount = val
  }

  get pageCount() {
    return this._pageCount
  }

  set currentPage(val) {
    this._currentPage = val
  }
  get currentPage() {
    return this._currentPage
  }

  set finalPriceData(val) {
    this._finalPriceData = val
  }

  get finalPriceData() {
    return this._finalPriceData
  }

  async getPriceData() {

    return await this
      .getStructureMarketOrders(this.structure, this.currentPage)
      .then(() => {

        return this.finalPriceData
      })

  }

  async writeToBase(data, structureData) {

    const { name } = structureData
    const OrderDB = mongoose.model(`${getNewestDBName(name)(currentDate)}`, storeSchema);
    return OrderDB.insertMany([...data])
  }

  async getStructureMarketOrders(structureData, page) {
    const { name, placeId, queryModificator = '' } = structureData
    const config = await this.getAccessToken(inputTokens);

    const url = `${this.callUrl}${placeId}${queryModificator}/?datasource=tranquility&page=${page}`

    const parameters = {
      method: "get",
      headers: {
        'Authorization': 'Bearer ' + config.access_token
      }
    };

    const jsonFeed = await fetch(url, parameters).then(bulk => {
      return {
        body: bulk.json(),
        headers: bulk.headers
      }
    })
    // console.log(structureData) console.log(jsonFeed)
    const json = await jsonFeed.body;
    // console.log(json)
    const pagesInResponce = await parseInt(jsonFeed.headers.get('x-pages'))
    if (this.pageCount === null) {
      this.pageCount = pagesInResponce
    }
    // console.log(json)
    const result = this.formPriceDataBulk(json, page === 1, name)
    console.log(this.pageCount, this.currentPage)
    while (this.currentPage < this.pageCount) {
      this.currentPage++;
      this.finalPriceData = [
        ...this.finalPriceData,
        ...result
      ]
      // await result.map(elem => this.writeToBase(elem, this.structure))
      await this.writeToBase(result, this.structure)
      await this.getStructureMarketOrders(this.structure, this.currentPage)

    }
  }
  async getAccessToken(config) {

    const url = this.authUrl + config.refreshtoken;

    const code = base64.encode(config.clientid + ':' + config.secret);

    const headers = {
      'Authorization': 'Basic ' + code,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    const parameters = {
      'method': 'post',
      'headers': headers
    };
    const response = await fetch(url, parameters).then(bulk => bulk.json())

    const json = response;
    const access_token = json['access_token'];

    config.access_token = access_token;
    config.expires = Date.now() + 1200000

    return config;
  }

  formPriceDataBulk(priceList, shouldFormHeaders = false, name) {
    let prices = []
    // if (shouldFormHeaders) {
    //   prices.push([
    //     'duration',
    //     'buy',
    //     'issued',
    //     'location',
    //     'min volume',
    //     'order id',
    //     'price',
    //     'range',
    //     'typeid',
    //     'volume remaining',
    //     'total volume'
    //   ])
    // }

    for (const i in priceList) {

      const price = {
        order: {
          typeId: priceList[i].type_id,
          body: {
            duration: priceList[i].duration,
            isBuy: priceList[i].is_buy_order,
            issued: priceList[i].issued,
            location: priceList[i].location_id,
            minVolume: priceList[i].min_volume,
            orderId: priceList[i].order_id,
            price: priceList[i].price,
            range: priceList[i].range,
            volumeRemaining: priceList[i].volume_remain,
            volumetotal: priceList[i].volume_total
          }
        }
      };
      prices = [
        ...prices,
        ...[price]
      ]
    }
    return prices
  }

}

module.exports = Order