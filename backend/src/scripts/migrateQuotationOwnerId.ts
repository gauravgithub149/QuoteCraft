import mongoose from "mongoose";
import dotenv from "dotenv";

import { connectDB } from "../config/db";
import { Quotation } from "../models/Quotation";
import User from "../models/User";

dotenv.config();

const migrateQuotationOwnerId = async () => {
  try {
    console.log("Starting quotation ownerId migration...");

    await connectDB();

    // Find quotations where ownerId is missing
    const quotations = await Quotation.find({
      $or: [
        { ownerId: { $exists: false } },
        { ownerId: null },
      ],
    }).lean();

    console.log(
      `Found ${quotations.length} quotations to migrate.`,
    );

    if (quotations.length === 0) {
      console.log("Nothing to migrate.");
      return;
    }

    const bulkOperations: any[] = [];

    let migratedCount = 0;
    let skippedCount = 0;

    for (const quotation of quotations) {
      if (!quotation.userId) {
        console.log(
          `Skipping quotation ${quotation._id}: userId is missing.`,
        );

        skippedCount++;
        continue;
      }

      type CreatorUser = {
        _id: mongoose.Types.ObjectId;
        role: "owner" | "staff";
        ownerId?: mongoose.Types.ObjectId | null;
      };

      const creator = await User.findById(quotation.userId)
        .select("_id role ownerId")
        .lean<CreatorUser>();

      if (!creator) {
        console.log(
          `Skipping quotation ${quotation._id}: creator user not found.`,
        );

        skippedCount++;
        continue;
      }

      let ownerId: mongoose.Types.ObjectId | null = null;

      // Quotation created by Owner
      if (creator.role === "owner") {
        ownerId = creator._id;
      }

      // Quotation created by Staff
      else if (creator.role === "staff") {
        if (creator.ownerId) {
          ownerId = creator.ownerId;
        }
      }

      if (!ownerId) {
        console.log(
          `Skipping quotation ${quotation._id}: could not determine ownerId.`,
        );

        skippedCount++;
        continue;
      }

      bulkOperations.push({
        updateOne: {
          filter: {
            _id: quotation._id,
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

    // Execute migration
    if (bulkOperations.length > 0) {
      const result = await Quotation.bulkWrite(bulkOperations);

      console.log(
        `Successfully migrated ${result.modifiedCount} quotations.`,
      );
    }

    console.log("--------------------------------");
    console.log("Quotation migration completed.");
    console.log(`Migrated: ${migratedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log("--------------------------------");
  } catch (error) {
    console.error(
      "Quotation ownerId migration failed:",
      error,
    );
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

migrateQuotationOwnerId();