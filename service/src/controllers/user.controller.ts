import type { Request, Response } from "express";
import { decode, encode } from "../lib/pass.hash";
import { generateToken, verifyToken } from "../lib/sign.jwt";
import { loginSchema, signupSchema } from "../schema/user.schema";
import { AppError } from "../utils/global.error";
import { RedisKeys } from "../lib/key.gen";
import redis from "../utils/redis.singleton"
import prisma from "../utils/db.singleton"

class Controller {
  private static instance: Controller | null;

  constructor() {}

  static getInstance() {
    if (!this.instance) this.instance = new Controller();

    return this.instance;
  }

  public signup = async (req: Request, res: Response) => {
    const body = req.body;

    const isValid = signupSchema.safeParse(body);

    if (!isValid.success)
      throw new AppError("Validaton err " + isValid.error, 411);

    const { name, email, password } = isValid.data;

    const existing = await prisma.userAccount.findUnique({ where: { email } });
    if (existing) throw new AppError("User already exists", 409);

    const hashed = await encode(password);

    await prisma.userAccount.create({
      data: {
        name,
        email,
        password: hashed,
      },
    });

    res.status(201).json({
      success: true,
      message: "user created!",
    });
  };

  public login = async (req: Request, res: Response) => {
    const body = req.body;

    const isValid = loginSchema.safeParse(body);

    if (!isValid.success)
      throw new AppError("Validaton err " + isValid.error, 411);

    const { email, password } = isValid.data;

    const exist = await prisma.userAccount.findUnique({
      where: {
        email,
      },
    });

    if (!exist) throw new AppError("UserAccount Not Found!", 404);

    const isMatch = await decode(password, exist.password);

    if (!isMatch) throw new AppError("Invalid email/password", 409);

    const { access, refresh } = await generateToken({
      userId: exist.id,
      role: exist.role as string,
    });

    res.cookie("access", access, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      path: "/",
    });

    res.cookie("refresh", refresh, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "login successfull!",
    });

    await prisma.userAccount.update({
      where: {
        id: exist.id,
      },
      data: {
        accessToken: access,
        refreshToken: refresh,
      },
    });
  };

  public profile = async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("No user found!", 404);

    const key = `user:profile:${req.user.id}`;

    const cache = await redis.get(key);

    if (cache) {
      res.status(200).json({
        user: JSON.parse(cache),
        success: true,
      });
      return;
    }

    const user = await prisma.userAccount.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        name: true,
        email: true,
        role: true,
      },
    });

    await redis.set(key, JSON.stringify(user), "EX", 60 * 5);

    res.status(200).json({
      user,
      success: true,
    });
  };

  public refresh = async (req: Request, res: Response) => {
    const token = req.cookies.refresh;

    const key = RedisKeys.generateKey("refresh", "revoke", token);

    const cache = await redis.get(key);

    if (cache) throw new AppError("Revoked Token", 403);

    const verify = await verifyToken(token);

    if (!verify) {
      await redis.set(key, verify);
      throw new AppError("JWT Malformed", 403);
    }

    const user = await prisma.userAccount.findUnique({
      where: {
        id: verify.userId,
      },
    });

    if (!user) throw new AppError("User Not Found!", 404);

    const { access, refresh } = await generateToken({
      userId : verify.userId,
      role : verify.role
    });

    res.cookie("access", access, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    });

    res.cookie("refresh", refresh, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed!",
    });

    await prisma.userAccount.update({
      where: {
        id: user.id,
      },
      data: {
        accessToken: access,
        refreshToken: refresh,
      },
    });

    await redis.set(key, token, "EX", 10 * 60);
  };
}

export const UserController = Controller.getInstance();
