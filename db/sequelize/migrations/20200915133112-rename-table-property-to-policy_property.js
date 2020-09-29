'use strict'

module.exports = {
  up: async (queryInterface) => {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      const removePropertyPrimaryKeyConstraintOnPropertyTable = await queryInterface
        .removeConstraint('property', 'property_pkey', { transaction: transaction })

      const removePropertyPrimaryKeyIndexOnPropertyTable = await queryInterface
        .removeIndex('property', 'property_pkey', { transaction: transaction })

      const renameTablePropertyToPolicyProperty = await queryInterface
        .renameTable('property', 'policy_property', { transaction: transaction })

      const addPolicyPropertyPrimaryKeyConstraintOnPolicyPropertyTable = await queryInterface
        .addConstraint('policy_property', ['id'], {
          type: 'primary key',
          name: 'policy_property_pkey',
          transaction: transaction
        })

      return [
        removePropertyPrimaryKeyConstraintOnPropertyTable,
        removePropertyPrimaryKeyIndexOnPropertyTable,
        renameTablePropertyToPolicyProperty,
        addPolicyPropertyPrimaryKeyConstraintOnPolicyPropertyTable
      ]
    })
  },

  down: async (queryInterface) => {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      const removePolicyPropertyPrimaryKeyConstraintOnPolicyPropertyTable = await queryInterface
        .removeConstraint('policy_property', 'policy_property_pkey', { transaction: transaction })

      const removePolicyPropertyPrimaryKeyIndexOnPolicyPropertyTable = await queryInterface
        .removeIndex('policy_property', 'policy_property_pkey', { transaction: transaction })

      const renameTablePolicyPropertyInsuranceToProperty = await queryInterface
        .renameTable('policy_property', 'property', { transaction: transaction })

      const addPropertyPrimaryKeyConstraintOnPropertyTable = await queryInterface
        .addConstraint('property', ['id'], {
          type: 'primary key',
          name: 'property_pkey',
          transaction: transaction
        })

      const addRiskIdForeignKeyConstraintOnPropertyTable = await queryInterface
        .addConstraint('property', ['risk_id'], {
          type: 'foreign key',
          name: 'property_risk_id_fkey',
          references: {
            table: 'risk',
            field: 'id'
          },
          allowNull: false,
          transaction: transaction
        })

      return [
        removePolicyPropertyPrimaryKeyConstraintOnPolicyPropertyTable,
        removePolicyPropertyPrimaryKeyIndexOnPolicyPropertyTable,
        renameTablePolicyPropertyInsuranceToProperty,
        addPropertyPrimaryKeyConstraintOnPropertyTable,
        addRiskIdForeignKeyConstraintOnPropertyTable
      ]
    })
  }
}
