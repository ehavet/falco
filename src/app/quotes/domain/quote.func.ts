import { CoverMonthlyPrice } from './cover-monthly-price/cover-monthly-price'
import { CoverMonthlyPriceRepository } from './cover-monthly-price/cover-monthly-price.repository'
import { CoverPricingZoneRepository } from './cover-pricing-zone/cover-pricing-zone.repository'
import { CoverPricingZone } from './cover-pricing-zone/cover-pricing-zone'

export const getCoverMonthlyPrices = async (
  coverMonthlyPriceRepository: CoverMonthlyPriceRepository,
  coverPricingZoneRepository: CoverPricingZoneRepository,
  productCode: string,
  partnerCode: string,
  roomCount: number,
  city?: string,
  postalCode?: string
): Promise<CoverMonthlyPrice[]> => {
  if (!city || !postalCode) return coverMonthlyPriceRepository.getAllForPartnerWithoutZone(partnerCode, roomCount)

  const coverPricingZones: CoverPricingZone[] = await coverPricingZoneRepository.getAllForProductByLocation(productCode, city, postalCode)

  if (coverPricingZones.length === 0) return coverMonthlyPriceRepository.getAllForPartnerWithoutZone(partnerCode, roomCount)

  return coverMonthlyPriceRepository.getAllForPartnerByPricingZone(partnerCode, coverPricingZones, roomCount)
}

export const getCoverMonthlyPricesTemp = async (
  coverMonthlyPriceRepository: CoverMonthlyPriceRepository,
  coverPricingZones: CoverPricingZone[],
  partnerCode: string,
  roomCount: number
): Promise<CoverMonthlyPrice[]> => {
  return coverPricingZones.length === 0
    ? await coverMonthlyPriceRepository.getAllForPartnerWithoutZone(partnerCode, roomCount)
    : await coverMonthlyPriceRepository.getAllForPartnerByPricingZone(partnerCode, coverPricingZones, roomCount)
}
