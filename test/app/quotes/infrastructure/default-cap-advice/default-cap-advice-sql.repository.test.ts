import { dbTestUtils, expect } from '../../../../test-utils'
import { DefaultCapAdviceSqlRepository } from '../../../../../src/app/quotes/infrastructure/default-cap-advice/default-cap-advice-sql.repository'
import { DefaultCapAdviceSqlModel } from '../../../../../src/app/quotes/infrastructure/default-cap-advice/default-cap-advice-sql.model'
import { DefaultCapAdviceNotFoundError } from '../../../../../src/app/quotes/domain/default-cap-advice/default-cap-advice.errors'

describe('Quotes - Infra - Default Cap Advice Repository', async () => {
  const defaultCapAdviceRepository = new DefaultCapAdviceSqlRepository()

  before(async () => {
    await dbTestUtils.initDB()
  })

  after(async () => {
    await dbTestUtils.closeDB()
  })

  describe('#get', async () => {
    it('should return the found default cap advice for the given partner and room count', async () => {
      // Given
      const defaultCapAdviceInserted = await DefaultCapAdviceSqlModel.create({ partnerCode: 'myPartner', roomCount: 2, defaultCapAdvice: 5000 })

      // When
      const defaultCapAdvice = await defaultCapAdviceRepository.get('myPartner', 2)

      // Then
      expect(defaultCapAdvice.value).to.deep.equal('5000.000000')
      await defaultCapAdviceInserted.destroy()
    })

    it('should throw an error if there is no default cap advice for the given partner', async () => {
      // Given
      const defaultCapAdviceInserted = await DefaultCapAdviceSqlModel.create({ partnerCode: 'myPartner', roomCount: 2, defaultCapAdvice: 5000 })

      // When
      const promise = defaultCapAdviceRepository.get('myOtherPartner', 2)

      // Then
      await defaultCapAdviceInserted.destroy()
      return expect(promise).to.be.rejectedWith(DefaultCapAdviceNotFoundError)
    })

    it('should throw an error if there is a default cap for the given partner but not for the given room count', async () => {
      // Given
      const defaultCapAdviceInserted = await DefaultCapAdviceSqlModel.create({ partnerCode: 'myPartner', roomCount: 2, defaultCapAdvice: 5000 })

      // When
      const promise = defaultCapAdviceRepository.get('myPartner', 3)

      // Then
      await defaultCapAdviceInserted.destroy()
      return expect(promise).to.be.rejectedWith(DefaultCapAdviceNotFoundError)
    })
  })
})
