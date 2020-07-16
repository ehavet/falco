import pdftk from 'node-pdftk'
import replace from 'buffer-replace'
import path from 'path'
import { Policy } from '../../domain/policy'
import { SpecificTerms } from '../../domain/specific-terms/specific-terms'
import {
  _encodeForPdf,
  _formatDate,
  _formatNumber, _formatOtherInsured,
  _formatPolicyId
} from '../../../common-api/infrastructure/pdf-formatter'
import { SpecificTermsGenerator } from '../../domain/specific-terms/specific-terms.generator'

export class SpecificTermsPdfGenerator implements SpecificTermsGenerator {
  async generate (policy: Policy): Promise<SpecificTerms> {
    const specificTermsName: string = this.getNameFor(policy.id)
    const buffer = await this.fillupSpecificTermsTemplate(policy)

    return { name: specificTermsName, buffer }
  }

  getNameFor (policyId: string): string {
    return `Appenin_Condition_Particulieres_assurance_habitation_${policyId}.pdf`
  }

  private async fillupSpecificTermsTemplate (policy: Policy) {
    const templateName: string = `specific-terms-template-${policy.partnerCode}.pdf`
    let buffer = await pdftk
      .input(path.join(__dirname, templateName))
      .uncompress()
      .output()
    buffer = replace(buffer, '[start_date]', _encodeForPdf(_formatDate(policy.termStartDate)))
    buffer = replace(buffer, '[policy_id]', _encodeForPdf(_formatPolicyId(policy.id)))
    buffer = replace(buffer, '[product_id]', _encodeForPdf(policy.insurance.productCode))
    buffer = replace(buffer, '[term_end_date]', _encodeForPdf(_formatDate(policy.termEndDate)))
    buffer = replace(buffer, '[total_price]', _encodeForPdf(_formatNumber(policy.premium)))
    buffer = replace(buffer, '[firstname]', _encodeForPdf(policy.contact.firstname))
    buffer = replace(buffer, '[lastname]', _encodeForPdf(policy.contact.lastname))
    buffer = replace(buffer, '[email]', _encodeForPdf(policy.contact.email))
    buffer = replace(buffer, '[other_insured]', _encodeForPdf(_formatOtherInsured(policy.risk.people.otherInsured)))
    buffer = replace(buffer, '[address]', _encodeForPdf(policy.contact.address))
    buffer = replace(buffer, '[postal_code]', _encodeForPdf(policy.contact.postalCode.toString()))
    buffer = replace(buffer, '[city]', _encodeForPdf(policy.contact.city))
    buffer = replace(buffer, '[room_count]', _encodeForPdf(policy.risk.property.roomCount.toString()))
    buffer = replace(buffer, '[default_ceiling]', _formatNumber(policy.insurance.estimate.defaultCeiling))
    buffer = replace(buffer, '[default_deduction]', _formatNumber(policy.insurance.estimate.defaultDeductible))
    buffer = replace(buffer, '[subscribtion_date]', _encodeForPdf(_formatDate(policy.subscriptionDate!)))
    return buffer
  }
}
