import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import { InsuranceSqlModel } from './insurance-sql.model'
import { RiskSqlModel } from './risk-sql.model'

@Table({ timestamps: true, tableName: 'quote', underscored: true })
export class QuoteSqlModel extends Model<QuoteSqlModel> {
    @PrimaryKey
    @Column
    id!: string

    @Column
    partnerCode!: string

    @ForeignKey(() => InsuranceSqlModel)
    @Column
    insuranceId!: string;

    @BelongsTo(() => InsuranceSqlModel)
    insurance!: InsuranceSqlModel

    @ForeignKey(() => RiskSqlModel)
    @Column
    riskId!: string;

    @BelongsTo(() => RiskSqlModel)
    risk!: InsuranceSqlModel
}
