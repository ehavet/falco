import { expect, HttpServerForTesting, newProdLikeServer } from '../../../../test-utils'
import { PolicySqlRepository } from '../../../../../src/app/policies/infrastructure/policy-sql.repository'
import { createPolicyFixture } from '../../fixtures/policy.fixture'
import { Policy } from '../../../../../src/app/policies/domain/policy'
import { PolicySqlModel } from '../../../../../src/app/policies/infrastructure/policy-sql.model'
import { signatureRequestEventJSONFixture } from '../../fixtures/signatureRequestEventJSON.fixture'

describe('Signature Event Handler - API - E2E', async () => {
  let httpServer: HttpServerForTesting

  describe('POST /internal/v0/signature-processor/event-handler/', async () => {
    before(async () => {
      httpServer = await newProdLikeServer()
    })

    it('should update the policy if a signed event is received', async () => {
      // Given
      const signatureRequestSignedEvent = signatureRequestEventJSONFixture()
      const policyId = signatureRequestSignedEvent.signature_request.metadata.policyId
      const policy = createPolicyFixture({
        id: policyId,
        status: Policy.Status.Initiated
      })
      const policyRepository = new PolicySqlRepository()
      await policyRepository.save(policy)

      // When
      await httpServer.api()
        .post('/internal/v0/signature-processor/event-handler/')
        .type('multipart/form-data')
        .field('json', JSON.stringify(signatureRequestSignedEvent))

      // Then
      // Because we launch the event treatment and we don't wait for the result, the policy
      // update is done asynchronously and we have to wait a little bit in the test
      setTimeout(async function () {
        const updatedPolicy = await policyRepository.get(policyId)
        expect(updatedPolicy.status).to.equal(Policy.Status.Signed)
        await PolicySqlModel.destroy({ truncate: true, cascade: true })
      }, 100)
    })
  })
})
