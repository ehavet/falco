import {
  Column,
  Default,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import Sequelize from 'sequelize'
import { v4 as uuidv4 } from 'uuid'

@Table({ timestamps: true, tableName: 'policy_property', underscored: true })
export class PolicyPropertySqlModel extends Model<PolicyPropertySqlModel> {
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
}
