import { password } from "bun";

export const encode = async (plain: string) => {
  return await password.hash(plain, {
    algorithm: "argon2d",
    memoryCost: 4,
    timeCost: 3,
  });
};

export const decode = async (plain: string, hashed: string) => {
  return await password.verify(plain, hashed);
};
