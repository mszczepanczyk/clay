#!/usr/bin/env node

const { processFile } = require('./process')

async function main () {
  if (process.argv.length !== 3) {
    console.error('Usage: clay input.json')
  } else {
    const output = await processFile(process.argv[2])
    console.log(JSON.stringify(output, null, 2))
  }
}
main()
