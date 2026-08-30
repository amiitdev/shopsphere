import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel, type UserDocument } from "../models/User";
import { config } from "../config";

const SALT_ROUNDS = 12;

function sanitizeUser(doc: UserDocument) {
  const obj = {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    role: doc.role,
  };
  return obj;
}

export async function signup(name: string, email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await UserModel.create({ name, email, passwordHash });
  return sanitizeUser(user);
}

export async function login(email: string, password: string) {
  const user = await UserModel.findOne({ email }).exec();
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  return sanitizeUser(user);
}

export function generateToken(user: { id: string; name: string; email: string; role?: string }) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role ?? "user" },
    config.authSecret,
    { expiresIn: "7d" }
  );
}
