import {
  Column,
  Default,
  ForeignKey,
  Model,
  BelongsTo,
  PrimaryKey,
  BelongsToMany,
  Table
} from 'sequelize-typescript'
import Sequelize from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { QuotePropertySqlModel } from './quote-property-sql.model'
import { QuotePersonSqlModel } from './quote-person-sql.model'
import { QuoteRiskOtherPeopleSqlModel } from './quote-risk-other-people-sql.model'

@Table({ timestamps: true, tableName: 'quote_risk', underscored: true })
export class QuoteRiskSqlModel extends Model {
    @PrimaryKey
    @Default(uuidv4)
    @Column(Sequelize.UUIDV4)
    id!: string

    @ForeignKey(() => QuotePropertySqlModel)
    @Column
    quotePropertyId!: string

    @BelongsTo(() => QuotePropertySqlModel)
    property!: QuotePropertySqlModel

    @ForeignKey(() => QuotePersonSqlModel)
    @Column
    quotePersonId?: string

    @BelongsTo(() => QuotePersonSqlModel)
    person?: QuotePersonSqlModel

    @BelongsToMany(() => QuotePersonSqlModel, () => QuoteRiskOtherPeopleSqlModel)
    otherPeople?: QuotePersonSqlModel[]
}
