import {
  Column,
  Default,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import Sequelize from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { PropertyType } from '../../common-api/domain/type/property-type'

@Table({ timestamps: true, tableName: 'policy_property', underscored: true })
export class PolicyPropertySqlModel extends Model {
    @PrimaryKey
    @Default(uuidv4)
    @Column(Sequelize.UUIDV4)
    id!: string

    @Column
    roomCount!: number

    @Column
    address!: string

    @Column
    postalCode!: string

    @Column
    city!: string

    @Column
    type!: PropertyType
}
