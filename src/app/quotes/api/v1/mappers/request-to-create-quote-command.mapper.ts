import { CreateQuoteCommand } from '../../../domain/create-quote-command'

export function requestToCreateQuoteCommand (request: any): CreateQuoteCommand {
  const payload: any = request.payload

  return {
    partnerCode: payload.code,
    specOpsCode: payload.spec_ops_code,
    risk: {
      property: {
        roomCount: payload.risk.property.room_count,
        address: payload.risk.property.address,
        city: payload.risk.property.city,
        postalCode: payload.risk.property.postal_code,
        type: payload.risk.property.type,
        occupancy: payload.risk.property.occupancy
      },
      person: _resourceToRiskPerson(payload.risk),
      otherPeople: payload.risk.other_people ? payload.risk.other_people.map(person => {
        return { firstname: person.firstname, lastname: person.lastname }
      }) : undefined
    },
    policyHolder: _resourceToPolicyHolder(payload),
    startDate: payload.start_date ? new Date(payload.start_date) : undefined
  }
}

function _resourceToRiskPerson (risk) {
  if (!risk.person) return undefined

  return { firstname: risk.person.firstname, lastname: risk.person.lastname }
}

function _resourceToPolicyHolder (payload) {
  if (!payload.policy_holder) return undefined

  return {
    firstname: payload.policy_holder.firstname,
    lastname: payload.policy_holder.lastname,
    address: payload.policy_holder.address,
    postalCode: payload.policy_holder.postal_code,
    city: payload.policy_holder.city,
    email: payload.policy_holder.email,
    phoneNumber: payload.policy_holder.phone_number
  }
}
