import { Container } from '../../pricing.container'
import { Logger } from '../../../../libs/logger'
import { ServerRoute } from '@hapi/hapi'
import * as HttpErrorSchema from '../../../common-api/HttpErrorSchema'
import * as Boom from '@hapi/boom'
import { ComputePriceWithOperationCodeCommand } from '../../domain/compute-price-with-operation-code-command'
import * as Joi from '@hapi/joi'
import { Price } from '../../domain/price'
import { OperationCodeNotApplicableError } from '../../domain/operation-code.errors'
import { PolicyNotFoundError } from '../../../policies/domain/policies.errors'
import { PartnerNotFoundError } from '../../../partners/domain/partner.errors'

const TAGS = ['api', 'price']
export default function (container: Container, logger: Logger): Array<ServerRoute> {
  return [
    {
      method: 'POST',
      path: '/v0/price',
      options: {
        tags: TAGS,
        description: 'Compute price',
        validate: {
          payload: Joi.object({
            policy_id: Joi.string().min(1).max(100).required()
              .description('Policy ID').example('APP485628503'),
            spec_ops_code: Joi.string().min(1).max(100).required()
              .description('Special operation code').example('SPECIALCODE1')
          })
        },
        response: {
          status: {
            200: Joi.object({
              premium: Joi.number(),
              nb_months_due: Joi.number(),
              monthly_price: Joi.number()
            }),
            400: HttpErrorSchema.badRequestSchema,
            404: HttpErrorSchema.notFoundSchema,
            422: HttpErrorSchema.unprocessableEntitySchema,
            500: HttpErrorSchema.internalServerErrorSchema
          }
        }
      },
      handler: async (request, h) => {
        try {
          const payload: any = request.payload
          const command: ComputePriceWithOperationCodeCommand = {
            policyId: payload.policy_id,
            operationCode: payload.spec_ops_code
          }
          const price: Price = await container.ComputePriceWithOperationCode(command)
          return h.response({
            premium: price.premium,
            nb_months_due: price.nbMonthsDue,
            monthly_price: price.monthlyPrice
          }).code(200)
        } catch (error) {
          switch (true) {
            case error instanceof OperationCodeNotApplicableError:
              throw Boom.badData(error.message)
            case error instanceof PolicyNotFoundError:
            case error instanceof PartnerNotFoundError:
              throw Boom.notFound(error.message)
            default:
              logger.error(error)
              throw Boom.internal(error)
          }
        }
      }
    }
  ]
}
