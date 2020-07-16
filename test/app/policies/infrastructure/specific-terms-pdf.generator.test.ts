import dayjs from 'dayjs'
import { createPolicyFixture } from '../fixtures/policy.fixture'
import { Policy } from '../../../../src/app/policies/domain/policy'
import { expect } from '../../../test-utils'
import { SpecificTermsPdfGenerator } from '../../../../src/app/policies/infrastructure/specific-terms-pdf/specific-terms-pdf.generator'

describe('Policies - Infra - Specific terms PDF Generator', async () => {
  const specificTermsPdfGenerator : SpecificTermsPdfGenerator = new SpecificTermsPdfGenerator()

  it('should generate a new specific terms document', async () => {
    // Given
    const policy: Policy = createPolicyFixture({ partnerCode: 'essca' })
    policy.termEndDate = dayjs(policy.termStartDate).add(1, 'month').toDate()
    policy.insurance.productCode = 'APP1234'

    // When
    const specificTerms = await specificTermsPdfGenerator.generate(policy)

    // Then
    expect(specificTerms.name).to.equal('Appenin_Condition_Particulieres_assurance_habitation_APP753210859.pdf')
    expect(specificTerms.buffer.includes('\\300 EFFET DU 05\\05701\\0572020')).to.be.true
    expect(specificTerms.buffer.includes('n\\260APP 753 210 859')).to.be.true
    expect(specificTerms.buffer.includes('Votre contrat arrivera \\340 \\351ch\\351ance le 05\\05702\\0572020')).to.be.true
    expect(specificTerms.buffer.includes('votre tarif est de 69\\05484 \\200')).to.be.true
    expect(specificTerms.buffer.includes('Jean Dupont')).to.be.true
    expect(specificTerms.buffer.includes('jeandupont\\100email\\056com')).to.be.true
    expect(specificTerms.buffer.includes('John Doe')).to.be.true
    expect(specificTerms.buffer.includes('13 rue du loup garou')).to.be.true
    expect(specificTerms.buffer.includes('91100 Corbeil\\055Essones')).to.be.true
    expect(specificTerms.buffer.includes('Votre logement est compos\\351 de 2 pi\\350ce\\(s\\) principale\\(s\\)')).to.be.true
    expect(specificTerms.buffer.includes('valeur mobili\\350re par \\351v\\351nement : 7 000 \\20')).to.be.true
    expect(specificTerms.buffer.includes('pour les autres garanties de protection de vos biens : 150 \\200')).to.be.true
    expect(specificTerms.buffer.includes('Fait \\340 Paris, le 05\\05701\\0572020')).to.be.true
  })
})
