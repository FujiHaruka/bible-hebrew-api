const {STRING} = require('sequelize')

const Word = {
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
  }
}

module.exports = Word
