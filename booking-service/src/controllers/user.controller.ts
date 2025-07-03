import { decode, encode } from "../lib/pass.hash";
import { generateToken } from "../lib/sign.jwt";
import { loginSchema, signupSchema } from "../schema/user.schema";
import { prisma } from "../utils/db.singleton";
import { AppError } from "../utils/global.error";
import type { Request, Response } from "express";

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
      role: exist.role,
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
}

export const UserController = Controller.getInstance();
