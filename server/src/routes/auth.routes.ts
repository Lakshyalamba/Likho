import { Router } from "express";
import { login, me, signup, updateProfileHandler } from "../controllers/auth.controller";
import { asyncHandler } from "../middleware/async-handler";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/signup", asyncHandler(signup));
authRouter.post("/login", asyncHandler(login));
authRouter.get("/me", requireAuth, me);
authRouter.patch("/profile", requireAuth, asyncHandler(updateProfileHandler));
