const {Wlc} = require('../../lib/models')
const {join} = require('path')
const fs = require('fs')
const {promisify} = require('util')
const readFileAsync = promisify(fs.readFile)
const readdirAsync = promisify(fs.readdir)
const {xml2js} = require('xml-js')
const assert = require('assert')

const BIBLE_BOOK_PATH = join(__dirname, '../../ext/morphhb/wlc')

async function prepareWlcModel () {
  await Wlc.sync()

  const files = await readdirAsync(BIBLE_BOOK_PATH)

  // だいぶひどい
  for (const file of files) {
    const wlc = []
    const xml = await readFileAsync(join(BIBLE_BOOK_PATH, file))
    const wlcData = xml2js(xml, {compact: false})
    const body = wlcData.elements[0].elements[0].elements[1]
    assert.equal(body.attributes.type, 'book')
    const bookId = body.attributes.osisID
    console.log(bookId)
    const chapters = body.elements
    for (const chapter of chapters) {
      assert.equal(chapter.name, 'chapter')
      const verses = chapter.elements
      for (const verse of verses) {
        assert.equal(verse.name, 'verse')
        for (let index = 0; index < verse.elements.length; index++) {
          const element = verse.elements[index]
          if (element.name !== 'w') {
            // いったん w 以外はスルー
            continue
          }
          const number = strongNumber(element.attributes.lemma)
          const item = {
            osisId: verse.attributes.osisID.toLowerCase(),
            index,
            word: element.elements[0].text.split('/').join('')
          }
          if (!isNaN(number)) {
            item.wordId = 'H' + number
            item.strongNumber = number
          }
          wlc.push(item)
        }
      }
    }
    console.log(`Create ${wlc.length} data`)
    await Wlc.bulkCreate(wlc)
  }
}

function strongNumber (lemma) {
  // 'c/5921 a' などを数値にする
  return parseInt(lemma.split('').filter((s) => !isNaN(s)).join(''))
}

if (!module.parent) {
  prepareWlcModel().catch(console.error)
}

module.exports = prepareWlcModel
