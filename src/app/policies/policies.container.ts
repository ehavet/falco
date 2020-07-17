import routes from './api/v0/policies.api'
import paymentProcessorEventHandler from './api/v0/payment-processor.api'
import { CreatePaymentIntentForPolicy } from './domain/create-payment-intent-for-policy.usecase'
import { PolicySqlModel } from './infrastructure/policy-sql.model'
import { ContactSqlModel } from './infrastructure/contact-sql.model'
import { StripePaymentProcessor } from './infrastructure/stripe.payment-processor'
import { stripe } from '../../libs/stripe'
import { PolicyRepository } from './domain/policy.repository'
import { CreatePolicy } from './domain/create-policy.usecase'
import { PolicySqlRepository } from './infrastructure/policy-sql.repository'
import { container as quoteContainer } from '../quotes/quote.container'
import { container as emailValidationContainer } from '../email-validations/email-validations.container'
import { container as partnerContainer } from '../partners/partner.container'
import { QuoteRepository } from '../quotes/domain/quote.repository'
import { ConfirmPaymentIntentForPolicy } from './domain/confirm-payment-intent-for-policy.usecase'
import { SendValidationLinkToEmailAddress } from '../email-validations/domain/send-validation-link-to-email-address.usecase'
import { PartnerRepository } from '../partners/domain/partner.repository'
import { GetPolicy } from './domain/get-policy.usecase'
import { CertificatePdfRepository } from './infrastructure/certificate-pdf/certificate-pdf.repository'
import { CertificateRepository } from './domain/certificate/certificate.repository'
import { GeneratePolicyCertificate } from './domain/certificate/generate-policy-certificate.usecase'
import { StripeEventAuthenticator } from './infrastructure/stripe.event-authenticator'
import { stripeConfig } from '../../configs/stripe.config'
import { PaymentEventAuthenticator } from './domain/payment-event-authenticator'
import { GetPolicySpecificTerms } from './domain/specific-terms/get-policy-specific-terms.usecase'
import { SpecificTermsRepository } from './domain/specific-terms/specific-terms.repository'
import { SpecificTermsFSRepository } from './infrastructure/specific-terms-pdf/specific-terms-fs.repository'
import { SpecificTermsGenerator } from './domain/specific-terms/specific-terms.generator'
import { SpecificTermsPdfGenerator } from './infrastructure/specific-terms-pdf/specific-terms-pdf.generator'
const config = require('../../config')

export interface Container {
    CreatePaymentIntentForPolicy: CreatePaymentIntentForPolicy
    CreatePolicy: CreatePolicy
    ConfirmPaymentIntentForPolicy: ConfirmPaymentIntentForPolicy
    GetPolicy: GetPolicy
    PaymentEventAuthenticator: PaymentEventAuthenticator
    GeneragePolicyCertificate: GeneratePolicyCertificate
    GetPolicySpecificTerms: GetPolicySpecificTerms
}

const policyRepository: PolicyRepository = new PolicySqlRepository()
const quoteRepository: QuoteRepository = quoteContainer.quoteRepository
const paymentProcessor: StripePaymentProcessor = new StripePaymentProcessor(stripe)
const paymentEventAuthenticator: StripeEventAuthenticator = new StripeEventAuthenticator(stripeConfig)
const partnerRepository: PartnerRepository = partnerContainer.partnerRepository
const certificateRepository: CertificateRepository = new CertificatePdfRepository()
const specificTermsRepository: SpecificTermsRepository = new SpecificTermsFSRepository(config)
const specificTermsGenerator: SpecificTermsGenerator = new SpecificTermsPdfGenerator()

const createPaymentIntentForPolicy: CreatePaymentIntentForPolicy =
    CreatePaymentIntentForPolicy.factory(paymentProcessor, policyRepository)
const sendValidationLinkToEmailAddress: SendValidationLinkToEmailAddress = emailValidationContainer.SendValidationLinkToEmailAddress
const createPolicy: CreatePolicy = CreatePolicy.factory(policyRepository, quoteRepository, partnerRepository, sendValidationLinkToEmailAddress)
const confirmPaymentIntentForPolicy: ConfirmPaymentIntentForPolicy =
    ConfirmPaymentIntentForPolicy.factory(policyRepository)
const getPolicy: GetPolicy = GetPolicy.factory(policyRepository)
const generatePolicyCertificate: GeneratePolicyCertificate = GeneratePolicyCertificate.factory(policyRepository, certificateRepository)
const getPolicySpecificTerms: GetPolicySpecificTerms = GetPolicySpecificTerms.factory(specificTermsRepository, specificTermsGenerator)

export const container: Container = {
  CreatePaymentIntentForPolicy: createPaymentIntentForPolicy,
  CreatePolicy: createPolicy,
  GetPolicy: getPolicy,
  ConfirmPaymentIntentForPolicy: confirmPaymentIntentForPolicy,
  PaymentEventAuthenticator: paymentEventAuthenticator,
  GeneragePolicyCertificate: generatePolicyCertificate,
  GetPolicySpecificTerms: getPolicySpecificTerms
}

export const policySqlModels: Array<any> = [PolicySqlModel, ContactSqlModel]

export function policiesRoutes () {
  return routes(container).concat(paymentProcessorEventHandler(container))
}
