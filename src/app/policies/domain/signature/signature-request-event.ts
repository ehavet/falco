export default interface SignatureRequestEvent {
  requestId: string,
  type: SignatureEventType,
  policyId: string,
  contractFileName: string,
  validation: Validation
}

export enum SignatureEventType {
  Signed = 'SIGNED',
  DocumentsDownloadable = 'DOCUMENTS_DOWNLOADABLE',
  Unknown = 'UNKNOWN'
}

interface Validation {
  rawEventType: string,
  time: string,
  hash: string,
}
