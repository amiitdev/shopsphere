import type { Request, Response } from "express";
import { z } from "zod";
import * as authService from "../services/authService";
import { config } from "../config";

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function setAuthCookie(res: Response, token: string) {
  const isProd = config.nodeEnv === "production";
  res.cookie(config.authTokenName, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function signup(req: Request, res: Response) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.format() });
  }
  const { name, email, password } = parsed.data;
  const existing = await import("../models/User").then((m) =>
    m.UserModel.findOne({ email }).exec()
  );
  if (existing) {
    return res.status(409).json({ error: "Email already in use" });
  }
  const user = await authService.signup(name, email, password);
  const token = authService.generateToken(user);
  setAuthCookie(res, token);
  res.status(201).json({ user });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.format() });
  }
  const { email, password } = parsed.data;
  const user = await authService.login(email, password);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = authService.generateToken(user);
  setAuthCookie(res, token);
  res.json({ user });
}

export async function logout(_req: Request, res: Response) {
  const isProd = config.nodeEnv === "production";
  res.cookie(config.authTokenName, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 0,
  });
  res.json({});
}

export async function me(req: Request, res: Response) {
  res.json({ user: req.user });
}
