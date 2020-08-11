import routes from './api/v0/policies.api'
import paymentProcessorEventHandler from './api/v0/payment-processor.api'
import signatureProcessorEventHandler from './api/v0/signature-processor.api'
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
import { CreateSignatureRequestForPolicy } from './domain/create-signature-request-for-policy.usecase'
import { SignatureRequestProvider } from './domain/signature-request-provider'
import { HelloSignSignatureRequestProvider } from './infrastructure/hello-sign-signature-request.provider'
import { helloSignConfig } from '../../configs/hello-sign.config'
import { ContractRepository } from './domain/contract/contract.repository'
import { ContractGenerator } from './domain/contract/contract.generator'
import { ContractFsRepository } from './infrastructure/contract/contract-fs.repository'
import { ContractPdfGenerator } from './infrastructure/contract/contract-pdf.generator'
import { ManageSignatureRequestEvent } from './domain/signature/manage-signature-request-event.usecase'
import { SignatureRequestEventValidator } from './domain/signature/signature-request-event-validator'
import { HelloSignRequestEventValidator } from './infrastructure/signature/hello-sign-request-event.validator'
import { logger } from '../../libs/logger'
import { Mailer } from '../common-api/domain/mailer'
import { Nodemailer } from '../common-api/infrastructure/nodemailer.mailer'
import { nodemailerTransporter } from '../../libs/nodemailer'
import { UpdatePolicy } from './domain/update-policy.usecase'
import { DoesPartnerAllowRoommates } from '../partners/domain/does-partner-allow-roommates.usecase'
import { ApplySpecialOperationCodeOnPolicy } from './domain/apply-special-operation-code-on-policy.usecase'
import { ApplyStartDateOnPolicy } from './domain/apply-start-date-on-policy.usecase'
const config = require('../../config')

export interface Container {
    CreatePaymentIntentForPolicy: CreatePaymentIntentForPolicy
    CreatePolicy: CreatePolicy
    ConfirmPaymentIntentForPolicy: ConfirmPaymentIntentForPolicy
    GetPolicy: GetPolicy
    PaymentEventAuthenticator: PaymentEventAuthenticator
    GeneragePolicyCertificate: GeneratePolicyCertificate
    CreateSignatureRequestForPolicy: CreateSignatureRequestForPolicy
    GetPolicySpecificTerms: GetPolicySpecificTerms,
    ManageSignatureRequestEvent: ManageSignatureRequestEvent,
    UpdatePolicy: UpdatePolicy,
    ApplySpecialOperationCodeOnPolicy: ApplySpecialOperationCodeOnPolicy,
    ApplyStartDateOnPolicy: ApplyStartDateOnPolicy
}

const policyRepository: PolicyRepository = new PolicySqlRepository()
const quoteRepository: QuoteRepository = quoteContainer.quoteRepository
const paymentProcessor: StripePaymentProcessor = new StripePaymentProcessor(stripe)
const paymentEventAuthenticator: StripeEventAuthenticator = new StripeEventAuthenticator(stripeConfig)
const partnerRepository: PartnerRepository = partnerContainer.partnerRepository
const certificateRepository: CertificateRepository = new CertificatePdfRepository()
const signatureRequestProvider: SignatureRequestProvider = new HelloSignSignatureRequestProvider(helloSignConfig, logger)
const specificTermsRepository: SpecificTermsRepository = new SpecificTermsFSRepository(config)
const specificTermsGenerator: SpecificTermsGenerator = new SpecificTermsPdfGenerator()
const contractRepository: ContractRepository = new ContractFsRepository(config)
const contractGenerator: ContractGenerator = new ContractPdfGenerator()
const signatureRequestEventValidator: SignatureRequestEventValidator = new HelloSignRequestEventValidator(helloSignConfig)
const mailer: Mailer = new Nodemailer(nodemailerTransporter)
const createPaymentIntentForPolicy: CreatePaymentIntentForPolicy =
    CreatePaymentIntentForPolicy.factory(paymentProcessor, policyRepository)

const sendValidationLinkToEmailAddress: SendValidationLinkToEmailAddress = emailValidationContainer.SendValidationLinkToEmailAddress
const doesPartnerAllowRoommates: DoesPartnerAllowRoommates = partnerContainer.DoesPartnerAllowRoommates
const createPolicy: CreatePolicy = CreatePolicy.factory(policyRepository, quoteRepository, partnerRepository, sendValidationLinkToEmailAddress, doesPartnerAllowRoommates)
const confirmPaymentIntentForPolicy: ConfirmPaymentIntentForPolicy =
    ConfirmPaymentIntentForPolicy.factory(policyRepository, certificateRepository, contractGenerator, contractRepository, mailer)
const getPolicy: GetPolicy = GetPolicy.factory(policyRepository)
const generatePolicyCertificate: GeneratePolicyCertificate = GeneratePolicyCertificate.factory(policyRepository, certificateRepository)
const getPolicySpecificTerms: GetPolicySpecificTerms = GetPolicySpecificTerms.factory(specificTermsRepository, specificTermsGenerator)
const createSignatureRequestForPolicy: CreateSignatureRequestForPolicy = CreateSignatureRequestForPolicy
  .factory(
    specificTermsGenerator,
    specificTermsRepository,
    contractGenerator,
    contractRepository,
    policyRepository,
    signatureRequestProvider
  )
const manageSignatureRequestEvent: ManageSignatureRequestEvent = ManageSignatureRequestEvent.factory(signatureRequestEventValidator, signatureRequestProvider, policyRepository, contractRepository, logger)
const applySpecialOperationCodeOnPolicy: ApplySpecialOperationCodeOnPolicy = ApplySpecialOperationCodeOnPolicy.factory(policyRepository, partnerRepository)
const updatePolicy: UpdatePolicy = UpdatePolicy.factory(policyRepository, applySpecialOperationCodeOnPolicy)
const applyStartDateOnPolicy: ApplyStartDateOnPolicy = ApplyStartDateOnPolicy.factory(policyRepository)

export const container: Container = {
  CreatePaymentIntentForPolicy: createPaymentIntentForPolicy,
  CreatePolicy: createPolicy,
  GetPolicy: getPolicy,
  ConfirmPaymentIntentForPolicy: confirmPaymentIntentForPolicy,
  PaymentEventAuthenticator: paymentEventAuthenticator,
  GeneragePolicyCertificate: generatePolicyCertificate,
  GetPolicySpecificTerms: getPolicySpecificTerms,
  CreateSignatureRequestForPolicy: createSignatureRequestForPolicy,
  ManageSignatureRequestEvent: manageSignatureRequestEvent,
  UpdatePolicy: updatePolicy,
  ApplySpecialOperationCodeOnPolicy: applySpecialOperationCodeOnPolicy,
  ApplyStartDateOnPolicy: applyStartDateOnPolicy
}

export const policySqlModels: Array<any> = [PolicySqlModel, ContactSqlModel]

export function policiesRoutes () {
  return routes(container, logger)
    .concat(paymentProcessorEventHandler(container))
    .concat(signatureProcessorEventHandler(container, logger))
}
