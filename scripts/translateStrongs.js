/**
 * Translate Strong's hebrew definitions
 */
const {join} = require('path')
const fs = require('fs')
const {promisify} = require('util')
const asleep = require('asleep')
const writeFileAsync = promisify(fs.writeFile)
const prop = name => obj => obj[name]
const googleTranslate = require('google-translate')(process.env.GOOGLE_TRANSLATE_API_KEY)
const translateToJa = (strings) => new Promise((resolve, reject) => {
  googleTranslate.translate(strings, 'en', 'ja', (err, translations) => err ? reject(err) : resolve(translations))
})
const translateToJaLong = async (strings) => {
  let charCount = 0
  const limit = 1000
  const count = Math.ceil(strings.length / limit)
  let all = []
  for (let i = 0; i < count; i++) {
    const offset = i * limit
    const slice = strings.slice(offset, offset + limit)

    charCount += slice.reduce((count, str) => count + str.length, 0)
    if (charCount > 100000) {
      console.log(`User Rate Limit Exceeded and waiting 2 min...`)
      await asleep(120 * 1000)
      charCount = 0
    }

    console.log(i, slice.length, charCount)
    const translations = await translateToJa(slice)
    all = all.concat(translations)
  }
  return all
}
const {HebrewWord} = require('../lib/models')

const STRONG_HEBREW_JA_PATH = join(__dirname, '../assets/strong_hebrew_ja.json')

async function translateStrongs (destPath = STRONG_HEBREW_JA_PATH) {
  const hebrewWords = await HebrewWord.findAll()
  if (hebrewWords.length === 0) {
    console.error(`HebrewWord not set`)
    return
  }
  const wordIds = hebrewWords.map(prop('id'))
  const enDefs = hebrewWords.map(prop('def'))
  console.log(`length: ${enDefs.length}`)
  let translations
  try {
    translations = await translateToJaLong(enDefs)
  } catch (e) {
    console.error(e.body)
    return
  }
  const jaDefs = translations
    .map(prop('translatedText'))
    .map((ja, i) => ({
      id: wordIds[i],
      ja,
      en: enDefs[i]
    }))
  await writeFileAsync(destPath, JSON.stringify(jaDefs, null, '  '))
}

if (!module.parent) {
  translateStrongs().catch(console.error)
}
