import { Column, Default, Model, PrimaryKey, Table } from 'sequelize-typescript'
import { AmountSQLDataType } from '../../../common-api/infrastructure/amount/amount-sql'
import { v4 as uuidv4 } from 'uuid'

@Table({ timestamps: true, tableName: 'pricing_matrix', underscored: true })
export class PricingMatrixSqlModel extends Model {
    @PrimaryKey
    @Default(uuidv4)
    @Column
    id!: string

    @Column
    partner!: string

    @Column
    roomCount!: number

    @Column(AmountSQLDataType)
    coverMonthlyPrice!: string

    @Column
    cover!: string
}
