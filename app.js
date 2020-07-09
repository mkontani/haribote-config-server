#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const hariboteUp = require('./server')

// get config
let cpath
const inpath = (process.argv.length === 3) ? process.argv[2] : process.env.HARIBOTE_CONF
if (inpath) {
  cpath = inpath.startsWith('/') ? inpath : path.join(process.cwd(), inpath)
  // eslint-disable-next-line no-undef
} else cpath = path.join(__dirname, '/settings.json')

if (!fs.existsSync(cpath)) {
  console.log(`config file not exist. ${cpath}`)
  process.exit(1)
}
const config = require(cpath)

hariboteUp(config)
