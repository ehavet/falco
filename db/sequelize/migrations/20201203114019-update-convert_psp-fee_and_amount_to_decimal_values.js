'use strict'

module.exports = {
  up: async (queryInterface) => {
    const isUpMigration = true

    await convertAmountAndPspFee(queryInterface, isUpMigration)
  },

  down: async (queryInterface) => {
    const isUpMigration = false

    await convertAmountAndPspFee(queryInterface, isUpMigration)
  }
}

async function convertAmountAndPspFee (queryInterface, isUpMigration) {
  const payments = await queryInterface.sequelize.query('SELECT id, amount, psp_fee FROM payment')

  return payments[0].map(payment => {
    const amount = parseInt(payment.amount)
    const pspFee = parseInt(payment.psp_fee)
    return queryInterface.bulkUpdate('payment', {
      amount: isUpMigration ? amount / 100 : amount * 100,
      psp_fee: isUpMigration ? pspFee / 100 : pspFee * 100
    }, {
      id: payment.id
    })
  })
}
