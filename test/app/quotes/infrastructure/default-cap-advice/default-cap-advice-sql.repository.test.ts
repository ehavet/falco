import { dbTestUtils, expect } from '../../../../test-utils'
import { DefaultCapAdviceSqlRepository } from '../../../../../src/app/quotes/infrastructure/default-cap-advice/default-cap-advice-sql.repository'
import { DefaultCapAdviceSqlModel } from '../../../../../src/app/quotes/infrastructure/default-cap-advice/default-cap-advice-sql.model'
import {
  DefaultCapAdviceNotFoundError,
  MultipleDefaultCapAdviceFoundError
} from '../../../../../src/app/quotes/domain/default-cap-advice/default-cap-advice.errors'

describe('Quotes - Infra - Default Cap Advice Repository', async () => {
  const defaultCapAdviceRepository = new DefaultCapAdviceSqlRepository()
  const partnerCode = 'myTestPartner'

  before(async () => {
    await dbTestUtils.initDB()
  })

  after(async () => {
    await dbTestUtils.closeDB()
  })

  afterEach(async () => {
    await DefaultCapAdviceSqlModel.destroy({ where: { partnerCode: partnerCode } })
  })

  describe('#get', async () => {
    it('should return the found default cap advice as an amount for the given partner and room count', async () => {
      // Given
      await DefaultCapAdviceSqlModel.create({ partnerCode: partnerCode, roomCount: 2, defaultCapAdvice: 5000.12 })

      // When
      const defaultCapAdvice = await defaultCapAdviceRepository.get(partnerCode, 2)

      // Then
      expect(defaultCapAdvice.value).to.deep.equal(5000.12)
    })

    it('should throw an error if there is no default cap advice for the given partner', async () => {
      // Given
      await DefaultCapAdviceSqlModel.create({ partnerCode: partnerCode, roomCount: 2, defaultCapAdvice: 5000 })

      // When
      const promise = defaultCapAdviceRepository.get('myOtherPartner', 2)

      // Then
      return expect(promise).to.be.rejectedWith(DefaultCapAdviceNotFoundError)
    })

    it('should throw an error if there is a default cap for the given partner but not for the given room count', async () => {
      // Given
      await DefaultCapAdviceSqlModel.create({ partnerCode: partnerCode, roomCount: 2, defaultCapAdvice: 5000 })

      // When
      const promise = defaultCapAdviceRepository.get(partnerCode, 3)

      // Then
      return expect(promise).to.be.rejectedWith(DefaultCapAdviceNotFoundError)
    })

    it('should throw an error if there is more than one default cap advice for the given partner and room count', async () => {
      // Given
      await DefaultCapAdviceSqlModel.create({ partnerCode: partnerCode, roomCount: 2, defaultCapAdvice: 5000 })
      await DefaultCapAdviceSqlModel.create({ partnerCode: partnerCode, roomCount: 2, defaultCapAdvice: 6000 })

      // When
      const promise = defaultCapAdviceRepository.get(partnerCode, 2)

      // Then
      return expect(promise).to.be.rejectedWith(MultipleDefaultCapAdviceFoundError)
    })
  })
})
