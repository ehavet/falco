import PoliciesRoutesV0 from './api/v0/policies.api'
import paymentProcessorEventHandlerV0 from './api/v0/payment-processor.api'
import signatureProcessorEventHandlerV0 from './api/v0/signature-processor.api'
import PoliciesRoutesV1 from './api/v1/policies.api'
import paymentProcessorEventHandlerV1 from './api/v1/payment-processor.api'
import signatureProcessorEventHandlerV1 from './api/v1/signature-processor.api'
import { CreatePaymentIntentForPolicy } from './domain/create-payment-intent-for-policy.usecase'
import { PolicySqlModel } from './infrastructure/policy-sql.model'
import { PolicyPersonSqlModel } from './infrastructure/policy-person-sql.model'
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
import { CertificatePdfGenerator } from './infrastructure/certificate-pdf/certificate-pdf.generator'
import { CertificateGenerator } from './domain/certificate/certificate.generator'
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
import { ApplySpecialOperationCodeOnPolicy } from './domain/apply-special-operation-code-on-policy.usecase'
import { ApplyStartDateOnPolicy } from './domain/apply-start-date-on-policy.usecase'
import { PolicyInsuranceSqlModel } from '../quotes/infrastructure/policy-insurance-sql.model'
import { PolicyPropertySqlModel } from '../quotes/infrastructure/policy-property-sql.model'
import { PolicyRiskSqlModel } from '../quotes/infrastructure/policy-risk-sql.model'
import { PolicyRiskOtherPeopleSqlModel } from './infrastructure/policy-risk-other-people-sql.model'
import { PDFProcessor } from './infrastructure/pdf/pdf-processor'
import { PDFtkPDFProcessor } from './infrastructure/pdf/pdftk.pdf-processor'
import { pdfGenerationConfig } from '../../configs/pdf-generation.config'
import { PaymentRepository } from './domain/payment/payment.repository'
import { PaymentSqlRepository } from './infrastructure/payment/payment-sql.repository'
import { PaymentSqlModel } from './infrastructure/payment/payment-sql.model'
import { PaymentPolicySqlModel } from './infrastructure/payment/payment-policy-sql.model'
import { CreatePolicyForQuote } from './domain/create-policy-for-quote.usecase'
import { container as commonApiContainer } from '../common-api/common-api.container'
import { HtmlTemplateEngine } from '../common-api/domain/html-template-engine'
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
    ApplySpecialOperationCodeOnPolicy: ApplySpecialOperationCodeOnPolicy,
    ApplyStartDateOnPolicy: ApplyStartDateOnPolicy,
    CreatePolicyForQuote: CreatePolicyForQuote
}

const pdftkPDFProcessor: PDFProcessor = new PDFtkPDFProcessor(pdfGenerationConfig)
const policyRepository: PolicyRepository = new PolicySqlRepository()
const quoteRepository: QuoteRepository = quoteContainer.quoteRepository
const paymentProcessor: StripePaymentProcessor = new StripePaymentProcessor(stripe, logger)
const paymentEventAuthenticator: StripeEventAuthenticator = new StripeEventAuthenticator(stripeConfig)
const partnerRepository: PartnerRepository = partnerContainer.partnerRepository
const certificateGenerator: CertificateGenerator = new CertificatePdfGenerator(pdftkPDFProcessor)
const signatureRequestProvider: SignatureRequestProvider = new HelloSignSignatureRequestProvider(helloSignConfig, logger)
const specificTermsRepository: SpecificTermsRepository = new SpecificTermsFSRepository(config)
const specificTermsGenerator: SpecificTermsGenerator = new SpecificTermsPdfGenerator(pdftkPDFProcessor)
const contractRepository: ContractRepository = new ContractFsRepository(config)
const contractGenerator: ContractGenerator = new ContractPdfGenerator(pdftkPDFProcessor)
const signatureRequestEventValidator: SignatureRequestEventValidator = new HelloSignRequestEventValidator(helloSignConfig)
const mailer: Mailer = commonApiContainer.mailer
const paymentRepository: PaymentRepository = new PaymentSqlRepository()
const createPaymentIntentForPolicy: CreatePaymentIntentForPolicy =
    CreatePaymentIntentForPolicy.factory(paymentProcessor, policyRepository)
const htmlTemplateEngine: HtmlTemplateEngine = commonApiContainer.htmlTemplateEngine

const sendValidationLinkToEmailAddress: SendValidationLinkToEmailAddress = emailValidationContainer.SendValidationLinkToEmailAddress
const createPolicy: CreatePolicy = CreatePolicy.factory(policyRepository, quoteRepository, partnerRepository, sendValidationLinkToEmailAddress)
const confirmPaymentIntentForPolicy: ConfirmPaymentIntentForPolicy =
    ConfirmPaymentIntentForPolicy.factory(policyRepository, certificateGenerator, contractGenerator, contractRepository, paymentRepository, paymentProcessor, mailer, htmlTemplateEngine)
const getPolicy: GetPolicy = GetPolicy.factory(policyRepository)
const generatePolicyCertificate: GeneratePolicyCertificate = GeneratePolicyCertificate.factory(policyRepository, certificateGenerator)
const getPolicySpecificTerms: GetPolicySpecificTerms = GetPolicySpecificTerms.factory(specificTermsRepository, specificTermsGenerator, policyRepository)
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
const applyStartDateOnPolicy: ApplyStartDateOnPolicy = ApplyStartDateOnPolicy.factory(policyRepository)
const createPolicyForQuote: CreatePolicyForQuote = CreatePolicyForQuote.factory(policyRepository, quoteRepository, partnerRepository)

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
  ApplySpecialOperationCodeOnPolicy: applySpecialOperationCodeOnPolicy,
  ApplyStartDateOnPolicy: applyStartDateOnPolicy,
  CreatePolicyForQuote: createPolicyForQuote
}

export const policySqlModels: Array<any> = [
  PolicySqlModel, PolicyPersonSqlModel, PolicyInsuranceSqlModel,
  PolicyRiskOtherPeopleSqlModel, PolicyPropertySqlModel, PolicyRiskSqlModel,
  PaymentSqlModel, PaymentPolicySqlModel
]

export function policiesRoutes () {
  return PoliciesRoutesV0(container)
    .concat(paymentProcessorEventHandlerV0(container))
    .concat(signatureProcessorEventHandlerV0(container))
    .concat(PoliciesRoutesV1(container))
    .concat(paymentProcessorEventHandlerV1(container))
    .concat(signatureProcessorEventHandlerV1(container))
}
