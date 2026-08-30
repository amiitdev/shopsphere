import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserModel = mongoose.model("User", userSchema);
