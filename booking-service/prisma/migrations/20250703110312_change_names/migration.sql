/*
  Warnings:

  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Fare` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Passenger` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SeatInventory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrainClass` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('USER', 'ADMIN', 'AGENT');

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_trainId_fkey";

-- DropForeignKey
ALTER TABLE "Passenger" DROP CONSTRAINT "Passenger_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "TrainClass" DROP CONSTRAINT "TrainClass_trainId_fkey";

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "Fare";

-- DropTable
DROP TABLE "Passenger";

-- DropTable
DROP TABLE "SeatInventory";

-- DropTable
DROP TABLE "TrainClass";

-- CreateTable
CREATE TABLE "UserAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Roles" NOT NULL DEFAULT 'USER',
    "password" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,

    CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainBooking" (
    "id" TEXT NOT NULL,
    "pnr" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "class" "ClassType" NOT NULL,
    "quota" "QuotaType" NOT NULL,
    "status" "BookingStatus" NOT NULL,
    "price" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PassengerBooking" (
    "id" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "berthPreference" "BerthPreference" NOT NULL,
    "seatNo" TEXT,
    "status" "PassengerStatus" NOT NULL,
    "bookingId" TEXT NOT NULL,

    CONSTRAINT "PassengerBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainFare" (
    "id" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "class" "ClassType" NOT NULL,
    "quota" "QuotaType" NOT NULL,
    "baseFare" BIGINT NOT NULL,
    "dynamicFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainFare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainSeatConfig" (
    "id" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "class" "ClassType" NOT NULL,
    "berth" "BerthPreference" NOT NULL,
    "quota" "QuotaType" NOT NULL,
    "seatCount" INTEGER NOT NULL,

    CONSTRAINT "TrainSeatConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_email_key" ON "UserAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TrainBooking_pnr_key" ON "TrainBooking"("pnr");

-- CreateIndex
CREATE INDEX "TrainBooking_userId_idx" ON "TrainBooking"("userId");

-- CreateIndex
CREATE INDEX "TrainBooking_trainId_date_idx" ON "TrainBooking"("trainId", "date");

-- CreateIndex
CREATE INDEX "PassengerBooking_bookingId_idx" ON "PassengerBooking"("bookingId");

-- CreateIndex
CREATE INDEX "TrainFare_trainId_class_quota_idx" ON "TrainFare"("trainId", "class", "quota");

-- CreateIndex
CREATE UNIQUE INDEX "TrainFare_trainId_class_quota_effectiveFrom_key" ON "TrainFare"("trainId", "class", "quota", "effectiveFrom");

-- CreateIndex
CREATE INDEX "TrainSeatConfig_trainId_class_quota_berth_idx" ON "TrainSeatConfig"("trainId", "class", "quota", "berth");

-- AddForeignKey
ALTER TABLE "TrainBooking" ADD CONSTRAINT "TrainBooking_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "Train"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainBooking" ADD CONSTRAINT "TrainBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassengerBooking" ADD CONSTRAINT "PassengerBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "TrainBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainSeatConfig" ADD CONSTRAINT "TrainSeatConfig_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "Train"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
