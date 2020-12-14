'use strict'
const Sequelize = require('sequelize')

const DEFAULT_PRECISION = 14
const DEFAULT_SCALE = 6
const tablesToUpdate = [
  {
    tableName: 'payment',
    attributes: [
      {
        name: 'amount',
        previousType: Sequelize.INTEGER,
        nextType: Sequelize.DECIMAL(DEFAULT_PRECISION, DEFAULT_SCALE)
      },
      {
        name: 'psp_fee',
        previousType: Sequelize.INTEGER,
        nextType: Sequelize.DECIMAL(DEFAULT_PRECISION, DEFAULT_SCALE)
      }
    ]
  },
  {
    tableName: 'policy_insurance',
    attributes: [
      {
        name: 'monthly_price',
        previousType: Sequelize.FLOAT,
        nextType: Sequelize.DECIMAL(DEFAULT_PRECISION, DEFAULT_SCALE)
      },
      {
        name: 'default_deductible',
        previousType: Sequelize.FLOAT,
        nextType: Sequelize.DECIMAL(DEFAULT_PRECISION, DEFAULT_SCALE)
      },
      {
        name: 'default_ceiling',
        previousType: Sequelize.FLOAT,
        nextType: Sequelize.DECIMAL(DEFAULT_PRECISION, DEFAULT_SCALE)
      }
    ]
  },
  {
    tableName: 'quote_insurance',
    attributes: [
      {
        name: 'monthly_price',
        previousType: Sequelize.FLOAT,
        nextType: Sequelize.DECIMAL(DEFAULT_PRECISION, DEFAULT_SCALE)
      },
      {
        name: 'default_deductible',
        previousType: Sequelize.FLOAT,
        nextType: Sequelize.DECIMAL(DEFAULT_PRECISION, DEFAULT_SCALE)
      },
      {
        name: 'default_ceiling',
        previousType: Sequelize.FLOAT,
        nextType: Sequelize.DECIMAL(DEFAULT_PRECISION, DEFAULT_SCALE)
      }
    ]
  },
  {
    tableName: 'policy',
    attributes: [
      {
        name: 'premium',
        previousType: Sequelize.FLOAT,
        nextType: Sequelize.DECIMAL(DEFAULT_PRECISION, DEFAULT_SCALE)
      }
    ]
  },
  {
    tableName: 'quote',
    attributes: [
      {
        name: 'premium',
        previousType: Sequelize.FLOAT,
        nextType: Sequelize.DECIMAL(DEFAULT_PRECISION, DEFAULT_SCALE)
      }
    ]
  }
]

module.exports = {
  up: async (queryInterface) => {
    return upMigrationColumns(tablesToUpdate, queryInterface)
  },

  down: async (queryInterface) => {
    return downMigrationColumns(tablesToUpdate, queryInterface)
  }
}

function upMigrationColumns (columnsToUpdate, queryInterface) {
  return _updateTables(columnsToUpdate, queryInterface, true)
}
function downMigrationColumns (columnsToUpdate, queryInterface) {
  return _updateTables(columnsToUpdate, queryInterface, false)
}
function _updateTables (tablesToUpdate, queryInterface, isUpMigration) {
  return tablesToUpdate.map((tableToUpdate) => {
    return tableToUpdate.attributes.map((attribute) => {
      return queryInterface.changeColumn(tableToUpdate.tableName, attribute.name, {
        type: isUpMigration ? attribute.nextType : attribute.previousType
      })
    })
  })
}
