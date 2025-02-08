// db.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const sqlite = new Database("./database.sqlite");
export const db = drizzle(sqlite);

