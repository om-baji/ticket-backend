export const RedisKeys = {
  generateKey: (...args: string[]): string => {
    return `redis:${args.join(":")}`;
  },
};
