import { SignJWT,jwtVerify } from "jose";
import type { JwtPayload } from "../utils/types";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export const generateToken = async (payload: { userId: string; role: string }) => {
  const access = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);

  const refresh = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  return { access, refresh };
};

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  const { payload } = await jwtVerify<JwtPayload>(token, secret);
  return payload;
};


