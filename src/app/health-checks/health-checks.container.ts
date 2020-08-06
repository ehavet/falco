import routes from './api/v0/health-checks.api'
import { CheckApplicationReadiness } from './domain/check-application-readiness.usecase'
import { DatabaseHealthChecker } from './domain/database-health-checker'
import { SequelizeHealthChecker } from './infrastructure/sequelize.health-checker'

export interface Container {
    CheckApplicationReadiness: CheckApplicationReadiness
}

const databaseHealthChecker: DatabaseHealthChecker = new SequelizeHealthChecker()
const checkApplicationReadiness: CheckApplicationReadiness = CheckApplicationReadiness.factory(databaseHealthChecker)

export const container: Container = {
  CheckApplicationReadiness: checkApplicationReadiness
}

export function healthChecksRoutes () {
  return routes(container)
}
