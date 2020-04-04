#!/usr/bin/env node

const fs = require('fs')
const hariboteUp = require('./server')

// get config
let config
if (process.argv.length === 3 && fs.existsSync(process.argv[2])) config = require(process.argv[2])
else config = fs.existsSync(process.env.HARIBOTE_CONF) ? require(process.env.HARIBOTE_CONF) : require('./settings.json')

console.log(process.argv)

if (!config) {
    console.log('config file is not defined.')
    process.exit(1)
}

hariboteUp(config)
