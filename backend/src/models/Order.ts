import mongoose, { Schema, type InferSchemaType } from "mongoose";

const orderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "delivered", "cancelled"],
      default: "pending",
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    cartId: { type: String, required: true },
    userId: { type: String, index: true, default: null },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      zip: { type: String, required: true },
    },
    payment: {
      provider: { type: String, required: true },
      status: { type: String, required: true },
      transactionId: { type: String, required: true },
      paidAt: { type: Date, required: true },
      last4: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type OrderDocument = InferSchemaType<typeof orderSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const OrderModel = mongoose.model("Order", orderSchema);
