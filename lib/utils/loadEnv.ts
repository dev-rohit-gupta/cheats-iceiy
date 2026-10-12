// Load Next.js local environment values in one-off CLI scripts as well.
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
