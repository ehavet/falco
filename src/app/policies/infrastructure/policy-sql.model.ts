import { BelongsTo, Column, DataType, ForeignKey, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript'
import { InsuranceSqlModel } from '../../quotes/infrastructure/insurance-sql.model'
import { RiskSqlModel } from '../../quotes/infrastructure/risk-sql.model'
import { ContactSqlModel } from './contact-sql.model'
import { Policy } from '../domain/policy'

@Table({ timestamps: true, tableName: 'policy', underscored: true })
export class PolicySqlModel extends Model<PolicySqlModel> {
    @PrimaryKey
    @Column
    id!: string

    @Column
    partnerCode!: string

    @Column
    premium!: number

    @Column
    nbMonthsDue!: number

    @Column({ type: DataType.DATEONLY })
    startDate!: Date

    @Column({ type: DataType.DATEONLY })
    termStartDate!: Date

    @Column({ type: DataType.DATEONLY })
    termEndDate!: Date

    @Column
    signatureDate?: Date

    @Column
    paymentDate?: Date

    @Column
    subscriptionDate?: Date

    @Column
    status!: Policy.Status

    @ForeignKey(() => InsuranceSqlModel)
    @Column
    insuranceId!: string

    @BelongsTo(() => InsuranceSqlModel)
    insurance!: InsuranceSqlModel

    @ForeignKey(() => RiskSqlModel)
    @Column
    riskId!: string;

    @BelongsTo(() => RiskSqlModel)
    risk!: RiskSqlModel

    @HasOne(() => ContactSqlModel)
    contact!: ContactSqlModel
}
