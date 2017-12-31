const {STRING} = require('sequelize')

/**
 * Strong によるヘブル語辞書
 */
const HebrewWordModel = [
  'hebrew_word',
  {
    id: {
      type: STRING,
      primaryKey: true,
      allowNull: false
    },
    lemma: {
      type: STRING,
      allowNull: false
    },
    pron: {
      type: STRING,
      allowNull: false
    },
    def: {
      type: STRING,
      allowNull: false
    },
    ja: {
      type: STRING,
      allowNull: true
    }
  },
  {
    timestamps: false
  }
]

module.exports = HebrewWordModel
