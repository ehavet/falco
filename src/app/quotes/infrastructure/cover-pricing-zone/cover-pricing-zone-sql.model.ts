import { Column, Default, Model, PrimaryKey, Table } from 'sequelize-typescript'
import { v4 as uuidv4 } from 'uuid'
import Sequelize from 'sequelize'

@Table({ tableName: 'pricing_zone', underscored: true, timestamps: true })
export class CoverPricingZoneSqlModel extends Model {
    @PrimaryKey
    @Default(uuidv4)
    @Column(Sequelize.UUIDV4)
    id!: string

    @Column
    product!: string

    @Column
    cover!: string

    @Column
    postalCode!: string

    @Column
    cityCode!: string

    @Column
    city!: string

    @Column
    pricingZone!: string
}
