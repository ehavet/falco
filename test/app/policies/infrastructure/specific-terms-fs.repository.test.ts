import dayjs from 'dayjs'
import fs from 'fs'
import fsx from 'fs-extra'
import path from 'path'
import pdftk from 'node-pdftk'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { config, expect } from '../../../test-utils'
import { SpecificTermsPdfGenerator } from '../../../../src/app/policies/infrastructure/specific-terms-pdf/specific-terms-pdf.generator'
import { SpecificTermsRepository } from '../../../../src/app/policies/domain/specific-terms/specific-terms.repository'
import { SpecificTerms } from '../../../../src/app/policies/domain/specific-terms/specific-terms'
import {
  SpecificTermsNotFoundError
} from '../../../../src/app/policies/domain/specific-terms/specific-terms.errors'
import { SpecificTermsGenerator } from '../../../../src/app/policies/domain/specific-terms/specific-terms.generator'
import { SpecificTermsFSRepository } from '../../../../src/app/policies/infrastructure/specific-terms-pdf/specific-terms-fs.repository'
import { PDFProcessor } from '../../../../src/app/policies/infrastructure/pdf/pdf-processor'
import { PDFtkPDFProcessor } from '../../../../src/app/policies/infrastructure/pdf/pdftk.pdf-processor'

describe('Policies - Infra - Specific terms FS Repository', async () => {
  const specificTermsFolderPath: string = config.get('FALCO_API_DOCUMENTS_STORAGE_FOLDER')
  const pdfProcessor: PDFProcessor = new PDFtkPDFProcessor({ productionMode: false })
  const specificTermsGenerator: SpecificTermsGenerator = new SpecificTermsPdfGenerator(pdfProcessor)
  let specificTermsPdfRepository : SpecificTermsRepository
  let specificTermsToSave: SpecificTerms
  let policy: Policy

  beforeEach(async function () {
    // Given
    this.timeout(10000)
    await fsx.emptyDir(specificTermsFolderPath)
    policy = createPolicyFixture({ partnerCode: 'essca' })
    policy.termEndDate = dayjs(policy.termStartDate).add(1, 'month').toDate()
    policy.insurance.productCode = 'APP1234'
    specificTermsToSave = await specificTermsGenerator.generate(policy)
    specificTermsPdfRepository = new SpecificTermsFSRepository(config)
  })

  afterEach(async () => {
    await fsx.emptyDir(specificTermsFolderPath)
  })

  describe('#save', async () => {
    it('should save the given specific terms', async () => {
      // When
      await specificTermsPdfRepository.save(specificTermsToSave, policy.id)

      // Then
      const specificTermsFilePath: string = path.join(specificTermsFolderPath, 'Appenin_Condition_Particulieres_assurance_habitation_APP753210859.pdf')
      expect(fs.existsSync(specificTermsFilePath)).to.be.true
    })
  })

  describe('#get', async () => {
    it('should return the found specific terms', async () => {
      // Given
      await specificTermsPdfRepository.save(specificTermsToSave, policy.id)

      // When
      const specificTermsFound: SpecificTerms = await specificTermsPdfRepository.get('Appenin_Condition_Particulieres_assurance_habitation_APP753210859.pdf')

      // Then
      const specificTermsPdfBuffer = await pdftk.input(specificTermsFound.buffer).uncompress().output()
      expect(specificTermsFound.name).to.equal('Appenin_Condition_Particulieres_assurance_habitation_APP753210859.pdf')
      expect(specificTermsPdfBuffer.includes('n\\260APP 753 210 859')).to.be.true
    })

    it('should throw a not found error if no specific terms found', async () => {
      // When
      const promise = specificTermsPdfRepository.get('Appenin_Condition_Particulieres_assurance_habitation_APP753210859.pdf')

      // Then
      return expect(promise).to.be.rejectedWith(SpecificTermsNotFoundError)
    })
  })
})
