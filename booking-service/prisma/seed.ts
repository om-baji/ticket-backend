import {
  PrismaClient,
  BerthPreference,
  BookingStatus,
  ClassType,
  PassengerStatus,
  QuotaType,
} from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const today = new Date();

const getRandomEnum = <T>(enumObj: T): T[keyof T] => {
  const values = Object.values(enumObj as object);
  return values[Math.floor(Math.random() * values.length)];
};

async function main() {
  const trains = await prisma.train.createMany({
    data: [
      {
        trainNumber: "12345",
        name: "Shatabdi Express",
        source: "Mumbai",
        destination: "Delhi",
      },
      {
        trainNumber: "54321",
        name: "Rajdhani Express",
        source: "Kolkata",
        destination: "Delhi",
      },
      {
        trainNumber: "67890",
        name: "Duronto Express",
        source: "Bangalore",
        destination: "Hyderabad",
      },
    ],
  });

  const trainList = await prisma.train.findMany();

  for (const train of trainList) {
    for (const cls of ["SL", "THIRDA", "SECONDA", "FIRSTA"] as ClassType[]) {
      for (const quota of ["GENERAL", "TATKAL"] as QuotaType[]) {
        await prisma.trainClass.create({
          data: {
            trainId: train.id,
            class: cls,
            quota,
            seatCount: 30,
          },
        });

        await prisma.fare.create({
          data: {
            trainId: train.id,
            class: cls,
            quota,
            baseFare: BigInt(faker.number.int({ min: 300, max: 3000 })),
            effectiveFrom: today,
          },
        });

        for (let i = 0; i < 5; i++) {
          const date = new Date();
          date.setDate(today.getDate() + i);

          const seats = Array.from({ length: 10 }).map((_, i) => ({
            trainId: train.id,
            date,
            class: cls,
            seatNo: `${cls.slice(0, 1)}${i + 1}`,
            quotaType: quota,
          }));

          await prisma.seatInventory.createMany({ data: seats });
        }
      }
    }
  }

  for (let i = 0; i < 10; i++) {
    const train = trainList[i % trainList.length];
    const bookingDate = new Date();
    bookingDate.setDate(today.getDate() + (i % 5));

    const cls = getRandomEnum(ClassType);
    const quota = getRandomEnum(QuotaType);
    const bookingStatus = getRandomEnum(BookingStatus);
    const pnr = `PNR${faker.number.int({ min: 1000000, max: 9999999 })}`;

    const booking = await prisma.booking.create({
      data: {
        pnr,
        userId: `user_${i + 1}`,
        trainId: train.id,
        date: bookingDate,
        class: cls,
        quota,
        status: bookingStatus,
        price: BigInt(faker.number.int({ min: 500, max: 3000 })),
        passengers: {
          create: Array.from({
            length: faker.number.int({ min: 1, max: 3 }),
          }).map(() => ({
            name: faker.person.fullName(),
            age: faker.number.int({ min: 18, max: 60 }),
            berthPreference: getRandomEnum(BerthPreference),
            seatNo: faker.helpers.arrayElement(["S1", "S2", "S3", "S4", "S5"]),
            status: getRandomEnum(PassengerStatus),
          })),
        },
      },
    });

    console.log(`Seeded booking: ${booking.pnr}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
