import JSZip from 'jszip'
import { expect, sinon } from '../../../test-utils'
import { HelloSignSignatureRequester } from '../../../../src/app/policies/infrastructure/hello-sign.signature-requester'
import { HelloSignConfig } from '../../../../src/configs/hello-sign.config'
import { Contract } from '../../../../src/app/policies/domain/contract/contract'
import { Readable } from 'stream'

describe('HelloSignSignatureRequester', async () => {
  const config: HelloSignConfig = {
    hellosign: {
      signatureRequest: {
        createEmbedded: sinon.mock(),
        download: sinon.mock()
      },
      embedded: { getSignUrl: sinon.mock() }
    },
    clientId: 'Cl13nt1D',
    testMode: true,
    key: 'fakeKey'
  }

  const helloSignSignatureRequester: HelloSignSignatureRequester = new HelloSignSignatureRequester(config)

  describe('#create', async () => {
    let signatureId
    let expectedSignUrl
    let options
    let docToSignPath
    let signer

    beforeEach(async () => {
      docToSignPath = '/path/here/doc.pdf'
      signatureId = 's1gn4tur31D'
      expectedSignUrl = 'http://sign.url'
      options = {
        test_mode: 1,
        clientId: 'Cl13nt1D',
        signers: [
          {
            email_address: 'signer@example.com',
            name: 'jean jean'
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
        metadata: { policyId: 'APP854732084' },
        files: [docToSignPath]
      }
      signer = { emailAdress: 'signer@example.com', name: 'jean jean', policyId: 'APP854732084' }
    })

    it('should return sign url when signature request is created', async () => {
      // Given
      config.hellosign.signatureRequest.createEmbedded.withExactArgs(options).resolves({
        signature_request: { signatures: [{ signature_id: signatureId }] }
      })
      config.hellosign.embedded.getSignUrl.withExactArgs(signatureId).resolves({
        embedded: { sign_url: expectedSignUrl }
      })
      // When
      const response = await helloSignSignatureRequester.create(docToSignPath, signer)
      // Then
      expect(response).to.deep.equal({ url: expectedSignUrl })
    })

    it('should thrown error when signature request creation failed', async () => {
      // Given
      config.hellosign.signatureRequest.createEmbedded.withExactArgs(options)
        .rejects(new Error())
      // When
      await expect(helloSignSignatureRequester.create(docToSignPath, signer))
      // Then
        .to.be.rejectedWith(Error)
    })
  })

  describe('#getSignedContract', async () => {
    it('should return the contract', async () => {
      // Given
      const contractFileName: string = 'contrat_APP658934103.pdf'
      const signatureRequestId: string = 'signatureRequestId'
      const contractBuffer: Buffer = Buffer.from('contract')
      const hellosignZipBuffer = await new JSZip().file(contractFileName, contractBuffer).generateAsync({ type: 'nodebuffer' })
      const hellosignZipStream = await Readable.from(hellosignZipBuffer)
      config.hellosign.signatureRequest.download.withExactArgs(signatureRequestId, { file_type: 'zip' }).resolves(hellosignZipStream)

      // When
      const contract: Contract = await helloSignSignatureRequester.getSignedContract(signatureRequestId, contractFileName)

      // Then
      expect(contract.name).to.equal(contractFileName)
      expect(contract.buffer).to.deep.equal(contractBuffer)
    })
  })
})
