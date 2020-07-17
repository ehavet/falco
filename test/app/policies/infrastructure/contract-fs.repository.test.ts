import dayjs from 'dayjs'
import fs from 'fs'
import fsx from 'fs-extra'
import path from 'path'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { config, expect } from '../../../test-utils'
import { SpecificTerms } from '../../../../src/app/policies/domain/specific-terms/specific-terms'
import { ContractRepository } from '../../../../src/app/policies/domain/contract/contract.repository'
import { ContractGenerator } from '../../../../src/app/policies/domain/contract/contract.generator'
import { ContractPdfGenerator } from '../../../../src/app/policies/infrastructure/contract/contract-pdf.generator'
import { Contract } from '../../../../src/app/policies/domain/contract/contract'
import { ContractFsRepository } from '../../../../src/app/policies/infrastructure/contract/contract-fs.repository'
import { SpecificTermsGenerator } from '../../../../src/app/policies/domain/specific-terms/specific-terms.generator'
import { SpecificTermsPdfGenerator } from '../../../../src/app/policies/infrastructure/specific-terms-pdf/specific-terms-pdf.generator'

describe('Policies - Infra - Contract FS Repository', async () => {
  const documentsFolderPath: string = config.get('FALCO_API_DOCUMENTS_STORAGE_FOLDER')
  const contractGenerator: ContractGenerator = new ContractPdfGenerator()
  const specificTermsGenerator: SpecificTermsGenerator = new SpecificTermsPdfGenerator()
  let contractPdfRepository : ContractRepository
  let contractToSave: Contract
  let policy: Policy

  beforeEach(async () => {
    // Given
    await fsx.emptyDir(documentsFolderPath)
    policy = createPolicyFixture({ partnerCode: 'essca' })
    policy.termEndDate = dayjs(policy.termStartDate).add(1, 'month').toDate()
    policy.insurance.productCode = 'APP1234'
    const specificTerms: SpecificTerms = await specificTermsGenerator.generate(policy)
    contractToSave = await contractGenerator.generate(policy.id, specificTerms)
    contractPdfRepository = new ContractFsRepository(config)
  })

  afterEach(async () => {
    await fsx.emptyDir(documentsFolderPath)
  })

  describe('#saveTempContract', async () => {
    it('should save contract waiting to be signed in temp folder', async () => {
      // When
      await contractPdfRepository.saveTempContract(contractToSave)

      // Then
      const specificTermsFilePath: string = path.join(documentsFolderPath, 'tmp', 'Appenin_Contrat_assurance_habitation_APP753210859.pdf')
      expect(fs.existsSync(specificTermsFilePath)).to.be.true
    })

    it('should return the path to the temp contract', async () => {
      // When
      const tempContractPath: string = await contractPdfRepository.saveTempContract(contractToSave)

      // Then
      const specificTermsFilePath: string = path.join(documentsFolderPath, 'tmp', 'Appenin_Contrat_assurance_habitation_APP753210859.pdf')
      expect(tempContractPath).to.equal(specificTermsFilePath)
    })
  })

  describe('#saveSignedContract', async () => {
    it('should save the signed contract', async () => {
      // When
      await contractPdfRepository.saveSignedContract(contractToSave)

      // Then
      const signedContractsFilePath: string = path.join(documentsFolderPath, 'Appenin_Contrat_assurance_habitation_APP753210859.pdf')
      expect(fs.existsSync(signedContractsFilePath)).to.be.true
    })

    it('should return the contract', async () => {
      // When
      const savedContract: Contract = await contractPdfRepository.saveSignedContract(contractToSave)

      // Then
      expect(savedContract).to.equal(contractToSave)
    })
  })
})
