import {
  Column,
  Default, HasMany, HasOne,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import Sequelize from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { PolicyHolderSqlModel } from './policy-holder-sql.model'
import { OtherInsuredSqlModel } from './other-insured-sql.model'
import { PropertySqlModel } from './property-sql.model'

@Table({ timestamps: true, tableName: 'risk', underscored: true })
export class RiskSqlModel extends Model<RiskSqlModel> {
    @PrimaryKey
    @Default(uuidv4)
    @Column(Sequelize.UUIDV4)
    id!: string

    @HasOne(() => PropertySqlModel)
    property!: PropertySqlModel

    @HasOne(() => PolicyHolderSqlModel)
    policyHolder!: PolicyHolderSqlModel

    @HasMany(() => OtherInsuredSqlModel)
    otherInsured!: OtherInsuredSqlModel[]
}
