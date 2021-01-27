import { Policy } from '../../policies/domain/policy'
import { Amount } from '../domain/amount/amount'

export function encodeForPdf (value: string): string {
  const dict = {
    '€': '\\200',
    Š: '\\212',
    Ž: '\\216',
    š: '\\232',
    ž: '\\236',
    Ÿ: '\\237'
  }
  return value.replace(/[^\w ]/g,
    char => dict[char] || '\\' + ('000' + char.charCodeAt(0).toString(8)).slice(-3))
}

export function formatPolicyId (policyId: string): string {
  const sub1 = policyId.substr(0, 3)
  const sub2 = policyId.substr(3, 3)
  const sub3 = policyId.substr(6, 3)
  const sub4 = policyId.substr(9, 3)
  return `${sub1} ${sub2} ${sub3} ${sub4}`
}

export function formatDate (date: Date): string {
  return date ? new Intl.DateTimeFormat('fr-FR').format(date) : ''
}

export function formatNumber (numberToFormat: number): string {
  if (numberToFormat) {
    const formattedNumber =
        numberToFormat % 1 === 0
          ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(numberToFormat)
          : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(numberToFormat)
    // Replacing non breaking spaces
    return formattedNumber.replace(/\s/g, ' ')
  }
  return ''
}

export function formatAmount (amount: Amount): string {
  return `${formatNumber(amount)} euros`
}

export function formatRoundAmount (amount: Amount): string {
  return `${formatNumber(Math.round(amount))} euros`
}

export function formatOtherInsured (otherInsured: Policy.Risk.People.OtherPeople[]): string {
  if (otherInsured.length === 0) {
    return 'Aucun'
  }
  return otherInsured.map(insured => {
    return `${insured.firstname} ${insured.lastname}`
  }).reduce(function (accumulator, formattedInsured) {
    return accumulator.concat(`, ${formattedInsured}`)
  })
}

export function formatName (contact: Policy.Holder): string {
  return `${contact.firstname} ${contact.lastname}`
}

export function formatHomeAddress (contact: Policy.Holder): string {
  return `${contact.address}, ${contact.postalCode} ${contact.city}`
}

export function encodeSpacesForPdf (value: string): string {
  return value.replace(/[' ']/g, ')-200(')
}
