import { expect, sinon } from '../../../test-utils'
import { CreateSignatureRequestForPolicy } from '../../../../src/app/policies/domain/create-signature-request-for-policy.usecase'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { SpecificTerms } from '../../../../src/app/policies/domain/specific-terms/specific-terms'
import { Contract } from '../../../../src/app/policies/domain/contract/contract'
import { SignatureRequest } from '../../../../src/app/policies/domain/signature-request'
import { ContractGenerationFailureError, SignatureRequestCreationFailureError, SpecificTermsGenerationFailureError } from '../../../../src/app/policies/domain/signature-request.errors'
import { Policy } from '../../../../src/app/policies/domain/policy'

describe('Policies - Usecase - Create signature request for policy', async () => {
  let specificTermsGenerator
  let specificTermsRepository
  let contractGenerator
  let contractRepository
  let policyRepository
  let signatureRequester
  let policyId: string
  let specificTerms: SpecificTerms
  let policy: Policy
  let contract: Contract
  let contractFilePath: string
  let expectedSignatureRequest: SignatureRequest
  let usecase: CreateSignatureRequestForPolicy

  beforeEach(() => {
    specificTermsGenerator = { generate: sinon.mock(), getNameFor: sinon.stub() }
    specificTermsRepository = { save: sinon.spy(), get: sinon.stub() }
    contractGenerator = { generate: sinon.mock() }
    contractRepository = { saveTempContract: sinon.mock(), saveSignedContract: sinon.stub() }
    policyRepository = { save: sinon.stub(), isIdAvailable: sinon.stub(), get: sinon.mock(), setEmailValidationDate: sinon.stub(), updateAfterPayment: sinon.mock() }
    signatureRequester = { create: sinon.mock() }
    policyId = 'APP123456789'
    specificTerms = { name: 'terms', buffer: Buffer.alloc(1) }
    policy = createPolicyFixture()
    contract = { name: 'contract', buffer: Buffer.alloc(2) }
    contractFilePath = '/file/path/pdf.pdf'
    expectedSignatureRequest = { url: 'http://url.com' }

    usecase = CreateSignatureRequestForPolicy.factory(
      specificTermsGenerator,
      specificTermsRepository,
      contractGenerator,
      contractRepository,
      policyRepository,
      signatureRequester
    )
  })

  it('should create signature request and return it url', async () => {
    // Given
    policyRepository.get.withExactArgs(policyId).resolves(policy)
    specificTermsGenerator.generate.withExactArgs(policy).resolves(specificTerms)
    contractGenerator.generate.withExactArgs(policyId, specificTerms).resolves(contract)
    contractRepository.saveTempContract.withExactArgs(contract).resolves(contractFilePath)
    signatureRequester.create.withExactArgs(contractFilePath).resolves(expectedSignatureRequest)
    // When
    const result: SignatureRequest = await usecase(policyId)
    // Then
    expect(specificTermsRepository.save.calledOnceWithExactly(specificTerms, policyId)).to.be.equal(true)
    expect(result).to.deep.equal(expectedSignatureRequest)
  })

  it('should return SpecificTermsGenerationFailureError when terms generation fail', async () => {
    // Given
    policyRepository.get.withExactArgs(policyId).resolves(policy)
    specificTermsGenerator.generate.withExactArgs(policy).rejects(SpecificTermsGenerationFailureError)
    contractGenerator.generate.withExactArgs(policyId, specificTerms).resolves(contract)
    contractRepository.saveTempContract.withExactArgs(contract).resolves(contractFilePath)
    signatureRequester.create.withExactArgs(contractFilePath).resolves(expectedSignatureRequest)
    // When
    const result: Promise<SignatureRequest> = usecase(policyId)
    // Then
    expect(specificTermsRepository.save.calledOnceWithExactly(specificTerms, policyId)).to.be.equal(false)
    expect(result).to.be.rejectedWith(SpecificTermsGenerationFailureError)
  })

  it('should return ContractGenerationFailureError when contract generation fail', async () => {
    // Given
    policyRepository.get.withExactArgs(policyId).resolves(policy)
    specificTermsGenerator.generate.withExactArgs(policy).resolves(specificTerms)
    contractGenerator.generate.withExactArgs(policyId, specificTerms).rejects(ContractGenerationFailureError)
    contractRepository.saveTempContract.withExactArgs(contract).resolves(contractFilePath)
    signatureRequester.create.withExactArgs(contractFilePath).resolves(expectedSignatureRequest)
    // When
    const result: Promise<SignatureRequest> = usecase(policyId)
    // Then
    expect(specificTermsRepository.save.calledOnceWithExactly(specificTerms, policyId)).to.be.equal(false)
    expect(result).to.be.rejectedWith(ContractGenerationFailureError)
  })

  it('should return SignatureRequestCreationFailureError when contract generation fail', async () => {
    // Given
    policyRepository.get.withExactArgs(policyId).resolves(policy)
    specificTermsGenerator.generate.withExactArgs(policy).resolves(specificTerms)
    contractGenerator.generate.withExactArgs(policyId, specificTerms).resolves(contract)
    contractRepository.saveTempContract.withExactArgs(contract).resolves(contractFilePath)
    signatureRequester.create.withExactArgs(contractFilePath).rejects(SignatureRequestCreationFailureError)
    // When
    const result: Promise<SignatureRequest> = usecase(policyId)
    // Then
    expect(specificTermsRepository.save.calledOnceWithExactly(specificTerms, policyId)).to.be.equal(false)
    expect(result).to.be.rejectedWith(SignatureRequestCreationFailureError)
  })
})
