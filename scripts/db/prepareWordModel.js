const {HebrewWord} = require('../../lib/models')
const {join} = require('path')
const fs = require('fs')
const R = require('ramda')
const {promisify} = require('util')
const readFileAsync = promisify(fs.readFile)
const {Parser} = require('xml2js')
const parser = new Parser({
  explicitArray: false,
  mergeAttrs: true
})
const parseXml = promisify(parser.parseString.bind(parser))
const byId = R.indexBy(R.prop('id'))
const hebrewJa = byId(require('../../assets/strong_hebrew_ja'))

const HEBREW_STRONG_PATH = join(__dirname, '../../ext/HebrewLexicon/HebrewStrong.xml')

class EntriesAccesor {
  constructor (entries) {
    this.toWord = this.toWord.bind(this)
    this.entries = entries
  }

  defOf (entry) {
    let defs
    if (entry.meaning && entry.meaning.def) {
      defs = entry.meaning.def
    } else {
      if (entry.source.w) {
        // corresponding to other word
        const corresponding = entry.source.w
        const refId = Array.isArray(corresponding)
          ? corresponding.find(({src}) => Boolean(src)).src
          : corresponding.src
        const refEntry = this.getEntry(refId)
        defs = this.defOf(refEntry)
      } else {
        console.error('ここは来ないはず')
      }
    }
    return Array.isArray(defs) ? defs.join(', ') : defs
  }

  toWord (entry) {
    const {id} = entry
    const def = this.defOf(entry)
    const ja = hebrewJa[id]
    if (!ja) {
      throw new Error(`no ja ${ja} ${entry}`)
    }
    return {
      id,
      lemma: entry.w._,
      pron: entry.w.pron,
      def,
      ja
    }
  }

  getEntry (id) {
    return this.entries.find((entry) => entry.id === id)
  }
}

async function prepareWordModel ({force = false}) {
  if (force) {
    await HebrewWord.sync()
    await HebrewWord.drop()
  }
  await HebrewWord.sync()

  const alreadyCreated = await HebrewWord.findOne()
  if (alreadyCreated) {
    console.log('Skip creating hebrew_word')
    return
  }

  const hebrewStrongXml = await readFileAsync(HEBREW_STRONG_PATH)
  const hebrewStrong = await parseXml(hebrewStrongXml)
  const entries = hebrewStrong.lexicon.entry
  const entriesAccesor = new EntriesAccesor(entries)
  const words = entries.map(entriesAccesor.toWord)
  try {
    await HebrewWord.bulkCreate(words)
  } catch (e) {
    // エラーをそのまま表示すると SQL 文が長くて大変なことになるため
    console.error(e.message)
  }
}

if (!module.parent) {
  prepareWordModel().catch(console.error)
}

module.exports = prepareWordModel
