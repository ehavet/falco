import Inert from '@hapi/inert'
import Vision from '@hapi/vision'
import { ServerRegisterPluginObject } from '@hapi/hapi'
import { RegisterOptions } from 'hapi-swagger'

const HapiSwagger = require('hapi-swagger')

function swaggerOptions (config: Map<string, any>) : RegisterOptions {
  return {
    schemes: ['https', 'http'],
    info: {
      title: 'Falco API Documentation',
      contact: {
        name: 'Appenin',
        url: 'https://www.appenin.fr/'
      }
    },
    basePath: `${config.get('FALCO_API_URL_PREFIX')}`,
    grouping: 'tags',
    definitionPrefix: 'useLabel',
    reuseDefinitions: false,
    tags: [
      {
        name: '1 - Quotes',
        description: 'Those endpoints should be used first in order to create a quote. The quote can be created partially and then filled-up the the PUT endpoint. Once the quote is complete, it can be used to create a policy.'
      }
    ]
  }
}

export function happiSwaggerPlugin (config: Map<string, any>): Array<ServerRegisterPluginObject<any>> {
  return [
    { plugin: Inert },
    { plugin: Vision },
    {
      plugin: HapiSwagger,
      options: swaggerOptions(config)
    }
  ]
}
