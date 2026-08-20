import dotenv from "dotenv";
import mongoose from "mongoose";

import { connectDB } from "../config/db";
import { Product } from "../models/Product";
import User from "../models/User";

dotenv.config();

type CreatorUser = {
  _id: mongoose.Types.ObjectId;
  role: "owner" | "staff";
  ownerId?: mongoose.Types.ObjectId;
};

const migrateProductOwnerId = async () => {
  try {
    console.log("Starting product ownerId migration...");

    await connectDB();

    // Find products where ownerId is missing
    const products = await Product.find({
      $or: [
        { ownerId: { $exists: false } },
        { ownerId: null },
      ],
    }).lean();

    console.log(`Found ${products.length} products to migrate.`);

    if (products.length === 0) {
      console.log("Nothing to migrate.");
      return;
    }

    const bulkOperations = [];

    let migratedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      if (!product.userId) {
        console.log(
          `Skipping product ${product._id}: userId is missing.`,
        );

        skippedCount++;
        continue;
      }

      const creator = await User.findById(product.userId)
        .select("_id role ownerId")
        .lean<CreatorUser>();

      if (!creator) {
        console.log(
          `Skipping product ${product._id}: creator user not found.`,
        );

        skippedCount++;
        continue;
      }

      let ownerId: mongoose.Types.ObjectId | null = null;

      // Product created by Owner
      if (creator.role === "owner") {
        ownerId = creator._id;
      }

      // Product created by Staff
      else if (creator.role === "staff") {
        if (creator.ownerId) {
          ownerId = creator.ownerId;
        }
      }

      if (!ownerId) {
        console.log(
          `Skipping product ${product._id}: could not determine ownerId.`,
        );

        skippedCount++;
        continue;
      }

      bulkOperations.push({
        updateOne: {
          filter: {
            _id: product._id,
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
      await Product.bulkWrite(bulkOperations);
    }

    console.log("--------------------------------");
    console.log("Product migration completed.");
    console.log(`Migrated : ${migratedCount}`);
    console.log(`Skipped  : ${skippedCount}`);
    console.log("--------------------------------");
  } catch (error) {
    console.error("Product migration failed:");
    console.error(error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

migrateProductOwnerId();