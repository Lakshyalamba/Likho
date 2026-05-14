import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { UserDocument } from "../models/user.model";

export interface JwtPayload {
  userId: string;
  email: string;
}

export function signToken(user: UserDocument) {
  return jwt.sign(
    {
      userId: String(user._id),
      email: user.email
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"]
    }
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
