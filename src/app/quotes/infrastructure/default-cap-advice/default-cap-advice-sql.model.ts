import { Column, Default, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Sequelize from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { AmountSQLDataType } from '../../../common-api/infrastructure/amount/amount-sql'

@Table({ tableName: 'default_cap_advice_matrix', underscored: true, timestamps: true })
export class DefaultCapAdviceSqlModel extends Model {
    @PrimaryKey
    @Default(uuidv4)
    @Column(Sequelize.UUIDV4)
    id!: string

    @Column
    partnerCode!: string

    @Column
    roomCount!: number

    @Column(AmountSQLDataType)
    defaultCapAdvice!: string
}
