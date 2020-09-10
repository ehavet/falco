import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import { QuoteInsuranceSqlModel } from './quote-insurance-sql.model'
import { QuoteRiskSqlModel } from './quote-risk-sql.model'

@Table({ timestamps: true, tableName: 'quote', underscored: true })
export class QuoteSqlModel extends Model<QuoteSqlModel> {
    @PrimaryKey
    @Column
    id!: string

    @Column
    partnerCode!: string

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
}
