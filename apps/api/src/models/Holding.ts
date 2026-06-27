import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../db/index.js";

export interface HoldingAttributes {
  id: number;
  name: string;
  sector: string;
  purchasePrice: number;
  quantity: number;
  exchangeCode: string;
  sortOrder: number;
}

type HoldingCreation = Optional<HoldingAttributes, "id">;

export class Holding extends Model<HoldingAttributes, HoldingCreation> implements HoldingAttributes {
  declare id: number;
  declare name: string;
  declare sector: string;
  declare purchasePrice: number;
  declare quantity: number;
  declare exchangeCode: string;
  declare sortOrder: number;
}

Holding.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    sector: { type: DataTypes.STRING, allowNull: false },
    purchasePrice: { type: DataTypes.FLOAT, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    exchangeCode: { type: DataTypes.STRING, allowNull: false },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { sequelize, tableName: "holdings", timestamps: false },
);
