import mongoose from "mongoose";
import { Customer } from "../models/Customer";
import { Quotation } from "../models/Quotation";

export const recalculateCustomerTotals = async (
  customerId: mongoose.Types.ObjectId | string,
) => {
  const customerObjectId =
    typeof customerId === "string"
      ? new mongoose.Types.ObjectId(customerId)
      : customerId;

  const result = await Quotation.aggregate([
    {
      $match: {
        customerId: customerObjectId,
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

  await Customer.findByIdAndUpdate(customerObjectId, {
    totalQuotesCount: totals?.totalQuotesCount || 0,
    totalValue: totals?.totalValue || 0,
  });
};