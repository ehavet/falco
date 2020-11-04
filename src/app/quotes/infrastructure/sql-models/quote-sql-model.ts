import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import { QuoteInsuranceSqlModel } from './quote-insurance-sql.model'
import { QuoteRiskSqlModel } from './quote-risk-sql.model'
import { QuotePersonSqlModel } from './quote-person-sql.model'

@Table({ timestamps: true, tableName: 'quote', underscored: true })
export class QuoteSqlModel extends Model<QuoteSqlModel> {
    @PrimaryKey
    @Column
    id!: string

    @Column
    partnerCode!: string

    @Column
    premium!: number

    @Column
    nbMonthsDue!: number

    @Column({
      type: DataType.STRING
    })
    specialOperationsCode!: string | null

    @Column({
      type: DataType.DATEONLY
    })
    specialOperationsCodeAppliedAt!: Date | null

    @Column({ type: DataType.DATEONLY })
    startDate!: Date

    @Column({ type: DataType.DATEONLY })
    termStartDate!: Date

    @Column({ type: DataType.DATEONLY })
    termEndDate!: Date

    @ForeignKey(() => QuoteInsuranceSqlModel)
    @Column
    quoteInsuranceId!: string;

    @BelongsTo(() => QuoteInsuranceSqlModel)
    insurance!: QuoteInsuranceSqlModel

    @ForeignKey(() => QuoteRiskSqlModel)
    @Column
    quoteRiskId!: string;

    @BelongsTo(() => QuoteRiskSqlModel)
    risk!: QuoteRiskSqlModel

    @ForeignKey(() => QuotePersonSqlModel)
    @Column
    policyHolderId?: string;

    @BelongsTo(() => QuotePersonSqlModel)
    policyHolder?: QuotePersonSqlModel
}
