/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "cas_login" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL DEFAULT 'student',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mobilities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" DATE NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_original" BOOLEAN NOT NULL DEFAULT true,
    "last_edit" TIMESTAMP(3) NOT NULL,
    "start" TEXT NOT NULL,
    "end" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,

    CONSTRAINT "mobilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "is_selected" BOOLEAN NOT NULL DEFAULT false,
    "id_mobility" TEXT NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "steps" (
    "id" TEXT NOT NULL,
    "sequence_order" INTEGER NOT NULL,
    "label_start" TEXT,
    "label_end" TEXT,
    "point_start" geometry(Point, 4326),
    "point_end" geometry(Point, 4326),
    "carbon" DOUBLE PRECISION,
    "distance" DOUBLE PRECISION,
    "metadata" JSONB,
    "id_trip" TEXT NOT NULL,

    CONSTRAINT "steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_modes" (
    "id" TEXT NOT NULL,
    "label" TEXT,
    "carbonFactor" DOUBLE PRECISION,
    "id_step" TEXT NOT NULL,

    CONSTRAINT "transport_modes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_cas_login_key" ON "users"("cas_login");

-- AddForeignKey
ALTER TABLE "mobilities" ADD CONSTRAINT "mobilities_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_id_mobility_fkey" FOREIGN KEY ("id_mobility") REFERENCES "mobilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "steps" ADD CONSTRAINT "steps_id_trip_fkey" FOREIGN KEY ("id_trip") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_modes" ADD CONSTRAINT "transport_modes_id_step_fkey" FOREIGN KEY ("id_step") REFERENCES "steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
