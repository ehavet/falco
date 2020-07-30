import { expect, sinon } from '../../../test-utils'
import { CreateSignatureRequestForPolicy } from '../../../../src/app/policies/domain/create-signature-request-for-policy.usecase'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { SpecificTerms } from '../../../../src/app/policies/domain/specific-terms/specific-terms'
import { Contract } from '../../../../src/app/policies/domain/contract/contract'
import { SignatureRequest } from '../../../../src/app/policies/domain/signature-request'
import { ContractGenerationFailureError, SignatureRequestCreationFailureError, SpecificTermsGenerationFailureError } from '../../../../src/app/policies/domain/signature-request.errors'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { Signer } from '../../../../src/app/policies/domain/signer'
import { policyRepositoryMock } from '../fixtures/policy-repository.test-doubles'

describe('Signature - Usecase - Create signature request for policy', async () => {
  let specificTermsGenerator
  let specificTermsRepository
  let contractGenerator
  let contractRepository
  let policyRepository
  let signatureRequestProvider
  let policyId: string
  let specificTerms: SpecificTerms
  let policy: Policy
  let contract: Contract
  let contractFilePath: string
  let expectedSignatureRequest: SignatureRequest
  let usecase: CreateSignatureRequestForPolicy
  let signer: Signer

  beforeEach(() => {
    specificTermsGenerator = { generate: sinon.mock(), getNameFor: sinon.stub() }
    specificTermsRepository = { save: sinon.spy(), get: sinon.stub() }
    contractGenerator = { generate: sinon.mock() }
    contractRepository = { saveTempContract: sinon.mock(), saveSignedContract: sinon.stub() }
    policyRepository = policyRepositoryMock()
    signatureRequestProvider = { create: sinon.mock() }
    specificTerms = { name: 'terms', buffer: Buffer.alloc(1) }
    policy = createPolicyFixture({ id: 'APP123456789' })
    policyId = policy.id
    contract = { name: 'contract', buffer: Buffer.alloc(2) }
    contractFilePath = '/file/path/pdf.pdf'
    expectedSignatureRequest = { url: 'http://url.com' }
    signer = { emailAdress: 'jeandupont@email.com', name: 'Jean Dupont', policyId: policy.id }

    usecase = CreateSignatureRequestForPolicy.factory(
      specificTermsGenerator,
      specificTermsRepository,
      contractGenerator,
      contractRepository,
      policyRepository,
      signatureRequestProvider
    )
  })

  it('should create signature request and return it url', async () => {
    // Given
    policyRepository.get.withExactArgs(policyId).resolves(policy)
    specificTermsGenerator.generate.withExactArgs(policy).resolves(specificTerms)
    contractGenerator.generate.withExactArgs(policyId, specificTerms).resolves(contract)
    contractRepository.saveTempContract.withExactArgs(contract).resolves(contractFilePath)
    signatureRequestProvider.create.withExactArgs(contractFilePath, signer)
      .resolves(expectedSignatureRequest)
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
    signatureRequestProvider.create.withExactArgs(contractFilePath, signer)
      .rejects(SignatureRequestCreationFailureError)
    // When
    const result: Promise<SignatureRequest> = usecase(policyId)
    // Then
    expect(specificTermsRepository.save.calledOnceWithExactly(specificTerms, policyId)).to.be.equal(false)
    expect(result).to.be.rejectedWith(SignatureRequestCreationFailureError)
  })
})
