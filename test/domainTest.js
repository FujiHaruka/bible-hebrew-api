const assert = require('assert')
const {
  findVerse,
  findHebrewDefinitions,
  findVersesUsingWord
} = require('../lib/domain')

describe('domain.js', function () {
  this.timeout(5000)

  it('findVerse', async () => {
    const osisId = '2sam.2.4'
    const verse = await findVerse(osisId)
    assert.ok(verse.length > 0)
  })

  it('findHebrewDefinitions', async () => {
    {
      const wordIds = ['H7225', 'H1254', 'H430', 'H853', 'H8064', 'H853', 'H776']
      const defs = await findHebrewDefinitions(wordIds)
      assert.ok(defs['H1254'])
    }
    {
      const strongNums = [7225, 1254, 430, 853, 8064, 853, 776]
      const defs = await findHebrewDefinitions(strongNums)
      assert.ok(defs['H1254'])
    }
  })

  it('findVersesUsingWord', async () => {
    const verseIds = await findVersesUsingWord('H934')
    assert.ok(verseIds.length > 0)
  })
})

/* global describe it */
