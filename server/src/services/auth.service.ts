import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { HttpError } from "../utils/http-error";
import { signToken } from "../utils/jwt";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export function serializeUser(user: Pick<User, "id" | "name" | "email">): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

export async function signupUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email
    }
  });

  if (existingUser) {
    throw new HttpError(409, "User with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash
    }
  });

  return {
    token: signToken(user),
    user: serializeUser(user)
  };
}

export async function ensureDemoUser() {
  const email = env.demoUserEmail.toLowerCase();
  const passwordHash = await bcrypt.hash(env.demoUserPassword, 12);

  await prisma.user.upsert({
    where: {
      email
    },
    update: {
      name: env.demoUserName,
      passwordHash
    },
    create: {
      name: env.demoUserName,
      email,
      passwordHash
    }
  });

  console.log(`Demo account ready: ${email}`);
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email
    }
  });

  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new HttpError(401, "Invalid email or password");
  }

  return {
    token: signToken(user),
    user: serializeUser(user)
  };
}
