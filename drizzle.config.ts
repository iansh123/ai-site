import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config(); // Load from .env

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // ✅ Correct value for Postgres
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
});

