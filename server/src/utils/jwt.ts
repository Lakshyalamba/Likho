import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  userId: string;
  email: string;
}

export function signToken(user: { id: string; email: string }) {
  return jwt.sign(
    {
      userId: user.id,
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
