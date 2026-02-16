/*
  Warnings:

  - You are about to drop the `transport_modes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "transport_modes" DROP CONSTRAINT "transport_modes_id_step_fkey";

-- AlterTable
ALTER TABLE "steps" ADD COLUMN     "transport_carbon_factor" DOUBLE PRECISION,
ADD COLUMN     "transport_mode" TEXT;

-- DropTable
DROP TABLE "transport_modes";
