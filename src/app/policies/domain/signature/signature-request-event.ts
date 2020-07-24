export default interface SignatureRequestEvent {
  requestId: string,
  type: SignatureRequestEventType,
  policyId: string,
  contractFileName: string,
  validation: Validation
}

export enum SignatureRequestEventType {
  Signed = 'SIGNED',
  DocumentsDownloadable = 'DOCUMENTS_DOWNLOADABLE',
  Unknown = 'UNKNOWN'
}

interface Validation {
  rawEventType: string,
  time: string,
  hash: string,
}
