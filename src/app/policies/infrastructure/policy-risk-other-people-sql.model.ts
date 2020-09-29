import { Column, Default, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import { v4 as uuidv4 } from 'uuid'
import Sequelize from 'sequelize'
import { PolicyRiskSqlModel } from '../../quotes/infrastructure/policy-risk-sql.model'
import { PolicyPersonSqlModel } from './policy-person-sql.model'

@Table({ timestamps: true, tableName: 'policy_risk_other_people', underscored: true })
export class PolicyRiskOtherPeopleSqlModel extends Model<PolicyRiskOtherPeopleSqlModel> {
    @PrimaryKey
    @Default(uuidv4)
    @Column(Sequelize.UUIDV4)
    id!: string

    @ForeignKey(() => PolicyRiskSqlModel)
    @Column
    policyRiskId!: string;

    @ForeignKey(() => PolicyPersonSqlModel)
    @Column
    policyPersonId!: string;
}
