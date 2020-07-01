'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('risk', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      property_room_count: Sequelize.INTEGER,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    })
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('risk')
  }
}
