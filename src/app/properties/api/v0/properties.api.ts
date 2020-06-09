import { ServerRoute } from '@hapi/hapi'
import { Container } from '../../properties.container'

const TAGS = ['api', 'properties']
export default function (container: Container): Array<ServerRoute> {
  return [
    {
      method: 'GET',
      path: '/v0/properties',
      options: {
        tags: TAGS
      },
      handler: async () => {
        return await container.GetProperties()
      }
    }
  ]
}
