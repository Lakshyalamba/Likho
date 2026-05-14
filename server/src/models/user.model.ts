import { model, Schema, type HydratedDocument } from "mongoose";

export interface User {
  name: string;
  email: string;
  passwordHash: string;
}

export type UserDocument = HydratedDocument<User>;

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    }
  },
  {
    timestamps: true
  }
);

export const UserModel = model<UserDocument>("User", userSchema);
