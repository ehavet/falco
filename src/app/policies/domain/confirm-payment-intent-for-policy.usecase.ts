import { PolicyRepository } from './policy.repository'
import { Policy } from './policy'
import { CertificateGenerator } from './certificate/certificate.generator'
import { Mailer } from '../../common-api/domain/mailer'
import { buildSubscriptionValidationEmail } from './subscription-validation.email'
import { CertificateGenerationError } from './certificate/certificate.errors'
import { SubscriptionValidationEmailBuildError } from './subcription-validation-email.errors'
import { ContractRepository } from './contract/contract.repository'
import { ContractGenerator } from './contract/contract.generator'

export interface ConfirmPaymentIntentForPolicy {
    (policyId: string): Promise<void>
}

export namespace ConfirmPaymentIntentForPolicy {
    export function factory (
      policyRepository: PolicyRepository,
      certificateGenerator: CertificateGenerator,
      contractGenerator: ContractGenerator,
      contractRepository: ContractRepository,
      mailer: Mailer
    ): ConfirmPaymentIntentForPolicy {
      return async (policyId: string) => {
        const currentDate: Date = new Date()
        await policyRepository.updateAfterPayment(policyId, currentDate, currentDate, Policy.Status.Applicable)
        const policy = await policyRepository.get(policyId)

        let certificate
        try {
          certificate = await certificateGenerator.generate(policy)
        } catch (e) {
          throw new CertificateGenerationError(policyId)
        }

        const contractFileName = contractGenerator.getContractName(policyId)
        const signedContract = await contractRepository.getSignedContract(contractFileName)

        let email
        try {
          email = buildSubscriptionValidationEmail(policy.contact.email, certificate, signedContract)
        } catch (e) {
          throw new SubscriptionValidationEmailBuildError(policyId)
        }
        await mailer.send(email)
      }
    }
}
