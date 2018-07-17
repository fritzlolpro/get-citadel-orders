
const fetch = require('node-fetch')
const base64 = require('base-64');
const inputTokens = require('./privateKeys.js')
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

  async getStructureMarketOrders(structureData, page) {
    const {placeId, queryModificator = ''} = structureData
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

module.exports = Order