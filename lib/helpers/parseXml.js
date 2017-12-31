const {promisify} = require('util')
const {Parser} = require('xml2js')
const parser = new Parser({
  explicitArray: false,
  mergeAttrs: true
})
const parseXml = promisify(parser.parseString.bind(parser))

module.exports = parseXml
