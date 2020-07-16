import pdftk from 'node-pdftk'
import replace from 'buffer-replace'
import path from 'path'
import { Policy } from '../../domain/policy'
import { SpecificTermsRepository } from '../../domain/specific-terms/specific-terms.repository'
import { SpecificTerms } from '../../domain/specific-terms/specific-terms'
import {
  _encodeForPdf,
  _formatDate,
  _formatNumber, _formatOtherInsured,
  _formatPolicyId
} from '../../../common-api/infrastructure/pdf-formatter'
import { Config } from '../../../../config'
import fs from 'fs'
import { SpecificTermsAlreadyCreatedError } from '../../domain/specific-terms/specific-terms.errors'

export class SpecificTermsPdfRepository implements SpecificTermsRepository {
  constructor (private config: Config) {}

  async create (policy: Policy): Promise<SpecificTerms> {
    const specificTermsName: string = this.generateFileName(policy.id)
    const specificTermsFilePath: string = path.join(this.config.get('FALCO_API_SPECIFIC_TERMS_STORAGE_FOLDER'), specificTermsName)
    this.checkSpecificTermsNotAlreadyGenerated(specificTermsFilePath, policy.id)
    const buffer = await this.fillupSpecificTermsTemplate(policy)
    await this.saveSpecificTerms(buffer, specificTermsFilePath)

    return { name: specificTermsName, buffer }
  }

  private generateFileName (policyId: string): string {
    return `Appenin_Condition_Particulieres_assurance_habitation_${policyId}.pdf`
  }

  private checkSpecificTermsNotAlreadyGenerated (specificTermsFilePath: string, policyId: string): void {
    if (fs.existsSync(specificTermsFilePath)) {
      throw new SpecificTermsAlreadyCreatedError(policyId)
    }
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

  private async saveSpecificTerms (buffer, specificTermsFilePath: string) {
    await pdftk
      .input(buffer)
      .compress()
      .output(specificTermsFilePath)
  }
}
