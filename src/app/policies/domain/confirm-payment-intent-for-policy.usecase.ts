import { PolicyRepository } from './policy.repository'
import { Policy } from './policy'
import { CertificateGenerator } from './certificate/certificate.generator'
import { Mailer } from '../../common-api/domain/mailer'
import { CertificateGenerationError } from './certificate/certificate.errors'
import { ContractRepository } from './contract/contract.repository'
import { ContractGenerator } from './contract/contract.generator'
import { Payment } from './payment/payment'
import * as PaymentFunc from './payment/payment.func'
import { PaymentRepository } from './payment/payment.repository'
import { Contract } from './contract/contract'
import { Certificate } from './certificate/certificate'
import { PaymentProcessor } from './payment-processor'
import { HtmlTemplateEngine } from '../../common-api/domain/html-template-engine'
import { buildSubscriptionValidationEmail, SubscriptionValidationEmail } from '../../email-validations/domain/subscription-validation.email'
import { Amount } from '../../common-api/domain/amount/amount'

export interface ConfirmPaymentIntentForPolicy {
    (confirmPaymentIntentCommand: ConfirmPaymentIntentCommand): Promise<void>
}

export interface ConfirmPaymentIntentCommand {
    policyId: string,
    amount: Amount,
    externalId: string,
    processor: Payment.Processor,
    method: Payment.Method,
    rawPaymentIntent: any
}

export namespace ConfirmPaymentIntentForPolicy {

    export function factory (
      policyRepository: PolicyRepository,
      certificateGenerator: CertificateGenerator,
      contractGenerator: ContractGenerator,
      contractRepository: ContractRepository,
      paymentRepository: PaymentRepository,
      paymentProcessor: PaymentProcessor,
      mailer: Mailer,
      htmlTemplateEngine: HtmlTemplateEngine
    ): ConfirmPaymentIntentForPolicy {
      return async (confirmPaymentIntentCommand: ConfirmPaymentIntentCommand) => {
        const currentDate: Date = new Date()
        const policyId = confirmPaymentIntentCommand.policyId
        const policy = await policyRepository.get(policyId)
        const signedContract = await retrieveSignedContract(contractGenerator, policyId, contractRepository)
        await policyRepository.updateAfterPayment(policyId, currentDate, currentDate, Policy.Status.Applicable)
        await createPayment(policyId, confirmPaymentIntentCommand, paymentRepository, paymentProcessor)
        const certificate = await generateCertificate(policy, certificateGenerator)
        const email: SubscriptionValidationEmail = await buildSubscriptionValidationEmail(policy, certificate, signedContract, htmlTemplateEngine)

        await mailer.send(email)
      }
    }

    async function retrieveSignedContract (contractGenerator: ContractGenerator, policyId: string, contractRepository: ContractRepository): Promise<Contract> {
      const contractFileName = contractGenerator.getContractName(policyId)
      return await contractRepository.getSignedContract(contractFileName)
    }

    async function createPayment (policyId: string, confirmPaymentIntentCommand: ConfirmPaymentIntentCommand, paymentRepository: PaymentRepository, paymentProcessor: PaymentProcessor) {
      const pspFee = await paymentProcessor.getTransactionFee(confirmPaymentIntentCommand.rawPaymentIntent)
      const payment = PaymentFunc.createValidPayment(policyId, confirmPaymentIntentCommand.externalId, confirmPaymentIntentCommand.amount, confirmPaymentIntentCommand.processor, confirmPaymentIntentCommand.method, pspFee)
      await paymentRepository.save(payment)
    }

    async function generateCertificate (policy: Policy, certificateGenerator: CertificateGenerator): Promise<Certificate> {
      try {
        return await certificateGenerator.generate(policy)
      } catch (e) {
        throw new CertificateGenerationError(policy.id)
      }
    }
}
