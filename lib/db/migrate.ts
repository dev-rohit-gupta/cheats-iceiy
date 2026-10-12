import "../utils/loadEnv";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./index";

// Use only on databases already managed by Drizzle migrations.
// Existing db:push databases must continue with db:push unless baselined.
migrate(db, { migrationsFolder: "lib/db/migrations" })
  .then(() => { console.log("Database migrations applied"); process.exit(0); })
  .catch(error => { console.error("Migration failed", error); process.exit(1); });
