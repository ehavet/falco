import {
  Column,
  Default,
  HasOne,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import { QuoteSqlModel } from './quote-sql.model'
import Sequelize from 'sequelize'
import { v4 as uuidv4 } from 'uuid'

@Table({ timestamps: true, tableName: 'risk', underscored: true })
export class RiskSqlModel extends Model<RiskSqlModel> {
    @PrimaryKey
    @Default(uuidv4)
    @Column(Sequelize.UUIDV4)
    id!: string

    @Column
    propertyRoomCount!: number

    @HasOne(() => QuoteSqlModel)
    quote!: QuoteSqlModel
}
