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

@Table({ timestamps: true, tableName: 'property', underscored: true })
export class PropertySqlModel extends Model<PropertySqlModel> {
    @PrimaryKey
    @Default(uuidv4)
    @Column(Sequelize.UUIDV4)
    id!: string

    @Column
    roomCount!: number

    @Column
    address!: string

    @Column
    postalCode!: number

    @Column
    city!: string

    @ForeignKey(() => RiskSqlModel)
    @Column
    riskId!: string;

    @BelongsTo(() => RiskSqlModel)
    risk!: RiskSqlModel
}
