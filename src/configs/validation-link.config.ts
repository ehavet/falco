const config = require('../config')

export interface ValidationLinkConfig {
  baseUrl: string
  validityPeriodinMonth: number
  emailSender: string
}

export const validationLinkConfig: ValidationLinkConfig = {
  baseUrl: config.get('FALCO_API_EMAIL_VALIDATION_URL'),
  validityPeriodinMonth: config.get('FALCO_API_EMAIL_VALIDATION_VALIDITY_PERIOD'),
  emailSender: config.get('FALCO_API_APPENIN_EMAIL_ADDRESS')
}
