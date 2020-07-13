import { Policy } from './policy'
import { Certificate } from './certificate'

export interface CertificateRepository {
    generate(policy: Policy): Promise<Certificate>
}
