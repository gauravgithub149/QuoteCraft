import express from "express";
import cors from "cors";
import customerRoutes from "./routes/customer.routes";
import authRoutes from "./routes/auth.route";
import productRoutes from "./routes/product.routes";
import quotationRoutes from "./routes/quotation.routes";
import userRoutes from "./routes/user.routes";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://quote-craft-liard.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "QuoteCraft API is running 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/quotes", quotationRoutes);
app.use("/api/users", userRoutes);
export default app;