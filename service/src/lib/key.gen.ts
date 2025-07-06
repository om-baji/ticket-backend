import crypto from "crypto"
export const RedisKeys = {
  generateKey: (...args: string[]): string => {
    return `redis:${args.join(":")}`;
  },
};

export const generatePNR = (userId: string, trainId: string): string => {
  const timestamp = Date.now().toString(36); 
  const uidPart = userId.slice(-3);
  const tidPart = trainId.slice(-3);         

  const random = crypto.randomBytes(2).toString("hex").toUpperCase().slice(0, 2);

  return `${tidPart}${uidPart}-${timestamp}-${random}`;
};