const {BibleAtom} = require('../../lib/models')
const {join} = require('path')
const fs = require('fs')
const {promisify} = require('util')
const readFileAsync = promisify(fs.readFile)
const readdirAsync = promisify(fs.readdir)
const parseXml = require('../../lib/helpers/parseXml')
const {xml2js} = require('xml-js') // 配列を扱うため
const assert = require('assert')

const BIBLE_BOOK_PATH = join(__dirname, '../../ext/morphhb/wlc')

class VerseMap {
  constructor (verseMapObj) {
    this.map = verseMapObj.verseMap.book
      .map((book) => ({
        book: book.osisID.toLowerCase(),
        verses: (book.verse || []).map(({wlc, kjv}) => ({
          // type は省略。 'partial' は一箇所しかないので無視
          [wlc.toLowerCase()]: kjv.toLowerCase()
        })).reduce((a, b) => Object.assign(a, b), {})
      }))
  }

  wlcToKjv (osisId) {
    const book = osisId.split('.')[0]
    const kjv = this.map.find(b => b.book === book).verses[osisId]
    // 見つからない時には変更なし
    return kjv || osisId
  }
}

async function prepareBibleAtomModel ({force = false}) {
  if (force) {
    await BibleAtom.sync()
    await BibleAtom.drop()
  }
  await BibleAtom.sync()

  const verseMapFile = 'VerseMap.xml'
  const verseMapXml = await readFileAsync(join(BIBLE_BOOK_PATH, verseMapFile))
  const verseMapObj = (await parseXml(verseMapXml))
  const verseMap = new VerseMap(verseMapObj)

  const files = (await readdirAsync(BIBLE_BOOK_PATH))
    .filter((name) => name !== verseMapFile)

  // だいぶひどい
  for (const file of files) {
    const wlc = []
    const xml = await readFileAsync(join(BIBLE_BOOK_PATH, file))
    const wlcData = xml2js(xml, {compact: false})
    if (!wlcData.elements[0].elements[0]) {
      console.log(wlcData.elements)
    }
    const body = wlcData.elements[0].elements[0].elements[1]
    assert.equal(body.attributes.type, 'book')
    const bookId = body.attributes.osisID.toLowerCase()
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
          const wlcOsisId = verse.attributes.osisID.toLowerCase()
          const osisId = verseMap.wlcToKjv(wlcOsisId)
          const word = element.elements[0].text.split('/').join('')
          const item = {
            osisId,
            index,
            word
          }
          if (!isNaN(number)) {
            item.wordId = 'H' + number
            item.strongNumber = number
          }
          wlc.push(item)
        }
      }
    }
    console.log(`Create ${wlc.length} data in ${bookId}`)
    await BibleAtom.bulkCreate(wlc)
  }
}

function strongNumber (lemma) {
  // 'c/5921 a' などを数値にする
  return parseInt(lemma.split('').filter((s) => !isNaN(s)).join(''))
}

if (!module.parent) {
  prepareBibleAtomModel({force: true}).catch(console.error)
}

module.exports = prepareBibleAtomModel
