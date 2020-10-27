import fs from 'fs'
import fsx from 'fs-extra'
import path from 'path'
import pdftk from 'node-pdftk'
import dayjs from 'dayjs'
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
import { SignedContractNotFoundError } from '../../../../src/app/policies/domain/contract/contract.errors'
import { PDFProcessor } from '../../../../src/app/policies/infrastructure/pdf/pdf-processor'
import { PDFtkPDFProcessor } from '../../../../src/app/policies/infrastructure/pdf/pdftk.pdf-processor'

describe('Policies - Infra - Contract FS Repository', async () => {
  const documentsFolderPath: string = config.get('FALCO_API_DOCUMENTS_STORAGE_FOLDER')
  const pdfProcessor: PDFProcessor = new PDFtkPDFProcessor({ productionMode: true })
  const contractGenerator: ContractGenerator = new ContractPdfGenerator(pdfProcessor)
  const specificTermsGenerator: SpecificTermsGenerator = new SpecificTermsPdfGenerator(pdfProcessor)
  let contractPdfRepository : ContractRepository
  let contractToSave: Contract
  let policy: Policy

  beforeEach(async function () {
    // Given
    this.timeout(10000)
    await fsx.emptyDir(documentsFolderPath)
    policy = createPolicyFixture({ partnerCode: 'essca' })
    policy.termEndDate = dayjs(policy.termStartDate).add(1, 'month').toDate()
    const specificTerms: SpecificTerms = await specificTermsGenerator.generate(policy)
    contractToSave = await contractGenerator.generate(policy.id, policy.insurance.productCode, 'partnerCode', specificTerms)
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
    }).timeout(10000)

    it('should return the path to the temp contract', async () => {
      // When
      const tempContractPath: string = await contractPdfRepository.saveTempContract(contractToSave)

      // Then
      const specificTermsFilePath: string = path.join(documentsFolderPath, 'tmp', 'Appenin_Contrat_assurance_habitation_APP753210859.pdf')
      expect(tempContractPath).to.equal(specificTermsFilePath)
    }).timeout(10000)
  })

  describe('#saveSignedContract', async () => {
    it('should save the signed contract', async () => {
      // When
      await contractPdfRepository.saveSignedContract(contractToSave)

      // Then
      const signedContractsFilePath: string = path.join(documentsFolderPath, 'Appenin_Contrat_assurance_habitation_APP753210859.pdf')
      expect(fs.existsSync(signedContractsFilePath)).to.be.true
    }).timeout(10000)

    it('should return the contract', async () => {
      // When
      const savedContract: Contract = await contractPdfRepository.saveSignedContract(contractToSave)

      // Then
      expect(savedContract).to.equal(contractToSave)
    }).timeout(10000)
  }).timeout(10000)

  describe('#getSignedContract', async () => {
    it('should return the found signed contract', async () => {
      // Given
      await contractPdfRepository.saveSignedContract(contractToSave)

      // When
      const signedContractFound = await contractPdfRepository.getSignedContract(contractToSave.name)

      // Then
      const signedContractPdfBuffer = await pdftk.input(signedContractFound.buffer).uncompress().output()
      expect(signedContractFound.name).to.equal('Appenin_Contrat_assurance_habitation_APP753210859.pdf')
      expect(signedContractPdfBuffer.includes('n\\260APP 753 210 859')).to.be.true
    }).timeout(10000)

    it('should throw a not found error if no specific terms found', async () => {
      // When
      const promise = contractPdfRepository.getSignedContract('not-existing-contract.pdf')

      // Then
      return expect(promise).to.be.rejectedWith(SignedContractNotFoundError)
    })
  }).timeout(10000)
}).timeout(10000)
