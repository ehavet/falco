import { PolicyRepository } from '../policy.repository'
import { CertificateGenerator } from './certificate.generator'
import { GeneratePolicyCertificateQuery } from './generate-policy-certificate-query'
import { Certificate } from './certificate'
import { Policy } from '../policy'
import { PolicyForbiddenCertificateGenerationError } from './certificate.errors'
import { PolicyCanceledError } from '../policies.errors'

export interface GeneratePolicyCertificate {
    (generatePolicyCertificateQuery: GeneratePolicyCertificateQuery): Promise<Certificate>
}

export namespace GeneratePolicyCertificate {

    export function factory (policyRepository: PolicyRepository, certificateGenerator: CertificateGenerator): GeneratePolicyCertificate {
      return async (generatePolicyCertificateQuery: GeneratePolicyCertificateQuery): Promise<Certificate> => {
        const policy: Policy = await policyRepository.get(generatePolicyCertificateQuery.policyId)
        if (Policy.isCancelled(policy)) { throw new PolicyCanceledError(policy.id) }
        if (policy.status === Policy.Status.Applicable) {
          return certificateGenerator.generate(policy)
        }
        throw new PolicyForbiddenCertificateGenerationError()
      }
    }
}
