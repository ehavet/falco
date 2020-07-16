import { SignatureRequest } from './signature-request'

export interface SignatureRequester {
    create(docToSignPath: string): Promise<SignatureRequest>
}
