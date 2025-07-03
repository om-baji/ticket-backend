import express from "express";
import { asyncHandler } from "../utils/async.handler";
import { UserController } from "../controllers/user.controller";

const userRouter = express.Router();

userRouter.post("/sign-up", asyncHandler(UserController.signup));

userRouter.post("/login", asyncHandler(UserController.login));

export default userRouter;
