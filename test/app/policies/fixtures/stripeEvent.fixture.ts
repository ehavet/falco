export function getStripePaymentIntentSucceededEvent (attr = {}) {
  return {
    id: 'evt_1H3118B099cSJ3oR8KFZm575',
    object: 'event',
    api_version: '2020-03-02',
    created: 1594305989,
    data: {
      object: {
        id: 'pi_1H3116B099cSJ3oRO3W6op2y',
        object: 'payment_intent',
        amount: 2000,
        amount_capturable: 0,
        amount_received: 2000,
        application: null,
        application_fee_amount: null,
        canceled_at: null,
        cancellation_reason: null,
        capture_method: 'automatic',
        charges: [Object],
        client_secret: 'pi_1H3116B099cSJ3oRO3W6op2y_secret_mKI5oFiikhLeEgYgLjQ7FVSCr',
        confirmation_method: 'automatic',
        created: 1594305988,
        currency: 'usd',
        customer: null,
        description: 'a test notification',
        invoice: null,
        last_payment_error: null,
        livemode: false,
        metadata: {
          policy_id: 'APP463109486'
        },
        next_action: null,
        on_behalf_of: null,
        payment_method: 'pm_1H3116B099cSJ3oRYduPTMV2',
        payment_method_options: [Object],
        payment_method_types: [Array],
        receipt_email: null,
        review: null,
        setup_future_usage: null,
        shipping: [Object],
        source: null,
        statement_descriptor: null,
        statement_descriptor_suffix: null,
        status: 'succeeded',
        transfer_data: null,
        transfer_group: null
      }
    },
    livemode: false,
    pending_webhooks: 2,
    request: { id: 'req_7Ps3TUOBcL302X', idempotency_key: null },
    type: 'payment_intent.succeeded',
    ...attr
  }
}
