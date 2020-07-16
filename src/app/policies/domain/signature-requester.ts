import { SignatureRequestUrl } from './signature-request-url'

export interface SignatureRequester {
    create(docToSignPath: string): Promise<SignatureRequestUrl>
}
