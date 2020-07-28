const config = require('../config')

export interface ValidationLinkConfig {
  baseUrl: string
  validityPeriodinMonth: number
  frontUrl: string,
  frontCallbackPageRoute: string
  locales: string[]
}

export const validationLinkConfig: ValidationLinkConfig = {
  baseUrl: config.get('FALCO_API_EMAIL_VALIDATION_URL'),
  validityPeriodinMonth: config.get('FALCO_API_EMAIL_VALIDATION_VALIDITY_PERIOD'),
  frontUrl: config.get('FALCO_API_FALCO_FRONT_URL'),
  frontCallbackPageRoute: config.get('FALCO_API_EMAIL_VALIDATION_APPENIN_CALLBACK_PAGE_ROUTE'),
  locales: ['fr', 'en']
}
