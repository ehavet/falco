import dayjs from 'dayjs'
import fs from 'fs'
import fsx from 'fs-extra'
import path from 'path'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { config, expect } from '../../../test-utils'
import { SpecificTermsPdfGenerator } from '../../../../src/app/policies/infrastructure/specific-terms-pdf/specific-terms-pdf.generator'
import { SpecificTermsRepository } from '../../../../src/app/policies/domain/specific-terms/specific-terms.repository'
import { SpecificTerms } from '../../../../src/app/policies/domain/specific-terms/specific-terms'
import { SpecificTermsAlreadyCreatedError } from '../../../../src/app/policies/domain/specific-terms/specific-terms.errors'
import { SpecificTermsGenerator } from '../../../../src/app/policies/domain/specific-terms/specific-terms.generator'
import { SpecificTermsFSRepository } from '../../../../src/app/policies/infrastructure/specific-terms-pdf/specific-terms-fs.repository'

describe('Policies - Infra - Specific terms FS Repository', async () => {
  const specificTermsFolderPath: string = config.get('FALCO_API_SPECIFIC_TERMS_STORAGE_FOLDER')
  const specificTermsGenerator: SpecificTermsGenerator = new SpecificTermsPdfGenerator()
  let specificTermsPdfRepository : SpecificTermsRepository
  let specificTermsToSave: SpecificTerms
  let policy: Policy

  beforeEach(async () => {
    // Given
    await fsx.emptyDir(specificTermsFolderPath)
    policy = createPolicyFixture({ partnerCode: 'essca' })
    policy.termEndDate = dayjs(policy.termStartDate).add(1, 'month').toDate()
    policy.insurance.productCode = 'APP1234'
    specificTermsToSave = await specificTermsGenerator.generate(policy)
    specificTermsPdfRepository = new SpecificTermsFSRepository(config)

    // When
    await specificTermsPdfRepository.save(specificTermsToSave, policy.id)
  })

  afterEach(async () => {
    await fsx.emptyDir(specificTermsFolderPath)
  })

  it('should save the given specific terms', async () => {
    // Then
    const specificTermsFilePath: string = path.join(specificTermsFolderPath, 'Appenin_Condition_Particulieres_assurance_habitation_APP753210859.pdf')
    expect(fs.existsSync(specificTermsFilePath)).to.be.true
  })

  it('should throw and error if the given specific terms have already been saved', async () => {
    // When
    const promise = specificTermsPdfRepository.save(specificTermsToSave, policy.id)
    return expect(promise).to.be.rejectedWith(SpecificTermsAlreadyCreatedError)
  })
})
