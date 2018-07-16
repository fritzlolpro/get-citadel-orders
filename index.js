require('node-import');
const jsonFormat = require('json-format');
const fs = require('fs');
const converter = require('json-2-csv');
const fetch = require('node-fetch')
require('node-google-apps-script')
const base64 = require('base-64');

const GoonHome = {
  citadelID: 1022734985679,
  name: 'Goon_Capital'
}
const moment = require('moment');
const currentDate = moment()
  .format("MM DD YY, HH")
  .toString()
  .replace(/\,|\s+/g, '-')
/*
  refreshtoken: 'xxx',
  secret: 'yyy',
  clientid: 'zzz'
*/
const inputTokens = require('./privateKeys.js')
const authUrl = 'https://login.eveonline.com/oauth/token?grant_type=refresh_token&refresh_token='
const structuresCallUrl = 'https://esi.tech.ccp.is/latest/markets/structures/'

class Order {
  constructor(structure) {
    this.structure = null,
    this.pageCount = null,
    this.currentPage = 1,
    this.finalPriceData = []
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

  async getStructureMarketOrders(structureData, page) {
    const {citadelID} = structureData
    const config = await this.getAccessToken(inputTokens);

    const url = structuresCallUrl + citadelID + '/?datasource=tranquility&page=' + page;

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
    const result = this.formPriceDataBulk(json, page === 1)
    console.log(this.pageCount, this.currentPage)
    while (this.currentPage < this.pageCount) {
      this.currentPage++;
      this.finalPriceData = [
        ...this.finalPriceData,
        ...result
      ]
      await this.getStructureMarketOrders(this.structure, this.currentPage)

    }
  }
  async getAccessToken(config) {

    const url = authUrl + config.refreshtoken;

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

  formPriceDataBulk(priceList, shouldFormHeaders = false) {
    let prices = []
    if (shouldFormHeaders) {
      prices.push([
        'duration',
        'buy',
        'issued',
        'location',
        'min volume',
        'order id',
        'price',
        'range',
        'typeid',
        'volume remaining',
        'total volume'
      ])
    }

    for (const i in priceList) {

      const price = [
        priceList[i].duration,
        priceList[i].is_buy_order,
        priceList[i].issued,
        priceList[i].location_id,
        priceList[i].min_volume,
        priceList[i].order_id,
        priceList[i].price,
        priceList[i].range,
        priceList[i].type_id,
        priceList[i].volume_remain,
        priceList[i].volume_total
      ];
      prices = [
        ...prices,
        ...[price]
      ]
    }
    return prices
  }

}

writeResultsToFile = async(pricesList, structureData) => {
  console.log(structureData)
  if (!!!pricesList) {
    throw new Error('NO DATA')

  }
  const {name} = structureData
  const JSONformatterConfig = {
    type: 'space',
    size: 2
  }
  fs.writeFile(`./output/${name}--${currentDate}.json`, jsonFormat(pricesList, JSONformatterConfig), function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved !");
  });

  const csvConvertionCallback = (err, csv) => {
    if (err) {
      throw err
    }
    fs.writeFile(`./output/${name}--${currentDate}.csv`, csv, (err) => {
      if (err) {
        return console.log(err);
      }
      console.log("The csv was saved !");
    })
  }
  converter.json2csv(pricesList, csvConvertionCallback)
}

// getOrders(GoonHome).then((result) => writeResultsToFile(result, GoonHome))
const goonOrders = new Order()
goonOrders.structure = GoonHome;
goonOrders
  .getPriceData()
  .then((data) => writeResultsToFile(data, GoonHome))
// (async() => {   const data = await goonOrders.getPriceData()
// console.log(data)   writeResultsToFile(data, GoonHome) })()