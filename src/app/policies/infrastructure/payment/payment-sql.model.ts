import { Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript'
import { Payment } from '../../domain/payment/payment'
import { v4 as uuidv4 } from 'uuid'
import { AmountSQLDataType } from '../../../common-api/infrastructure/amount/amount-sql'

@Table({ timestamps: true, tableName: 'payment', underscored: true })
export class PaymentSqlModel extends Model {
    @PrimaryKey
    @Default(uuidv4)
    @Column
    id!: string

    @Column(AmountSQLDataType)
    amount!: string

    @Column
    currency!: Payment.Currency

    @Column
    processor!: Payment.Processor

    @Column
    method!: Payment.Method

    @Column
    externalId!: string

    @Column(AmountSQLDataType)
    pspFee!: string

    @Column
    status!: Payment.Status

    @Column
    payedAt!: Date

    @Column(DataType.DATE)
    cancelledAt: Date | null = null
}
