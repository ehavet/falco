import { Policy } from '../policy'
import { Certificate } from './certificate'

export interface CertificateGenerator {
    generate(policy: Policy): Promise<Certificate>
}
