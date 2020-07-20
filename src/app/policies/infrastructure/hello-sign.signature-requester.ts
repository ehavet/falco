import { SignatureRequester } from '../domain/signature-requester'
import { SignatureRequest } from '../domain/signature-request'
import { HelloSignConfig } from '../../../configs/hello-sign.config'
import { logger } from '../../../libs/logger'
import { Signer } from '../domain/signer'

export class HelloSignSignatureRequester implements SignatureRequester {
    config: HelloSignConfig

    constructor (config: HelloSignConfig) {
      this.config = config
    }

    async create (docPath: string, signer: Signer): Promise<SignatureRequest> {
      const options = {
        test_mode: this.config.testMode ? 1 : 0,
        clientId: this.config.clientId,
        title: 'Titre de la signature',
        subject: 'Le sujet de la signature.',
        message: 'Merci de bien vouloir signer ce document',
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
        files: [docPath]
      }
      try {
        const embeddedSignatureRequest = await this.config.hellosign.signatureRequest.createEmbedded(options)
        const signatureId = embeddedSignatureRequest.signature_request.signatures[0].signature_id
        const signUrl = await this.config.hellosign.embedded.getSignUrl(signatureId)
        return { url: signUrl.embedded.sign_url }
      } catch (error) {
        logger.error(error)
        throw error
      }
    }
}
