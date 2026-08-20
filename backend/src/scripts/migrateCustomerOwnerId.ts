import dotenv from "dotenv";
import mongoose from "mongoose";
import User, { IUser } from "../models/User";
import { connectDB } from "../config/db";
import { Customer } from "../models/Customer";

dotenv.config();

const migrateCustomerOwnerId = async () => {
  try {
    console.log("Starting customer ownerId migration...");

    await connectDB();

    // Find customers where ownerId is missing
    const customers = await Customer.find({
      $or: [{ ownerId: { $exists: false } }, { ownerId: null }],
    }).lean();

    console.log(`Found ${customers.length} customers to migrate.`);

    if (customers.length === 0) {
      console.log("Nothing to migrate.");
      return;
    }

    const bulkOperations = [];
    let migratedCount = 0;
    let skippedCount = 0;

    for (const customer of customers) {
      if (!customer.userId) {
        console.log(`Skipping customer ${customer._id}: userId is missing.`);

        skippedCount++;
        continue;
      }

      type CreatorUser = {
        _id: mongoose.Types.ObjectId;
        role: "owner" | "staff";
        ownerId?: mongoose.Types.ObjectId;
      };

      const creator = await User.findById(customer.userId)
        .select("_id role ownerId")
        .lean<CreatorUser>();

      if (!creator) {
        console.log(
          `Skipping customer ${customer._id}: creator user not found.`,
        );

        skippedCount++;
        continue;
      }

      let ownerId: mongoose.Types.ObjectId | null = null;

      // Customer created by Owner
      if (creator.role === "owner") {
        ownerId = creator._id;
      }

      // Customer created by Staff
      else if (creator.role === "staff") {
        if (creator.ownerId) {
          ownerId = creator.ownerId;
        }
      }

      if (!ownerId) {
        console.log(
          `Skipping customer ${customer._id}: could not determine ownerId.`,
        );

        skippedCount++;
        continue;
      }

      bulkOperations.push({
        updateOne: {
          filter: {
            _id: customer._id,
          },
          update: {
            $set: {
              ownerId,
            },
          },
        },
      });

      migratedCount++;
    }

    if (bulkOperations.length > 0) {
      await Customer.bulkWrite(bulkOperations);
    }

    console.log("--------------------------------");
    console.log("Customer migration completed.");
    console.log(`Migrated : ${migratedCount}`);
    console.log(`Skipped  : ${skippedCount}`);
    console.log("--------------------------------");
  } catch (error) {
    console.error("Customer migration failed:");
    console.error(error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

migrateCustomerOwnerId();
