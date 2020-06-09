import Pino from 'pino'

const config = require('../config')

export type Logger = Pino.Logger

export const logger = Pino({
  name: config.get('APP_NAME'),
  level: config.get('LOG_LEVEL')
})
