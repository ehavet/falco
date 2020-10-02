import { Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript'
import { Payment } from '../../domain/payment/payment'
import { v4 as uuidv4 } from 'uuid'

@Table({ timestamps: true, tableName: 'payment', underscored: true })
export class PaymentSqlModel extends Model<PaymentSqlModel> {
    @PrimaryKey
    @Default(uuidv4)
    @Column
    id!: string

    @Column
    amount!: number

    @Column
    currency!: Payment.Curreny

    @Column
    processor!: Payment.Processor

    @Column
    instrument!: Payment.Instrument

    @Column
    externalId!: string

    @Column
    pspFee!: number

    @Column
    status!: Payment.Status

    @Column
    payedAt!: Date

    @Column(DataType.DATE)
    cancelledAt: Date | null = null

    @Column
    policyId!: string
}
