const fs = require('fs');
const converter = require('json-2-csv');
const jsonFormat = require('json-format');

const writeJsonToFile = async (pricesList, structureData) => {
  console.log(structureData)
  if (!!!pricesList) {
    throw new Error('NO DATA')

  }
  const { name } = structureData
  const JSONformatterConfig = {
    type: 'space',
    size: 2
  }
  fs.writeFile(`./output/${name}.json`, jsonFormat(pricesList, JSONformatterConfig), function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved !");
  });

  const csvConvertionCallback = (err, csv) => {
    if (err) {
      throw err
    }
    fs.writeFile(`./output/${name}.csv`, csv, (err) => {
      if (err) {
        return console.log(err);
      }
      console.log("The csv was saved !");
    })
  }
  converter.json2csv(pricesList, csvConvertionCallback)
}

module.exports = writeJsonToFile