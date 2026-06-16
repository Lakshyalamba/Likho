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
  username: string | null;
  bio: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export function serializeUser(
  user: Pick<User, "id" | "name" | "email" | "username" | "bio">
): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    bio: user.bio
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

export async function updateProfile(
  userId: string,
  input: { name?: string; username?: string | null; bio?: string | null }
): Promise<AuthUser> {
  const data: Record<string, unknown> = {};

  if (input.name !== undefined) data.name = input.name;
  if (input.username !== undefined) data.username = input.username || null;
  if (input.bio !== undefined) data.bio = input.bio || null;

  if (data.name !== undefined && typeof data.name === "string" && data.name.trim().length < 2) {
    throw new HttpError(400, "Name must be at least 2 characters");
  }

  if (input.username !== undefined && input.username !== null) {
    const existing = await prisma.user.findUnique({ where: { username: input.username } });
    if (existing && existing.id !== userId) {
      throw new HttpError(409, "Username is already taken");
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, username: true, bio: true }
  });

  return serializeUser(user);
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
