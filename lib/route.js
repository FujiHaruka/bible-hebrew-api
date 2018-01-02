const R = require('ramda')
const {
  findVerse,
  findHebrewDefinitions,
  findVersesUsingWord
} = require('./domain')
const koaBody = require('koa-body')()

const Path = {
  HEBREW_SENTENCE: '/hebrew_sentences/:book/:chapter/:verse',
  HEBREW_SENTENCES_USING_WORD: '/hebrew_sentences/strong/:strongNumber',
  HEBREW_WORD: '/hebrew_words/:strongNumber',
  HEBREW_WORDS: '/hebrew_words'
}

function route (router) {
  router.get(
    Path.HEBREW_SENTENCE,
    async (ctx, next) => {
      const {book, chapter, verse} = ctx.params
      const osisId = `${book}.${chapter}.${verse}`
      const atoms = await findVerse(osisId)
      if (atoms.err) {
        ctx.body = atoms.err
        ctx.status = 400
        return
      }
      const wordIds = atoms.map(R.prop('wordId'))
      const defs = await findHebrewDefinitions(wordIds)
      if (defs.err) {
        ctx.body = defs.err
        ctx.status = 400
        return
      }
      for (const atom of atoms) {
        atom.def = defs[atom.wordId]
      }
      ctx.body = atoms
      ctx.status = 200
    }
  )

  router.get(
    Path.HEBREW_SENTENCES_USING_WORD,
    async (ctx, next) => {
      const {strongNumber} = ctx.params
      const wordId = 'H' + strongNumber
      const osisIds = await findVersesUsingWord(wordId)
      if (osisIds.err) {
        ctx.body = osisIds.err
        ctx.status = 400
        return
      }
      ctx.body = osisIds
      ctx.status = 200
    }
  )

  router.get(
    Path.HEBREW_WORD,
    async (ctx, next) => {
      const {strongNumber} = ctx.params
      const wordId = 'H' + strongNumber
      const def = await findHebrewDefinitions(wordId)
      if (def.err) {
        ctx.body = def.err
        ctx.status = 400
        return
      }
      ctx.body = def
      ctx.status = 200
    }
  )

  router.post(
    Path.HEBREW_WORDS,
    koaBody,
    async (ctx, next) => {
      const {body: numbers} = ctx.request
      const wordIds = numbers.map((n) => 'H' + n)
      const defs = await findHebrewDefinitions(wordIds)
      if (defs.err) {
        ctx.body = defs.err
        ctx.status = 400
        return
      }
      ctx.body = defs
      ctx.status = 200
    }
  )
}

module.exports = route
