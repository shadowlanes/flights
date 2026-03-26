-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "destWeatherAqi" INTEGER,
ADD COLUMN     "destWeatherDesc" TEXT,
ADD COLUMN     "destWeatherIcon" TEXT,
ADD COLUMN     "destWeatherTemp" DOUBLE PRECISION,
ADD COLUMN     "destWeatherUpdatedAt" TIMESTAMP(3);
