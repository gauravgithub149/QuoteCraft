import mongoose from "mongoose";

export let isDbConnected = false;

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in .env");
    }

    const conn = await mongoose.connect(mongoUri);

    isDbConnected = true;

    console.log("✅ MongoDB Connected");
    console.log(`📂 Database : ${conn.connection.name}`);
    console.log(`📍 Host : ${conn.connection.host}`);

    mongoose.connection.on("connected", () => {
      isDbConnected = true;
      console.log("🟢 MongoDB Connected");
    });

    mongoose.connection.on("disconnected", () => {
      isDbConnected = false;
      console.log("🔴 MongoDB Disconnected");
    });

    mongoose.connection.on("error", (err: Error) => {
      isDbConnected = false;
      console.log("Mongo Error :", err.message);
    });

  } catch (error) {

    isDbConnected = false;

    console.error("MongoDB Connection Failed");

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exit(1);
  }
};