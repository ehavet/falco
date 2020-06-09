import { Column, Model, Table } from 'sequelize-typescript'

@Table({ timestamps: false, tableName: 'property' })
export class PropertySqlModel extends Model<PropertySqlModel> {
  @Column
  name!: string
}
