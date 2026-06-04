import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { dbConnect } from "../database";

async function clear() {
  await dbConnect();
  const result = await mongoose.connection.collection("resourceembeddings").deleteMany({});
  console.log(`Cleared ${result.deletedCount} embeddings`);
  process.exit(0);
}

clear().catch((err) => {
  console.error("Failed to clear:", err);
  process.exit(1);
});