import dotenv from "dotenv";

dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, "0.0.0.0", () => {
      console.log("--------------------------------");
      console.log("🚀 QuoteCraft Backend Started");
      console.log(`🌐 Server : http://localhost:${PORT}`);
      console.log("--------------------------------");
    });
  } catch (error) {
    console.error("Server Failed To Start");
    console.error(error);
  }
};
startServer();
