-- AlterTable
ALTER TABLE "UserAccount" ALTER COLUMN "accessToken" DROP NOT NULL,
ALTER COLUMN "refreshToken" DROP NOT NULL;

-- CreateTable
CREATE TABLE "RevokedList" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevokedList_pkey" PRIMARY KEY ("id")
);
