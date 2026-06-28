import { analyzeSeo, checkUptime } from "../dist/services/seo.js";

const domains = [
  "example.com",
  "wikipedia.org",
  "github.com",
  "yandex.ru",
  "budget-hotels-guide.com",
  "smart-home-setup.blog",
];

async function main() {
  for (const d of domains) {
    console.log(`\n=== ${d} ===`);
    const up = await checkUptime(d);
    console.log("uptime:", up);
    const seo = await analyzeSeo(d);
    console.log("seo:", seo);
  }
}

main().catch(console.error);
