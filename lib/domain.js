/**
 * model と controller の中間層
 */
const {Op} = require('sequelize')
const R = require('ramda')
const {HebrewWord, BibleAtom} = require('./models')

const asJson = (obj) => JSON.parse(JSON.stringify(obj))

/**
 * osisId (ex: '2sam.2.4') から節内の単語の配列を取得する
 */
async function findVerse (osisId) {
  if (typeof osisId !== 'string') {
    return {err: new Error(`Invalid arg type ${typeof osisId}`)}
  }
  let verseWords
  try {
    verseWords = await BibleAtom.findAll({
      where: {osisId}
    })
  } catch (err) {
    return {err}
  }
  if (verseWords.length === 0) {
    return []
  }
  verseWords.sort((a, b) => a.index - b.index)
  return asJson(verseWords)
}

/**
 * ヘブル語の単語の意味を調べる
 */
async function findHebrewDefinitions (wordIds) {
  if (!Array.isArray(wordIds)) {
    wordIds = [wordIds]
  }
  wordIds = wordIds.map((strOrNum) => {
    if (typeof strOrNum === 'number') {
      return 'H' + strOrNum
    } else if (typeof strOrNum === 'string') {
      return strOrNum
    } else {
      return {err: new Error(`Invalid arg type ${typeof strOrNum}`)}
    }
  })
  const argErr = wordIds.find(({err}) => Boolean(err))
  if (argErr) {
    return {err: argErr}
  }
  let words
  try {
    words = await HebrewWord.findAll({
      where: {
        id: {
          [Op.in]: wordIds
        }
      }
    })
  } catch (err) {
    return {err}
  }
  const definitions = words
    .map((word) => ({[word.id]: asJson(word)}))
    .reduce((obj, wordObj) => Object.assign(obj, wordObj), {})
  return definitions
}

/**
 * あるヘブル語の単語を使用している節の id 配列を取得する
 */
async function findVersesUsingWord (wordId) {
  const exists = await HebrewWord.findOne({where: {id: wordId}})
  if (!exists) {
    return {err: new Error(`Not found word of id = "${wordId}"`)}
  }
  let verseWords = []
  try {
    verseWords = await BibleAtom.findAll({
      where: {wordId}
    })
  } catch (err) {
    return {err}
  }
  const osisIds = R.pipe(
    R.map(R.prop('osisId')),
    R.uniq
  )(verseWords)
  return asJson(osisIds)
}

if (!module.parent) {
  // findVerse('2sam.2.4').then(console.log)
  // findHebrewDefinitions(['H1', 'H24', 'H934']).then(console.log)
  // findVersesUsingWord('H934').then(console.log)
}

module.exports = {
  findVerse,
  findHebrewDefinitions,
  findVersesUsingWord
}
