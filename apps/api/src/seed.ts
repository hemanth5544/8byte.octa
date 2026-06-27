import { Holding } from "./models/Holding.js";

export const SEED_HOLDINGS = [
  { name: "HDFC Bank", sector: "Financial Sector", purchasePrice: 1490, quantity: 50, exchangeCode: "HDFCBANK", sortOrder: 1 },
  { name: "Bajaj Finance", sector: "Financial Sector", purchasePrice: 6466, quantity: 15, exchangeCode: "BAJFINANCE", sortOrder: 2 },
  { name: "ICICI Bank", sector: "Financial Sector", purchasePrice: 780, quantity: 84, exchangeCode: "532174", sortOrder: 3 },
  { name: "Bajaj Housing", sector: "Financial Sector", purchasePrice: 130, quantity: 504, exchangeCode: "544252", sortOrder: 4 },
  { name: "Savani Financials", sector: "Financial Sector", purchasePrice: 24, quantity: 1080, exchangeCode: "511577", sortOrder: 5 },
  { name: "Affle India", sector: "Tech Sector", purchasePrice: 1151, quantity: 50, exchangeCode: "AFFLE", sortOrder: 6 },
  { name: "LTI Mindtree", sector: "Tech Sector", purchasePrice: 4775, quantity: 16, exchangeCode: "LTIM", sortOrder: 7 },
  { name: "KPIT Tech", sector: "Tech Sector", purchasePrice: 672, quantity: 61, exchangeCode: "542651", sortOrder: 8 },
  { name: "Tata Tech", sector: "Tech Sector", purchasePrice: 1072, quantity: 63, exchangeCode: "544028", sortOrder: 9 },
  { name: "BLS E-Services", sector: "Tech Sector", purchasePrice: 232, quantity: 191, exchangeCode: "544107", sortOrder: 10 },
  { name: "Tanla", sector: "Tech Sector", purchasePrice: 1134, quantity: 45, exchangeCode: "532790", sortOrder: 11 },
  { name: "Dmart", sector: "Consumer", purchasePrice: 3777, quantity: 27, exchangeCode: "DMART", sortOrder: 12 },
  { name: "Tata Consumer", sector: "Consumer", purchasePrice: 845, quantity: 90, exchangeCode: "532540", sortOrder: 13 },
  { name: "Pidilite", sector: "Consumer", purchasePrice: 2376, quantity: 36, exchangeCode: "500331", sortOrder: 14 },
  { name: "Tata Power", sector: "Power", purchasePrice: 224, quantity: 225, exchangeCode: "500400", sortOrder: 15 },
  { name: "KPI Green", sector: "Power", purchasePrice: 875, quantity: 50, exchangeCode: "542323", sortOrder: 16 },
  { name: "Suzlon", sector: "Power", purchasePrice: 44, quantity: 450, exchangeCode: "532667", sortOrder: 17 },
  { name: "Gensol", sector: "Power", purchasePrice: 998, quantity: 45, exchangeCode: "542851", sortOrder: 18 },
  { name: "Hariom Pipes", sector: "Pipe Sector", purchasePrice: 580, quantity: 60, exchangeCode: "543517", sortOrder: 19 },
  { name: "Astral", sector: "Pipe Sector", purchasePrice: 1517, quantity: 56, exchangeCode: "ASTRAL", sortOrder: 20 },
  { name: "Polycab", sector: "Pipe Sector", purchasePrice: 2818, quantity: 28, exchangeCode: "542652", sortOrder: 21 },
  { name: "Clean Science", sector: "Others", purchasePrice: 1610, quantity: 32, exchangeCode: "543318", sortOrder: 22 },
  { name: "Deepak Nitrite", sector: "Others", purchasePrice: 2248, quantity: 27, exchangeCode: "506401", sortOrder: 23 },
  { name: "Fine Organic", sector: "Others", purchasePrice: 4284, quantity: 16, exchangeCode: "541557", sortOrder: 24 },
  { name: "Gravita", sector: "Others", purchasePrice: 2037, quantity: 8, exchangeCode: "533282", sortOrder: 25 },
  { name: "SBI Life", sector: "Others", purchasePrice: 1197, quantity: 49, exchangeCode: "540719", sortOrder: 26 },
] as const;

export async function seedHoldings(): Promise<void> {
  await Holding.destroy({ where: {} });
  await Holding.bulkCreate([...SEED_HOLDINGS]);
}
