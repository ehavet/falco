import { SignatureRequester } from '../domain/signature-requester'
import { SignatureRequestUrl } from '../domain/signature-request-url'
import { HelloSignConfig } from '../../../configs/hello-sign.config'
import { logger } from '../../../libs/logger'

export class HelloSignSignatureRequester implements SignatureRequester {
    config: HelloSignConfig

    constructor (config: HelloSignConfig) {
      this.config = config
    }

    async create (docPath: string): Promise<SignatureRequestUrl> {
      const options = {
        test_mode: 1,
        clientId: '91c073e7562d88f96d40d013c7b493ef',
        title: 'Titre de la signature',
        subject: 'Le sujet de la signature.',
        message: 'Merci de bien vouloir signer ce document',
        signers: [
          {
            email_address: 'signer@example.com',
            name: 'Syn Gneur'
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
        // files: ['/Users/eha/Projects/falco-api/src/app/policies/api/v0/sample.pdf']
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
