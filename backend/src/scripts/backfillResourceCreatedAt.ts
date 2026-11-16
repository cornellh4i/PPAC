/**
 * One-off fix: some older resources were saved without `createdAt`, so
 * Mongoose fills in "now" every time they are read (they show today's date in
 * the admin table and sort wrongly on the public page). This stores the real
 * creation time, taken from each document's ObjectId timestamp.
 *
 * Safe to re-run: only touches documents that have no `createdAt`.
 * Uses the same NODE_ENV / DEV_URI / PROD_URI settings as the server, so check
 * which database you're pointed at before running it.
 *
 *   yarn backfill-created-at            # dry run, prints what would change
 *   yarn backfill-created-at --apply    # writes the changes
 */
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { dbConnect } from "../database";

async function backfill() {
  const apply = process.argv.includes("--apply");
  await dbConnect();
  const resources = mongoose.connection.collection("resources");
  const missing = await resources
    .find({ createdAt: { $exists: false } }, { projection: { title: 1 } })
    .toArray();

  console.log(`${missing.length} resource(s) have no createdAt (db: ${mongoose.connection.name})`);
  for (const doc of missing) {
    const createdAt = (doc._id as mongoose.Types.ObjectId).getTimestamp();
    console.log(`  ${createdAt.toISOString()}  ${doc.title}`);
    if (apply) {
      await resources.updateOne({ _id: doc._id }, { $set: { createdAt } });
    }
  }
  console.log(apply ? "Done." : "Dry run only. Re-run with --apply to save.");
  process.exit(0);
}

backfill().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
