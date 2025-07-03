import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const train = await prisma.train.create({
    data: {
      trainNumber: "12345",
      name: "Rajdhani Express",
      source: "Mumbai",
      destination: "Delhi",
      classes: {
        create: [
          {
            class: "SL",
            quota: "GENERAL",
            seatCount: 100,
            berth: "LB",
          },
          {
            class: "FIRSTA",
            quota: "TATKAL",
            seatCount: 10,
            berth: "UB",
          },
        ],
      },
    },
  });

  await prisma.trainFare.createMany({
    data: [
      {
        trainId: train.id,
        class: "SL",
        quota: "GENERAL",
        baseFare: BigInt(500),
        effectiveFrom: new Date(),
      },
      {
        trainId: train.id,
        class: "FIRSTA",
        quota: "TATKAL",
        baseFare: BigInt(2500),
        effectiveFrom: new Date(),
      },
    ],
  });

  const user = await prisma.userAccount.create({
    data: {
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
      accessToken: "fakeAccessToken",
      refreshToken: "fakeRefreshToken",
      role: "USER",
    },
  });

  const booking = await prisma.trainBooking.create({
    data: {
      pnr: faker.string.uuid().slice(0, 8),
      userId: user.id,
      trainId: train.id,
      class: "SL",
      quota: "GENERAL",
      date: new Date(),
      status: "CONFIRMED",
      price: BigInt(500),
      passengers: {
        create: [
          {
            name: "Ravi Kumar",
            age: 29,
            berthPreference: "LB",
            seatNo: "S1-12",
            status: "CONFIRMED",
          },
        ],
      },
    },
  });

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
