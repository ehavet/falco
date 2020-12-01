export class ExpiredEmailValidationTokenError extends Error {
  constructor (token: string) {
    const message: string = `email validation token has expired : ${token}`
    super(message)
    this.name = 'ExpiredEmailValidationTokenError'
  }
}

export class BadEmailValidationToken extends Error {
  constructor (token: string) {
    const message: string = `email validation token is corrupted : ${token}`
    super(message)
    this.name = 'BadEmailValidationToken'
  }
}

export class EmailValidationQueryConsistencyError extends Error {
  constructor () {
    const message: string = 'Inconsistent email validation query'
    super(message)
    this.name = 'EmailValidationQueryConsistencyError'
  }
}

export class EmailValidationTemplateNotFoundError extends Error {
  constructor (templateName: string) {
    const message: string = `Could not find email validation template : ${templateName}.ejs`
    super(message)
    this.name = 'EmailValidationTemplateNotFoundError'
  }
}
