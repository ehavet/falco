import {
  Column,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import Sequelize from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { QuotePersonSqlModel } from './quote-person-sql.model'
import { QuoteRiskSqlModel } from './quote-risk-sql.model'

@Table({ timestamps: true, tableName: 'quote_risk_other_people', underscored: true })
export class QuoteRiskOtherPeopleSqlModel extends Model {
    @PrimaryKey
    @Default(uuidv4)
    @Column(Sequelize.UUIDV4)
    id!: string

    @ForeignKey(() => QuoteRiskSqlModel)
    @Column
    quoteRiskId!: string

    @ForeignKey(() => QuotePersonSqlModel)
    @Column
    quotePersonId!: string
}
