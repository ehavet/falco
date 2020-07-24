import JSZip from 'jszip'
import { SignatureRequester } from '../domain/signature-requester'
import { SignatureRequest } from '../domain/signature-request'
import { HelloSignConfig } from '../../../configs/hello-sign.config'
import { Signer } from '../domain/signer'
import { Contract } from '../domain/contract/contract'
import { IncomingMessage } from 'http'
import { Logger } from '../../../libs/logger'
import { SignedContractDownloadError, SignedContractDownloadNotFound } from '../domain/signature/signature.errors'

export class HelloSignSignatureRequester implements SignatureRequester {
  constructor (private config: HelloSignConfig, private logger: Logger) { }

  async create (docPath: string, signer: Signer): Promise<SignatureRequest> {
    const options = {
      test_mode: this.config.testMode ? 1 : 0,
      clientId: this.config.clientId,
      signers: [
        {
          email_address: signer.emailAdress,
          name: signer.name
        }
      ],
      form_fields_per_document: [
        [
          {
            api_id: 'signature_box',
            name: '',
            type: 'signature',
            x: 192,
            y: 562,
            width: 260,
            height: 160,
            required: true,
            signer: 0,
            page: 1
          }
        ]
      ],
      metadata: {
        policyId: signer.policyId,
        contractFileName: this.extractContractFileName(docPath)
      },
      files: [docPath]
    }
    try {
      const embeddedSignatureRequest = await this.config.hellosign.signatureRequest.createEmbedded(options)
      const signatureId = embeddedSignatureRequest.signature_request.signatures[0].signature_id
      const signUrl = await this.config.hellosign.embedded.getSignUrl(signatureId)
      return { url: signUrl.embedded.sign_url }
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  async getSignedContract (signatureRequestId: string, contractFileName: string): Promise<Contract> {
    const downloadedDocuments: IncomingMessage = await this.downloadDocuments(signatureRequestId)
    const signedContract = await this.extractSignedContract(downloadedDocuments, contractFileName)
    if (signedContract) {
      const signedContractBuffer = await signedContract.async('nodebuffer')
      return { name: contractFileName, buffer: signedContractBuffer }
    }
    throw new SignedContractDownloadNotFound(signatureRequestId, contractFileName)
  }

  private async downloadDocuments (signatureRequestId: string): Promise<IncomingMessage> {
    try {
      return await this.config.hellosign.signatureRequest.download(signatureRequestId, { file_type: 'zip' })
    } catch (error) {
      this.logger.error(`Error while downloading documents for the signature request id ${signatureRequestId}`, error)
      throw new SignedContractDownloadError(signatureRequestId)
    }
  }

  private async extractSignedContract (downloadedDocuments: IncomingMessage, contractFileName: string) {
    const documentsZipAsBuffer: Buffer = await this.readStream(downloadedDocuments)

    const documentsZip: JSZip = await JSZip.loadAsync(documentsZipAsBuffer)
    const foundSignedContract = documentsZip.file(new RegExp(contractFileName))[0]
    return foundSignedContract
  }

  private async readStream (stream: IncomingMessage): Promise<Buffer> {
    const chunks: Array<Buffer> = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    return Buffer.concat(chunks)
  }

  private extractContractFileName (docPath: string) {
    return docPath.split(/[\s/]+/).pop()
  }
}
