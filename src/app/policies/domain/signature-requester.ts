import { SignatureRequest } from './signature-request'
import { Signer } from './signer'

export interface SignatureRequester {
    create(docToSignPath: string, signer: Signer): Promise<SignatureRequest>
}
