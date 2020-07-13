import { PolicyRepository } from '../policy.repository'
import { CertificateRepository } from './certificate.repository'
import { GeneratePolicyCertificateQuery } from './generate-policy-certificate-query'
import { Certificate } from './certificate'
import { Policy } from '../policy'

export interface GeneratePolicyCertificate {
    (generatePolicyCertificateQuery: GeneratePolicyCertificateQuery): Promise<Certificate>
}

export namespace GeneratePolicyCertificate {

    export function factory (policyRepository: PolicyRepository, certificateRepository: CertificateRepository): GeneratePolicyCertificate {
      return async (generatePolicyCertificateQuery: GeneratePolicyCertificateQuery): Promise<Certificate> => {
        const policy: Policy = await policyRepository.get(generatePolicyCertificateQuery.policyId)
        return certificateRepository.generate(policy)
      }
    }
}
