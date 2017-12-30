const {STRING, INTEGER} = require('sequelize')

/**
 * Wlc。ヘブル語聖書の章節にある単語
 */
const WlcModel = [
  'wlc',
  {
    // ex: "Ps.1.1"
    osisId: {
      type: STRING,
      allowNull: false
    },
    // ex: "H121"
    wordId: {
      type: STRING,
      allowNull: true
    },
    strongNumber: {
      type: INTEGER,
      allowNull: true
    },
    // word index in the verse
    index: {
      type: INTEGER,
      allowNull: false
    },
    word: {
      type: STRING,
      allowNull: false
    }
  },
  {
    indexes: [{ unique: false, fields: ['osisId'] }],
    timestamps: false
  }
]

module.exports = WlcModel
