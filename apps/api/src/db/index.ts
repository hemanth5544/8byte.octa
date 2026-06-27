import { Sequelize } from "sequelize";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "../../portfolio.db");

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false,
});
