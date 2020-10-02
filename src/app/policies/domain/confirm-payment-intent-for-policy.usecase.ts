import { PolicyRepository } from './policy.repository'
import { Policy } from './policy'
import { CertificateGenerator } from './certificate/certificate.generator'
import { Mailer } from '../../common-api/domain/mailer'
import { buildSubscriptionValidationEmail } from './subscription-validation.email'
import { CertificateGenerationError } from './certificate/certificate.errors'
import { SubscriptionValidationEmailBuildError } from './subcription-validation-email.errors'
import { ContractRepository } from './contract/contract.repository'
import { ContractGenerator } from './contract/contract.generator'
import { Payment } from './payment/payment'
import * as PaymentFunc from './payment/payment.func'
import { PaymentRepository } from './payment/payment.repository'
import { Contract } from './contract/contract'
import { Certificate } from './certificate/certificate'

export interface ConfirmPaymentIntentForPolicy {
    (confirmPaymentIntentCommand: ConfirmPaymentIntentCommand): Promise<void>
}

export interface ConfirmPaymentIntentCommand {
    policyId: string,
    amount: Payment.AmountInCents,
    externalId: string,
    processor: Payment.Processor,
    instrument: Payment.Instrument,
    rawPaymentIntent: any
}

export namespace ConfirmPaymentIntentForPolicy {

    export function factory (
      policyRepository: PolicyRepository,
      certificateGenerator: CertificateGenerator,
      contractGenerator: ContractGenerator,
      contractRepository: ContractRepository,
      paymentRepository: PaymentRepository,
      mailer: Mailer
    ): ConfirmPaymentIntentForPolicy {
      return async (confirmPaymentIntentCommand: ConfirmPaymentIntentCommand) => {
        const currentDate: Date = new Date()
        const policyId = confirmPaymentIntentCommand.policyId

        const policy = await policyRepository.get(policyId)

        const signedContract = await retrieveSignedContract(contractGenerator, policyId, contractRepository)

        await policyRepository.updateAfterPayment(policyId, currentDate, currentDate, Policy.Status.Applicable)

        await createNewPayment(policyId, confirmPaymentIntentCommand, paymentRepository)

        const certificate = await generateCertificate(policy, certificateRepository)

        await sendSubscriptionValidationEmail(policy, certificate, signedContract, mailer)
      }
    }

    async function sendSubscriptionValidationEmail (policy: Policy, certificate: Certificate, signedContract: Contract, mailer: Mailer): Promise<void> {
      let email
      try {
        email = buildSubscriptionValidationEmail(policy.contact.email, certificate, signedContract)
      } catch (e) {
        throw new SubscriptionValidationEmailBuildError(policy.id)
      }
      await mailer.send(email)
    }

    async function generateCertificate (policy: Policy, certificateGenerator: CertificateGenerator): Promise<Certificate> {
      try {
        return await certificateGenerator.generate(policy)
      } catch (e) {
        throw new CertificateGenerationError(policy.id)
      }
    }

    async function retrieveSignedContract (contractGenerator: ContractGenerator, policyId: string, contractRepository: ContractRepository): Promise<Contract> {
      const contractFileName = contractGenerator.getContractName(policyId)
      const signedContract = await contractRepository.getSignedContract(contractFileName)
      return signedContract
    }

    async function createNewPayment (policyId: string, confirmPaymentIntentCommand: ConfirmPaymentIntentCommand, paymentRepository: PaymentRepository) {
      const payment = PaymentFunc.createValidPayment(policyId, confirmPaymentIntentCommand.externalId, confirmPaymentIntentCommand.amount, confirmPaymentIntentCommand.processor, confirmPaymentIntentCommand.instrument)
      await paymentRepository.save(payment)
    }
}
