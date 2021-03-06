import SignatureRequestEvent, { SignatureRequestEventType } from '../../../domain/signature/signature-request-event'

export function resourceToDomain (signatureRequestEventJson: any): SignatureRequestEvent {
  return {
    requestId: signatureRequestEventJson.signature_request.signature_request_id,
    type: _toType(signatureRequestEventJson.event.event_type),
    policyId: signatureRequestEventJson.signature_request.metadata.policyId,
    contractFileName: signatureRequestEventJson.signature_request.metadata.contractFileName,
    validation: {
      rawEventType: signatureRequestEventJson.event.event_type,
      time: signatureRequestEventJson.event.event_time,
      hash: signatureRequestEventJson.event.event_hash
    }
  }
}

function _toType (eventType: string) {
  switch (eventType) {
    case 'signature_request_signed':
      return SignatureRequestEventType.Signed
    case 'signature_request_downloadable':
      return SignatureRequestEventType.DocumentsDownloadable
    default:
      return SignatureRequestEventType.Unknown
  }
}
