import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import { PolicyInsuranceSqlModel } from '../../quotes/infrastructure/policy-insurance-sql.model'
import { PolicyRiskSqlModel } from '../../quotes/infrastructure/policy-risk-sql.model'
import { Policy } from '../domain/policy'
import { PolicyPersonSqlModel } from './policy-person-sql.model'
import { OperationCode } from '../domain/operation-code'

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
    emailValidationDate?: Date

    @Column
    signatureDate?: Date

    @Column
    paymentDate?: Date

    @Column
    subscriptionDate?: Date

    @Column
    status!: Policy.Status

    @Column({
      type: DataType.STRING
    })
    specialOperationsCode!: OperationCode | null

    @Column({ type: DataType.DATE })
    specialOperationsCodeAppliedAt!: Date | null

    @ForeignKey(() => PolicyInsuranceSqlModel)
    @Column
    policyInsuranceId!: string

    @BelongsTo(() => PolicyInsuranceSqlModel)
    insurance!: PolicyInsuranceSqlModel

    @ForeignKey(() => PolicyRiskSqlModel)
    @Column
    policyRiskId!: string;

    @BelongsTo(() => PolicyRiskSqlModel)
    risk!: PolicyRiskSqlModel

    @ForeignKey(() => PolicyPersonSqlModel)
    @Column
    policyHolderId!: string;

    @BelongsTo(() => PolicyPersonSqlModel)
    policyHolder!: PolicyPersonSqlModel
}
