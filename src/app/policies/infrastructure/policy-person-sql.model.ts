import {
  Model,
  Column,
  Default,
  PrimaryKey,
  Table
} from 'sequelize-typescript'

import { v4 as uuidv4 } from 'uuid'
import Sequelize from 'sequelize'

@Table({ timestamps: true, tableName: 'policy_person', underscored: true })
export class PolicyPersonSqlModel extends Model<PolicyPersonSqlModel> {
    @PrimaryKey
    @Default(uuidv4)
    @Column(Sequelize.UUIDV4)
    id!: string

    @Column
    firstname!: string

    @Column
    lastname!: string

    @Column
    address!: string

    @Column
    postalCode!: number

    @Column
    city!: string

    @Column
    email!: string

    @Column
    phoneNumber!: string

    @Column
    emailValidatedAt?: Date
}
