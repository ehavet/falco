export class SpecificTermsNotFoundError extends Error {
  constructor (specificTermsName: string) {
    const message: string = `Specific terms ${specificTermsName} not found`
    super(message)
    this.name = 'SpecificTermsNotFoundError'
  }
}
