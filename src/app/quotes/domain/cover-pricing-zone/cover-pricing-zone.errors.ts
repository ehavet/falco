export class PricingZoneNotFoundError extends Error {
  constructor (productCode: string, postalCode?: string, city?: string) {
    let message = `Could not find pricing zones for product ${productCode}`
    if (postalCode && city) message = message + ` at ${city} ${postalCode}`
    super(message)
    this.name = 'PricingZoneNotFoundError'
  }
}

export class PricingZoneConsistencyError extends Error {
  constructor (productCode: string, postalCode: string, city: string) {
    const message = `Inconsistent pricing zones set for product : ${productCode} at ${city} ${postalCode}`
    super(message)
    this.name = 'PricingZoneConsistencyError'
  }
}
