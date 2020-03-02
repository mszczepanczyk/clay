const fs = require('fs')
const util = require('util')

// https://stackoverflow.com/questions/33355528/filtering-an-array-with-a-function-that-returns-a-promise
async function filter (arr, callback) {
  const fail = Symbol('')
  return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i => i !== fail)
}

async function readJSON (path) {
  const data = await util.promisify(fs.readFile)(path, 'utf8')
  return JSON.parse(data)
}

module.exports = {
  filter,
  readJSON
}
