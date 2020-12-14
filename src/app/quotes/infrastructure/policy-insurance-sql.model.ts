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
import { AmountSQLDataType } from '../../common-api/infrastructure/amount/amount-sql'

@Table({ timestamps: true, tableName: 'policy_insurance', underscored: true })
export class PolicyInsuranceSqlModel extends Model {
    @PrimaryKey
    @Default(uuidv4)
    @Column(Sequelize.UUIDV4)
    id!: string

    @Column(AmountSQLDataType)
    monthlyPrice!: string

    @Column(AmountSQLDataType)
    defaultDeductible!: string

    @Column(AmountSQLDataType)
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
