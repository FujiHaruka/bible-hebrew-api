const debug = require('debug')('bible-hebrew-api:db')
const Sequelize = require('sequelize')
const {SQLITE_DATABASE, SQLITE_USER, SQLITE_PASSWORD, SQLITE_PATH} = require('../../env')

const sequelize = new Sequelize(SQLITE_DATABASE, SQLITE_USER, SQLITE_PASSWORD, {
  dialect: 'sqlite',
  storage: SQLITE_PATH,
  logging: debug
})

module.exports = {
  HebrewWord: sequelize.define(...require('./HebrewWordModel')),
  BibleAtom: sequelize.define(...require('./BibleAtomModel'))
}
