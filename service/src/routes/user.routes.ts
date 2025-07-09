import express from "express";
import { asyncHandler } from "../utils/async.handler";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const userRouter = express.Router();

/**
 * @openapi
 * /api/v1/user/sign-up:
 *   post:
 *     summary: Create a new user account
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: User already exists
 */
userRouter.post("/sign-up", asyncHandler(UserController.signup));

/**
 * @openapi
 * /api/v1/user/login:
 *   post:
 *     summary: Log in a user and issue tokens
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       404:
 *         description: User not found
 *       409:
 *         description: Invalid credentials
 */
userRouter.post("/login", asyncHandler(UserController.login));

/**
 * @openapi
 * /api/v1/user/me:
 *   get:
 *     summary: Get the current user's profile
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile returned
 *       404:
 *         description: User not found
 */
userRouter.get("/me", authMiddleware, asyncHandler(UserController.profile));

/**
 * @openapi
 * /api/v1/user/refresh:
 *   get:
 *     summary: Refresh access and refresh tokens
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed
 *       403:
 *         description: Token revoked or malformed
 *       404:
 *         description: User not found
 */
userRouter.get("/refresh", asyncHandler(UserController.refresh));


export default userRouter;
