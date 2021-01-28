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
      }
    },
    policyHolder: _resourceToPolicyHolder(payload)
  }
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
