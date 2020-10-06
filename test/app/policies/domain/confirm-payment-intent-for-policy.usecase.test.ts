import { SinonStubbedInstance } from 'sinon'
import { PolicyRepository } from '../../../../src/app/policies/domain/policy.repository'
import { dateFaker, expect, sinon } from '../../../test-utils'
import { createOngoingPolicyFixture } from '../fixtures/policy.fixture'
import { ConfirmPaymentIntentForPolicy } from '../../../../src/app/policies/domain/confirm-payment-intent-for-policy.usecase'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { CertificateGenerator } from '../../../../src/app/policies/domain/certificate/certificate.generator'
import { Mailer } from '../../../../src/app/common-api/domain/mailer'
import { Certificate } from '../../../../src/app/policies/domain/certificate/certificate'
import { expectedSubscriptionValidationEmail } from '../expectations/expected-subscription-validation-email'
import { CertificateGenerationError } from '../../../../src/app/policies/domain/certificate/certificate.errors'
import { ContractRepository } from '../../../../src/app/policies/domain/contract/contract.repository'
import { ContractGenerator } from '../../../../src/app/policies/domain/contract/contract.generator'
import { policyRepositoryStub } from '../fixtures/policy-repository.test-doubles'
import { PaymentRepository } from '../../../../src/app/policies/domain/payment/payment.repository'
import { paymentRepositoryStub } from '../fixtures/payment-repository.test-doubles'
import { createPaymentFixture } from '../fixtures/payment/payment.fixture'
import { createConfirmPaymentIntentCommandFixture } from '../fixtures/payment/confirmPaymentIntentCommand.fixture'
import { PaymentProcessor } from '../../../../src/app/policies/domain/payment-processor'
import { paymentProcessorStub } from '../fixtures/payment/payment-processor.test-doubles'

describe('PaymentProcessor - Usecase - confirm payment intent for policy', async () => {
  const now = new Date('2020-01-05T10:09:08Z')
  const policyRepository: SinonStubbedInstance<PolicyRepository> = policyRepositoryStub()
  const paymentRepository: SinonStubbedInstance<PaymentRepository> = paymentRepositoryStub()
  const paymentProcessor: SinonStubbedInstance<PaymentProcessor> = paymentProcessorStub()
  const certificateGenerator: SinonStubbedInstance<CertificateGenerator> = {
    generate: sinon.stub()
  }
  const contractRepository: SinonStubbedInstance<ContractRepository> = {
    saveTempContract: sinon.stub(),
    saveSignedContract: sinon.stub(),
    getSignedContract: sinon.stub()
  }
  const contractGenerator: SinonStubbedInstance<ContractGenerator> = {
    generate: sinon.stub(),
    getContractName: sinon.stub()
  }
  const mailer: SinonStubbedInstance<Mailer> = {
    send: sinon.stub()
  }

  const confirmPaymentIntentForPolicy: ConfirmPaymentIntentForPolicy =
      ConfirmPaymentIntentForPolicy.factory(policyRepository, certificateGenerator, contractGenerator, contractRepository, paymentRepository, paymentProcessor, mailer)

  beforeEach(() => {
    dateFaker.setCurrentDate(now)
  })

  it('Should update the policy', async () => {
    // Given
    const policyId = 'p0l1cy1D'
    const policy: Policy = createOngoingPolicyFixture({
      id: policyId,
      contact: {
        firstname: 'Jean',
        lastname: 'Dupont',
        address: '13 rue du loup garou',
        postalCode: 75001,
        city: 'paris',
        email: 'test@email.com',
        phoneNumber: '+33684205510'
      }
    })
    const certificate: Certificate = { name: 'filename', buffer: Buffer.alloc(1) }
    policyRepository.get.withArgs(policyId).resolves(policy)
    certificateGenerator.generate.withArgs(policy).resolves(certificate)
    contractGenerator.getContractName.withArgs(policyId).returns('signedContract.pdf')
    contractRepository.getSignedContract.withArgs('signedContract.pdf').resolves({ name: 'signedContract.pdf', buffer: Buffer.from('signedContract') })

    const confirmPaymentIntentCommand = createConfirmPaymentIntentCommandFixture({ policyId })

    // When
    await confirmPaymentIntentForPolicy(confirmPaymentIntentCommand)

    // Then
    expect(policyRepository.updateAfterPayment.getCall(0))
      .to.have.been.calledWith(policyId, now, now, Policy.Status.Applicable)
  })

  it('should create a payment for the policy', async () => {
    // Given
    const policyId = 'p0l1cy1D'
    const confirmPaymentIntentCommand = createConfirmPaymentIntentCommandFixture({ policyId })
    const policy: Policy = createOngoingPolicyFixture({
      id: policyId,
      contact: {
        firstname: 'Jean',
        lastname: 'Dupont',
        address: '13 rue du loup garou',
        postalCode: 75001,
        city: 'paris',
        email: 'test@email.com',
        phoneNumber: '+33684205510'
      }
    })
    const certificate: Certificate = { name: 'filename', buffer: Buffer.alloc(1) }
    policyRepository.get.withArgs(policyId).resolves(policy)
    paymentProcessor.getTransactionFee.withArgs(confirmPaymentIntentCommand.rawPaymentIntent).resolves(200)
    certificateGenerator.generate.withArgs(policy).resolves(certificate)
    contractGenerator.getContractName.withArgs(policyId).returns('signedContract.pdf')
    contractRepository.getSignedContract.withArgs('signedContract.pdf').resolves({ name: 'signedContract.pdf', buffer: Buffer.from('signedContract') })

    // When
    await confirmPaymentIntentForPolicy(confirmPaymentIntentCommand)

    // Then
    const payment = createPaymentFixture({ policyId, pspFee: 200 })
    expect(paymentRepository.save).to.have.been.calledWith(payment)
  })

  it('Should send an email confirmation', async () => {
    // Given
    const policyId = 'p0l1cy1D'
    const policy: Policy = createOngoingPolicyFixture({
      id: policyId,
      contact: {
        firstname: 'Jean',
        lastname: 'Dupont',
        address: '13 rue du loup garou',
        postalCode: 75001,
        city: 'paris',
        email: 'test@email.com',
        phoneNumber: '+33684205510'
      }
    })
    const certificate: Certificate = { name: 'filename', buffer: Buffer.alloc(1) }
    policyRepository.get.withArgs(policyId).resolves(policy)
    certificateRepository.generate.withArgs(policy).resolves(certificate)
    contractGenerator.getContractName.withArgs(policyId).returns('signedContract.pdf')
    contractRepository.getSignedContract.withArgs('signedContract.pdf').resolves({ name: 'signedContract.pdf', buffer: Buffer.from('signedContract') })

    const confirmPaymentIntentCommand = createConfirmPaymentIntentCommandFixture({ policyId })

    // When
    await confirmPaymentIntentForPolicy(confirmPaymentIntentCommand)

    // Then
    expect(mailer.send.getCall(0))
      .to.have.been.calledWith(expectedSubscriptionValidationEmail)
  })

  it('Should throw CertificateGenerationError when certificate generation failed', async () => {
    // Given
    const policyId = 'p0l1cy1D'
    const policy: Policy = createOngoingPolicyFixture({
      id: policyId,
      contact: {
        firstname: 'Jean',
        lastname: 'Dupont',
        address: '13 rue du loup garou',
        postalCode: 75001,
        city: 'paris',
        email: 'test@email.com',
        phoneNumber: '+33684205510'
      }
    })
    policyRepository.get.withArgs(policyId).resolves(policy)
    certificateGenerator.generate.withArgs(policy).rejects(new CertificateGenerationError(policyId))

    const confirmPaymentIntentCommand = createConfirmPaymentIntentCommandFixture({ policyId })

    // When
    const promise = confirmPaymentIntentForPolicy(confirmPaymentIntentCommand)

    // Then
    return expect(promise).to.be.rejectedWith(CertificateGenerationError)
  })
})
