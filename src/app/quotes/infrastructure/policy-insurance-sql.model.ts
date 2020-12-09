import {
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import Sequelize from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { SQL_DEFAULT_PRECISION, SQL_DEFAULT_SCALE } from '../../common-api/domain/amount/amount'

@Table({ timestamps: true, tableName: 'policy_insurance', underscored: true })
export class PolicyInsuranceSqlModel extends Model {
    @PrimaryKey
    @Default(uuidv4)
    @Column(Sequelize.UUIDV4)
    id!: string

    @Column(DataType.DECIMAL(SQL_DEFAULT_PRECISION, SQL_DEFAULT_SCALE))
    monthlyPrice!: string

    @Column(DataType.DECIMAL(SQL_DEFAULT_PRECISION, SQL_DEFAULT_SCALE))
    defaultDeductible!: string

    @Column(DataType.DECIMAL(SQL_DEFAULT_PRECISION, SQL_DEFAULT_SCALE))
    defaultCeiling!: string

    @Column
    currency!: string

    @Column(DataType.ARRAY(DataType.STRING))
    simplifiedCovers!: Array<string>

    @Column
    productCode!: string

    @Column
    productVersion!: string

    @Column
    contractualTerms!: string

    @Column
    ipid!: string
}
