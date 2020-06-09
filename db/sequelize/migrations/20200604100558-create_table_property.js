'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('property', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.TEXT
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('property')
  }
}
