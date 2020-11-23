export function createPolicyApiRequestFixture (attr = {}) {
  return {
    code: 'myPartner',
    quote_id: '3E76DJ2',
    risk: {
      property: {
        address: '13 rue du loup garou',
        postal_code: 91100,
        city: 'Corbeil-Essonnes'
      },
      people: {
        policy_holder: {
          lastname: 'Dupont',
          firstname: 'Jean'
        },
        other_insured: [
          {
            lastname: 'Doe',
            firstname: 'John'
          }
        ]
      }
    },
    contact: {
      email: 'jeandupont@email.com',
      phone_number: '+33684205510'
    },
    start_date: '2020-04-05',
    ...attr
  }
}

export function createPolicyApiRequestFixtureV1 (attr = {}) {
  return {
    quote_id: '3E76DJ2',
    ...attr
  }
}
