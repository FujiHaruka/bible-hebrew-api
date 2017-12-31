const {STRING, INTEGER} = require('sequelize')

/**
 * Westminster Leningrad Codex (wlc) をもとにして、章節は KJV による
 */
const BibleAtomModel = [
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

module.exports = BibleAtomModel
