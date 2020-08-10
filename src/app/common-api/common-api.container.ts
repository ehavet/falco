import { GetApplicationVersion } from './domain/get-application-version.usecase'
import { ApplicationInquirer } from './domain/application-inquirer'
import { AppeninApplicationInquirer } from './infrastructure/appenin.application-inquirer'
import routes from './api/version.api'
import { appConfig } from '../../configs/application.config'

export interface Container {
    GetApplicationVersion: GetApplicationVersion
}

const applicationInquirer: ApplicationInquirer = new AppeninApplicationInquirer(appConfig)
const getApplicationVersion: GetApplicationVersion = GetApplicationVersion.factory(applicationInquirer)

export const container = {
  GetApplicationVersion: getApplicationVersion
}

export function commonApiRoutes () {
  return routes(container)
}
