import { SignatureRequest } from './signature-request'
import { Signer } from './signer'
import { Contract } from './contract/contract'

export interface SignatureRequester {
    create(docToSignPath: string, signer: Signer): Promise<SignatureRequest>
    getSignedContract(signatureRequestId: string, contractFileName: string): Promise<Contract>
}
