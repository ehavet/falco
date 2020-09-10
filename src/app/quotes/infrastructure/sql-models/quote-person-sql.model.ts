import { Column, Default, Model, PrimaryKey, Table } from 'sequelize-typescript'
import { v4 as uuidv4 } from 'uuid'
import Sequelize from 'sequelize'

@Table({ timestamps: true, tableName: 'quote_person', underscored: true })
export class QuotePersonSqlModel extends Model<QuotePersonSqlModel> {
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
    postalCode!: string

    @Column
    city!: string

    @Column
    email!: string

    @Column
    emailValidationDate?: Date

    @Column
    phoneNumber!: string
}
