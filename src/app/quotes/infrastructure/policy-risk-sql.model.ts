import {
  BelongsTo, BelongsToMany,
  Column,
  Default, ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import Sequelize from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { PolicyPropertySqlModel } from './policy-property-sql.model'
import { PolicyPersonSqlModel } from '../../policies/infrastructure/policy-person-sql.model'
import { PolicyRiskOtherPeopleSqlModel } from '../../policies/infrastructure/policy-risk-other-people-sql.model'

@Table({ timestamps: true, tableName: 'policy_risk', underscored: true })
export class PolicyRiskSqlModel extends Model {
    @PrimaryKey
    @Default(uuidv4)
    @Column(Sequelize.UUIDV4)
    id!: string

    @ForeignKey(() => PolicyPropertySqlModel)
    @Column
    policyPropertyId!: string;

    @BelongsTo(() => PolicyPropertySqlModel)
    property!: PolicyPropertySqlModel

    @ForeignKey(() => PolicyPersonSqlModel)
    @Column
    policyPersonId!: string;

    @BelongsTo(() => PolicyPersonSqlModel)
    person!: PolicyPersonSqlModel

    @BelongsToMany(() => PolicyPersonSqlModel, () => PolicyRiskOtherPeopleSqlModel)
    otherPeople?: PolicyPersonSqlModel[]
}
