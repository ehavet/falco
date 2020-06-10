import { Sequelize } from 'sequelize-typescript'
import { Logger, logger } from './logger'
import { propertySqlModels } from '../app/partner-information/infrastructure/model'

export async function initSequelize (config) {
  const sequelize: Sequelize = new Sequelize(config.get('DATABASE_URL'), {
    dialect: 'postgres',
    logging: logDbStatement(logger, config.get('APP_NAME'), config.get('DATABASE_URL')),
    pool: {
      max: config.get('SEQUELIZE_MAX_CONNECTIONS'),
      min: 0,
      acquire: 10000,
      idle: 10000
    }
  })

  sequelize.addModels(propertySqlModels)
}

function logDbStatement (logger: Logger, db: string, databaseUrl: string) {
  return function (statement: string) {
    logger.trace(statement, { db, databaseUrl })
  }
}
