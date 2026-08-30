import mongoose from "mongoose";
import { ReviewModel } from "../models/Review";
import { ProductModel } from "../models/Product";
import { OrderModel } from "../models/Order";
import { HttpError } from "../middleware/errorHandler";

export interface ReviewInput {
  rating: number;
  title?: string;
  comment?: string;
}

export async function hasPurchasedProductId(userId: string, productId: string): Promise<boolean> {
  return OrderModel.exists({
    userId,
    "items.productId": productId,
  }).then((doc) => !!doc);
}

export async function isVerifiedPurchase(userId: string, productId: string): Promise<boolean> {
  return OrderModel.exists({
    userId,
    status: "delivered",
    "items.productId": productId,
  }).then((doc) => !!doc);
}

export async function productIdExists(productId: string) {
  return ProductModel.exists({ _id: new mongoose.Types.ObjectId(productId) });
}

export async function writeReview(
  productId: string,
  userId: string,
  input: ReviewInput
) {
  const oid = new mongoose.Types.ObjectId(productId);
  if (!(await productIdExists(productId))) {
    throw new HttpError(404, "Product not found");
  }

  if (!(await hasPurchasedProductId(userId, productId))) {
    throw new HttpError(403, "You can only review products you have purchased");
  }

  const verified = await isVerifiedPurchase(userId, productId);

  const review = await ReviewModel.findOneAndUpdate(
    { productId: oid, userId: new mongoose.Types.ObjectId(userId) },
    { ...input, productId: oid, userId: new mongoose.Types.ObjectId(userId), verifiedPurchase: verified },
    { new: true, upsert: true, runValidators: true, lean: true }
  );

  await recomputeAggregate(oid);
  return review;
}

export async function listReviews(productId: string, page = 1, limit = 20) {
  const oid = new mongoose.Types.ObjectId(productId);
  const skip = Math.max(0, (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit)));
  const perPage = Math.min(100, Math.max(1, limit));

  const [items, total] = await Promise.all([
    ReviewModel.find({ productId: oid })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .populate("userId", "name")
      .lean(),
    ReviewModel.countDocuments({ productId: oid }),
  ]);

  return { items, total };
}

export async function ratingSummary(productId: string) {
  const oid = new mongoose.Types.ObjectId(productId);
  const result = await ReviewModel.aggregate([
    { $match: { productId: oid } },
    {
      $group: {
        _id: null,
        average: { $avg: "$rating" },
        count: { $sum: 1 },
        distribution: {
          $push: "$rating",
        },
      },
    },
  ]);
  const stats = result[0];
  const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (stats?.distribution?.length) {
    for (const r of stats.distribution as number[]) {
      breakdown[r] = (breakdown[r] ?? 0) + 1;
    }
  }
  return {
    average: stats?.average ? Math.round(stats.average * 10) / 10 : 0,
    count: stats?.count ?? 0,
    breakdown,
  };
}

export async function recomputeAggregate(productId: mongoose.Types.ObjectId) {
  const [agg] = await ReviewModel.aggregate([
    { $match: { productId } },
    {
      $group: {
        _id: null,
        average: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  await ProductModel.updateOne(
    { _id: productId },
    { rating: { rate: agg?.average ? Math.round(agg.average * 10) / 10 : 0, count: agg?.count ?? 0 } }
  );
}

export interface AdminReviewRow {
  _id: string;
  productId: string;
  title: string;
  userId: string;
  userEmail: string;
  rating: number;
  verifiedPurchase: boolean;
  createdAt: Date;
}

export async function listAllReviews(page = 1, limit = 20): Promise<{ items: AdminReviewRow[]; total: number }> {
  const skip = Math.max(0, (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit)));
  const perPage = Math.min(100, Math.max(1, limit));
  const rows = await ReviewModel.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(perPage)
    .populate("productId", "title")
    .populate("userId", "email name")
    .lean();
  const total = await ReviewModel.countDocuments();
  const items = rows.map((r: any) => ({
    _id: String(r._id),
    productId: String(r.productId?._id ?? r.productId),
    title: r.productId?.title ?? String(r.productId),
    userId: String(r.userId?._id ?? r.userId),
    userEmail: r.userId?.email ?? "",
    rating: r.rating,
    verifiedPurchase: r.verifiedPurchase,
    createdAt: r.createdAt,
  }));
  return { items, total };
}

export async function deleteReview(id: string) {
  const review = await ReviewModel.findById(id);
  if (!review) return null;
  const pid = review.productId;
  await ReviewModel.deleteOne({ _id: review._id });
  await recomputeAggregate(pid as mongoose.Types.ObjectId);
  return review.toObject();
}
