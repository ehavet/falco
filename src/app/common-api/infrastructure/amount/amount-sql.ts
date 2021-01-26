import { DataType } from 'sequelize-typescript'

const SQL_DEFAULT_SCALE = 6
const SQL_DEFAULT_PRECISION = 14
const SQL_CUSTOM_SCALE = 5

export const AmountSQLDataType = DataType.DECIMAL(SQL_DEFAULT_PRECISION, SQL_DEFAULT_SCALE)
export const AmountSQLDataTypeScaleFive = DataType.DECIMAL(SQL_DEFAULT_PRECISION, SQL_CUSTOM_SCALE)
