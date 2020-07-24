export default interface SignatureEvent {
  requestId: string,
  type: SignatureEventType,
  time: string,
  hash: string,
  policyId: string,
  contractFileName: string,
}

export enum SignatureEventType {
  Signed = 'signature_request_sent',
  DocumentsDownloadable = 'signature_request_downloadable'
}
