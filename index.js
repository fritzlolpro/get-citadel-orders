
require('node-import');
const jsonFormat = require('json-format');
const fs = require('fs');
const converter = require('json-2-csv');
const fetch = require('node-fetch')
require('node-google-apps-script')
const base64 = require('base-64');
let pageCount = null
let currentPage = 1
const citadelID = 1022734985679
const moment = require('moment');
const currentDate = moment().format("dddd, MMMM Do YYYY, HH").toString().replace(/\,|\s+/g, '-')
/*
  refreshtoken: 'xxx',
  secret: 'yyy',
  clientid: 'zzz'
*/
const inputTokens = require('./privateKeys.js')
const authUrl = 'https://login.eveonline.com/oauth/token?grant_type=refresh_token&refresh_token='

let finalPriceData = []

async function getAccessToken(config) {

  // if (Date.now() > config.expires) {

    var url  = authUrl + config.refreshtoken;

    var code = base64.encode(config.clientid + ':' + config.secret);

    var headers = {
      'Authorization': 'Basic ' + code,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    var parameters = {
      'method': 'post',
      'headers': headers
    };
    var response = await fetch(url, parameters)
      .then(bulk => bulk.json())

    var json = response;
    var access_token = json['access_token'];

    config.access_token = access_token;
    config.expires = Date.now() + 1200000


  // }

  return config;

}



async function getCitadel(citadelid, page) {

  config = await getAccessToken(inputTokens);
  // console.log('config',config)
  var url = 'https://esi.tech.ccp.is/latest/markets/structures/' + citadelid + '/?datasource=tranquility&page=' + page;

  var parameters = {
    method: "get",
    headers: {
      'Authorization': 'Bearer ' + config.access_token
    }
  };

  const jsonFeed = await fetch(url, parameters)
    .then(bulk => {
      return {
        body:  bulk.json(),
        headers: bulk.headers
      }
    })


  const json = await jsonFeed.body;
  const pagesInResponce = await parseInt( jsonFeed.headers.get('x-pages'))
  if (pageCount === null) {
    pageCount = pagesInResponce
  }
  // console.log(jsonFeed.headers, Date.now(), pagesInResponce)
  const result = formPriceDataBulk(json, page === 1)
  // writeResultsToFile(result)

  while (pageCount !== currentPage) {
    finalPriceData = [...finalPriceData, ...result]
    getCitadel(citadelID, currentPage + 1)
    currentPage++
  }

}

formPriceDataBulk = (priceList, shouldFormHeaders = false) => {
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

      var price = [
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
      prices = [...prices, ...[price]]
    }
  return prices
}

writeResultsToFile = async (pricesList) => {
  const JSONformatterConfig = {
    type: 'space',
    size: 2
  }
  await fs
    .writeFile(`./output/${currentDate}.json`, jsonFormat(pricesList, JSONformatterConfig), function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved !");
    });

  const csvConvertionCallback = (err, csv) => {
    if (err) {
      throw err
    }
    fs
      .writeFile(`./output/${currentDate}.csv`, csv, (err) => {
        if (err) {
        return console.log(err);
      }
      console.log("The csv was saved !");
      })
  }
  converter.json2csv(pricesList, csvConvertionCallback)
}

getCitadel(citadelID, currentPage)
  .then(() => writeResultsToFile(finalPriceData))