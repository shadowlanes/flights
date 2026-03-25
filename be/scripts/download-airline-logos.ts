import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { existsSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();
const LOGOS_DIR = join(__dirname, "../../fe/public/airlines");
const BASE_URL = "https://pics.avs.io/100/100";

async function main() {
  mkdirSync(LOGOS_DIR, { recursive: true });

  const airlines = await prisma.airline.findMany({ orderBy: { iataCode: "asc" } });
  console.log(`Found ${airlines.length} airlines in database`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const airline of airlines) {
    const code = airline.iataCode.trim();
    const filePath = join(LOGOS_DIR, `${code}.png`);

    if (existsSync(filePath)) {
      skipped++;
      continue;
    }

    const url = `${BASE_URL}/${code}.png`;

    try {
      const res = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 10000,
      });

      if (res.status === 200 && res.data.length > 100) {
        writeFileSync(filePath, res.data);
        console.log(`  ✓ ${code} (${airline.name})`);
        downloaded++;
      } else {
        console.log(`  ✗ ${code} (${airline.name}) — empty response`);
        failed++;
      }
    } catch (err: any) {
      console.log(`  ✗ ${code} (${airline.name}) — ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! Downloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${failed}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
