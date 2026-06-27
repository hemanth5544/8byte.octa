import { Sequelize } from "sequelize";
import { resolveDbPath } from "./path.js";

export const dbPath = resolveDbPath();

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false,
});
