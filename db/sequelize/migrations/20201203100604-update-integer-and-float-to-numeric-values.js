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
    const isUpMigration = true
    await Promise.all(updateTable(tablesToUpdate, queryInterface, isUpMigration))
  },

  down: async (queryInterface) => {
    const isUpMigration = false
    await Promise.all(updateTable(tablesToUpdate, queryInterface, isUpMigration))
  }
}

function updateTable (tablesToUpdate, queryInterface, isUpMigration) {
  return tablesToUpdate.map((tableToUpdate) => {
    return tableToUpdate.attributes.map((attribute) => {
      return queryInterface.changeColumn(tableToUpdate.tableName, attribute.name, {
        type: isUpMigration ? attribute.nextType : attribute.previousType
      })
    })
  })
}
