-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'WAITLIST', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PassengerStatus" AS ENUM ('CONFIRMED', 'WL', 'RAC');

-- CreateEnum
CREATE TYPE "BerthPreference" AS ENUM ('LB', 'MB', 'UB', 'SL', 'SU', 'NONE');

-- CreateEnum
CREATE TYPE "ClassType" AS ENUM ('SL', 'THIRDA', 'SECONDA', 'FIRSTA');

-- CreateEnum
CREATE TYPE "QuotaType" AS ENUM ('GENERAL', 'TATKAL', 'PREMIUM');

-- CreateTable
CREATE TABLE "Booking" (
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

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passenger" (
    "id" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "berthPreference" "BerthPreference" NOT NULL,
    "seatNo" TEXT,
    "status" "PassengerStatus" NOT NULL,
    "bookingId" TEXT NOT NULL,

    CONSTRAINT "Passenger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatInventory" (
    "id" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "class" "ClassType" NOT NULL,
    "seatNo" TEXT NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "pnr" TEXT,
    "quotaType" "QuotaType" NOT NULL,

    CONSTRAINT "SeatInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fare" (
    "id" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "class" "ClassType" NOT NULL,
    "quota" "QuotaType" NOT NULL,
    "baseFare" BIGINT NOT NULL,
    "dynamicFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_pnr_key" ON "Booking"("pnr");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_trainId_date_idx" ON "Booking"("trainId", "date");

-- CreateIndex
CREATE INDEX "Passenger_bookingId_idx" ON "Passenger"("bookingId");

-- CreateIndex
CREATE INDEX "SeatInventory_trainId_date_class_idx" ON "SeatInventory"("trainId", "date", "class");

-- CreateIndex
CREATE UNIQUE INDEX "SeatInventory_trainId_date_class_seatNo_key" ON "SeatInventory"("trainId", "date", "class", "seatNo");

-- CreateIndex
CREATE INDEX "Fare_trainId_class_quota_idx" ON "Fare"("trainId", "class", "quota");

-- CreateIndex
CREATE UNIQUE INDEX "Fare_trainId_class_quota_effectiveFrom_key" ON "Fare"("trainId", "class", "quota", "effectiveFrom");

-- AddForeignKey
ALTER TABLE "Passenger" ADD CONSTRAINT "Passenger_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
