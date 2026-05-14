import bcrypt from "bcryptjs";
import { UserModel, type UserDocument } from "../models/user.model";
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

export function serializeUser(user: UserDocument): AuthUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email
  };
}

export async function signupUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const existingUser = await UserModel.findOne({ email: input.email });

  if (existingUser) {
    throw new HttpError(409, "User with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    passwordHash
  });

  return {
    token: signToken(user),
    user: serializeUser(user)
  };
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const user = await UserModel.findOne({ email: input.email }).select("+passwordHash");

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
