const debug = require('debug')('bible-hebrew-api:db')
const Sequelize = require('sequelize')
const {join} = require('path')

const sequelize = new Sequelize('database', 'user', 'password', {
  dialect: 'sqlite',
  storage: join(__dirname, '../../var/database.sqlite'),
  logging: debug
})

module.exports = {
  Word: sequelize.define('Word', require('./Word'), {timestamps: false})
}