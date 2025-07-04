import express from "express";
import { asyncHandler } from "../utils/async.handler";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const userRouter = express.Router();

userRouter.post("/sign-up", asyncHandler(UserController.signup));

userRouter.post("/login", asyncHandler(UserController.login));

userRouter.get("/me", authMiddleware, asyncHandler(UserController.profile));

userRouter.get(
  "/refresh",
  authMiddleware,
  asyncHandler(UserController.refresh)
);

export default userRouter;
