import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

console.log("SUPABASE URL:", process.env.SUPABASE_URL);

const BATCH_SIZE = 10;
const MIN_DELAY = 15000;
const MAX_DELAY = 22000;
const MAX_RETRIES = 1;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...Chrome/120...',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
  'Mozilla/5.0 (Windows NT 10.0; WOW64)...'
];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function randomDelay() {
  return sleep(
    MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY)
  );
}

function isBlocked(content) {
  return (
    content.includes("Enter the characters you see") ||
    content.includes("Robot Check") ||
    content.includes("Sorry, we just need to make sure")
  );
}

async function scrapeSingle(page, asin) {

  await page.goto(`https://www.amazon.in/dp/${asin}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  await page.waitForTimeout(4000);

  const content = await page.content();

  if (isBlocked(content)) {
    await page.screenshot({
      path: `debug-${asin}.png`,
      fullPage: true
    });

    throw new Error("BLOCKED_BY_AMAZON");
  }

  // 🔴 AVAILABILITY CHECK (NEW LOGIC)
  const availabilityStatus = await page.evaluate(() => {

    const bodyText = document.body.innerText.toLowerCase();

    const hasCurrentlyUnavailable =
      bodyText.includes("currently unavailable");

    const hasTempOutOfStock =
      bodyText.includes("temporarily out of stock");

    const addToCartButton =
      document.querySelector("#add-to-cart-button");

    if (hasCurrentlyUnavailable || hasTempOutOfStock || !addToCartButton) {
      return "unavailable";
    }

    return "available";
  });

  // If unavailable → return safely (do NOT throw)
  if (availabilityStatus === "unavailable") {
    return {
      price: null,
      isDeal: false,
      availability: "unavailable"
    };
  }

  const price = await page.evaluate(() => {
    const offscreen = document.querySelector('.a-price .a-offscreen');
    if (offscreen) {
      return parseFloat(
        offscreen.innerText
          .replace('₹', '')
          .replace(/,/g, '')
          .trim()
      );
    }
    return null;
  });

  const isDeal = await page.evaluate(() => {
    const badge = document.querySelector(
      '#dealBadge_feature_div, .dealBadge, .a-badge-label'
    );
    if (!badge) return false;
    return badge.innerText.toLowerCase()
      .includes('limited time deal');
  });

  if (!price) throw new Error("PRICE_NOT_FOUND");

  return {
    price,
    isDeal,
    availability: "available"
  };
}

async function runScraper() {

  console.log("🚀 SAFE MODE WITH RECOVERY");

  const { data: asins, error } = await supabase
    .from("amazon_asins")
    .select("asin")
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching ASINs:", error);
    process.exit(1);
  }

  if (!asins || asins.length === 0) {
    console.error("No ASINs found in database.");
    process.exit(1);
  }

  console.log("TOTAL ASINS FROM DB:", asins.length);

  const browser = await chromium.launch({ headless: true });

  let failedAsins = [];
  let processed = 0;

  for (let i = 0; i < asins.length; i += BATCH_SIZE) {

    const batch = asins.slice(i, i + BATCH_SIZE);

    const context = await browser.newContext({
      userAgent: USER_AGENTS[Math.floor(Math.random() * 3)]
    });

    const page = await context.newPage();

    for (const item of batch) {

      const asin = item.asin;
      let success = false;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {

        try {
          console.log("Checking:", asin);

          const result = await scrapeSingle(page, asin);

          await supabase
            .from('amazon_price_history')
            .insert({
              asin,
              price: result.price,
              is_limited_time_deal: result.isDeal,
              availability: result.availability
            });

          processed++;
          console.log("Processed count:", processed);

          success = true;
          break;

        } catch (err) {

          if (err.message === "BLOCKED_BY_AMAZON") {
            console.log("🚨 BLOCK DETECTED — STOPPING");
            await browser.close();
            return;
          }

          console.log("Retry:", asin);
        }
      }

      if (!success) {
        failedAsins.push(asin);
      }

      await randomDelay();
    }

    await context.close();
    await sleep(30000);
  }

  // 🔁 RETRY FAILED ONCE MORE
  if (failedAsins.length > 0) {

    console.log("\n🔁 RETRYING FAILED ASINS:", failedAsins.length);

    const context = await browser.newContext({
      userAgent: USER_AGENTS[Math.floor(Math.random() * 3)]
    });

    const page = await context.newPage();

    for (const asin of failedAsins) {
      try {
        const result = await scrapeSingle(page, asin);

        await supabase
          .from('amazon_price_history')
          .insert({
            asin,
            price: result.price,
            is_limited_time_deal: result.isDeal,
            availability: result.availability
          });

      } catch {
        console.log("Still failed:", asin);
      }

      await randomDelay();
    }

    await context.close();
  }

  await browser.close();

  console.log("\n🚩 FINAL RUN COMPLETE");
  console.log("Failed Count:", failedAsins.length);

  await supabase.from('scrape_runs').insert({
    total_asins: asins.length,
    processed: processed,
    failed: failedAsins.length
  });

  await supabase
    .from('failed_asins')
    .delete()
    .eq('run_date', new Date().toISOString().split('T')[0]);

  for (const asin of failedAsins) {
    await supabase.from('failed_asins').insert({
      asin,
      error_message: "Scrape failed"
    });
  }
}

runScraper();
