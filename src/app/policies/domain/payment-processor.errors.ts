export class UnauthenticatedEventError extends Error {
  constructor (message: string) {
    super(`Event could not have been authenticated : ${message}`)
    this.name = 'UnauthenticatedEventError'
  }
}
