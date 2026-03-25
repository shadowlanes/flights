-- CreateTable
CREATE TABLE "user_stats" (
    "userId" TEXT NOT NULL,
    "totalFlights" INTEGER NOT NULL DEFAULT 0,
    "totalDistanceKm" INTEGER NOT NULL DEFAULT 0,
    "totalDurationMin" INTEGER NOT NULL DEFAULT 0,
    "uniqueAirlines" INTEGER NOT NULL DEFAULT 0,
    "uniqueAirports" INTEGER NOT NULL DEFAULT 0,
    "uniqueCountries" INTEGER NOT NULL DEFAULT 0,
    "uniqueContinents" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
