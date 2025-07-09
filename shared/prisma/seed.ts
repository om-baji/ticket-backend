import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const CLASS_TYPES = ["SL", "THIRDA", "SECONDA", "FIRSTA"] as const;
const QUOTA_TYPES = ["GENERAL", "TATKAL", "PREMIUM"] as const;
const BERTH_PREFERENCES = ["LB", "MB", "UB", "SL", "SU", "NONE"] as const;

function getRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Seeding database...");

  for (let i = 1; i <= 5; i++) {
    const train = await prisma.train.create({
      data: {
        trainNumber: `1${faker.number.int({ min: 1000, max: 9999 })}`,
        name: faker.company.name() + " Express",
        source: faker.location.city(),
        destination: faker.location.city(),
        seatConfig: {
          create: CLASS_TYPES.map((cls) => ({
            class: cls,
            quota: getRandom(QUOTA_TYPES),
            seatCount: faker.number.int({ min: 50, max: 200 }),
            berth: getRandom(BERTH_PREFERENCES),
          })),
        },
      },
    });

    for (const cls of CLASS_TYPES) {
      for (const quota of QUOTA_TYPES) {
        await prisma.trainFare.create({
          data: {
            trainId: train.id,
            class: cls,
            quota,
            baseFare: BigInt(faker.number.int({ min: 300, max: 3000 })),
            effectiveFrom: new Date(),
          },
        });
      }
    }
  }

  console.log(" Seeding complete with trains, fares.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
