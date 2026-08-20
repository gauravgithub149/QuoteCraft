import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { Customer } from "../models/Customer";
import { Quotation } from "../models/Quotation";

const migrateCustomerQuoteTotals = async () => {
  try {
    console.log("Starting customer quotation totals migration...");

    await connectDB();

    const customers = await Customer.find({});

    console.log(`Found ${customers.length} customers.`);

    let migratedCount = 0;

    for (const customer of customers) {
      const result = await Quotation.aggregate([
        {
          $match: {
            customerId: customer._id,
          },
        },
        {
          $group: {
            _id: "$customerId",
            totalQuotesCount: { $sum: 1 },
            totalValue: { $sum: "$grandTotal" },
          },
        },
      ]);

      const totals = result[0];

      await Customer.findByIdAndUpdate(customer._id, {
        totalQuotesCount: totals?.totalQuotesCount || 0,
        totalValue: totals?.totalValue || 0,
      });

      console.log(
        `Customer ${customer.company}: ` +
        `${totals?.totalQuotesCount || 0} quotes, ` +
        `₹${totals?.totalValue || 0}`,
      );

      migratedCount++;
    }

    console.log(
      `Migration completed successfully. ${migratedCount} customers migrated.`,
    );
  } catch (error) {
    console.error("Customer quotation totals migration failed:", error);
  } finally {
    await mongoose.connection.close();
  }
};

migrateCustomerQuoteTotals();