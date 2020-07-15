import {
  Column,
  DataType,
  Default,
  HasOne,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import { QuoteSqlModel } from './quote-sql.model'
import Sequelize from 'sequelize'
import { v4 as uuidv4 } from 'uuid'

@Table({ timestamps: true, tableName: 'insurance', underscored: true })
export class InsuranceSqlModel extends Model<InsuranceSqlModel> {
    @PrimaryKey
    @Default(uuidv4)
    @Column(Sequelize.UUIDV4)
    id!: string

    @Column(DataType.FLOAT)
    monthlyPrice!: number

    @Column
    defaultDeductible!: number

    @Column
    defaultCeiling!: number

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

    @HasOne(() => QuoteSqlModel)
    quote!: QuoteSqlModel
}
