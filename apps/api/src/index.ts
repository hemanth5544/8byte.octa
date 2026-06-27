import cors from "cors";
import express from "express";
import { sequelize } from "./db/index.js";
import { Holding } from "./models/Holding.js";
import { portfolioRouter } from "./routes/portfolio.js";
import { seedHoldings } from "./seed.js";

const PORT = Number(process.env.PORT) || 4000;

async function main() {
  await sequelize.sync();
  const count = await Holding.count();
  if (count === 0) {
    await seedHoldings();
    console.log("Seeded portfolio holdings from case study data");
  }

  const app = express();
  app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
  app.use(express.json());
  app.use("/api/portfolio", portfolioRouter);

  app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
