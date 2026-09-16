-- CreateEnum
CREATE TYPE "CollectionType" AS ENUM ('MANUAL', 'TAG');

-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "tagId" TEXT,
ADD COLUMN     "type" "CollectionType" NOT NULL DEFAULT 'MANUAL';

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
