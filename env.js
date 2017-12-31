const {join} = require('path')
const {
  BIBLE_HEBREW_API_ENV_PATH
} = process.env

let defaultEnv = {
  SQLITE_DATABASE: 'database',
  SQLITE_USER: 'user',
  SQLITE_PASSWORD: 'password',
  SQLITE_PATH: join(__dirname, 'var/database.sqlite'),
  APP_PORT: 3005,
  URL_PREFIX: '' // for example '/api'
}

module.exports = BIBLE_HEBREW_API_ENV_PATH ? require(BIBLE_HEBREW_API_ENV_PATH) : defaultEnv
