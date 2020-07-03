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
