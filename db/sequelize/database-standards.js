'use strict'
const Sequelize = require('sequelize')

const DEFAULT_DECIMAL_PRECISION = 14
const DEFAULT_DECIMAL_SCALE = 6

const DECIMAL_TYPE = Sequelize.DECIMAL(DEFAULT_DECIMAL_PRECISION, DEFAULT_DECIMAL_SCALE)

module.exports = {
  DECIMAL_TYPE
}
