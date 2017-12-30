const {Word} = require('../../lib/models')
const {join} = require('path')
const fs = require('fs')
const {promisify} = require('util')
const readFileAsync = promisify(fs.readFile)
const {Parser} = require('xml2js')
const parser = new Parser({
  explicitArray: false,
  mergeAttrs: true
})
const parseXml = promisify(parser.parseString.bind(parser))

const HEBREW_STRONG_PATH = join(__dirname, '../../ext/HebrewLexicon/HebrewStrong.xml')

class EntriesAccesor {
  constructor (entries) {
    this.entries = entries
  }

  defOf (entry) {
    let defs
    if (entry.meaning) {
      defs = entry.meaning.def
    } else {
      // corresponding to other word
      const corresponding = entry.source.w
      const refId = Array.isArray(corresponding)
        ? corresponding.find(({src}) => Boolean(src)).src
        : corresponding.src
      const refEntry = this.entries.find(({id}) => id === refId)
      defs = refEntry.meaning.def
    }
    return Array.isArray(defs) ? defs.join(', ') : defs
  }
}

async function prepareWordModel () {
  await Word.sync()

  const hebrewStrongXml = await readFileAsync(HEBREW_STRONG_PATH)
  const hebrewStrong = await parseXml(hebrewStrongXml)
  const entries = hebrewStrong.lexicon.entry
  const entriesAccesor = new EntriesAccesor(entries)
  const words = entries.map((entry) => ({
    id: entry.id,
    lemma: entry.w._,
    pron: entry.w.pron,
    def: entriesAccesor.defOf(entry)
  }))
  await Word.bulkCreate(words)
}

if (!module.parent) {
  prepareWordModel().catch(console.error)
}

module.exports = prepareWordModel
