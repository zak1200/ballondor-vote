import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const responses = sqliteTable("zainab_responses", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  choice: text("choice", { enum: ["yes", "time", "no", "playful_no"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});
