/*
  Warnings:

  - Added the required column `berth` to the `SeatInventory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "SeatInventory_trainId_date_class_idx";

-- AlterTable
ALTER TABLE "SeatInventory" ADD COLUMN     "berth" "BerthPreference" NOT NULL;

-- CreateIndex
CREATE INDEX "SeatInventory_trainId_date_class_berth_idx" ON "SeatInventory"("trainId", "date", "class", "berth");
