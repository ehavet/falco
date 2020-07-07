import {
  BelongsTo,
  Column,
  Default, ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import Sequelize from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { RiskSqlModel } from './risk-sql.model'

@Table({ timestamps: true, tableName: 'other_insured', underscored: true })
export class OtherInsuredSqlModel extends Model<OtherInsuredSqlModel> {
    @PrimaryKey
    @Default(uuidv4)
    @Column(Sequelize.UUIDV4)
    id!: string

    @Column
    firstname!: string

    @Column
    lastname!: string

    @ForeignKey(() => RiskSqlModel)
    @Column
    riskId!: string

    @BelongsTo(() => RiskSqlModel)
    risk!: RiskSqlModel
}
