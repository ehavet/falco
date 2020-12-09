import { Column, Default, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import { PolicySqlModel } from '../policy-sql.model'
import { PaymentSqlModel } from './payment-sql.model'
import { v4 as uuidv4 } from 'uuid'
import Sequelize from 'sequelize'

// This model is used to keep track of the link between a payment and a policy.
@Table({ timestamps: false, tableName: 'payment_policy', underscored: true })
export class PaymentPolicySqlModel extends Model {
    @PrimaryKey
    @Default(uuidv4)
    @Column(Sequelize.UUIDV4)
    id!: string

    @ForeignKey(() => PaymentSqlModel)
    @Column
    paymentId!: string;

    @ForeignKey(() => PolicySqlModel)
    @Column
    policyId!: string;
}
