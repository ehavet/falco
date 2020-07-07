import { BelongsTo, Column, Default, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import { v4 as uuidv4 } from 'uuid'
import Sequelize from 'sequelize'
import { PolicySqlModel } from './policy-sql.model'

@Table({ timestamps: true, tableName: 'contact', underscored: true })
export class ContactSqlModel extends Model<ContactSqlModel> {
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

    @ForeignKey(() => PolicySqlModel)
    @Column
    policyId!: string

    @BelongsTo(() => PolicySqlModel)
    policy!: PolicySqlModel
}
