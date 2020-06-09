import { dateFaker } from './utils/date-faker.test-utils'
import { HttpServerForTesting, newProdLikeServer, newMinimalServer } from './utils/server.test-utils'
import chai from './utils/chai.test-utils'
const sinon = require('sinon')

const expect = chai.expect

export { sinon, chai, expect, dateFaker, HttpServerForTesting, newProdLikeServer, newMinimalServer }

afterEach(() => {
  dateFaker.restoreDate()
  sinon.restore()
})
