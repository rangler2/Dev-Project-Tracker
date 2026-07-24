import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const outDir = "/opt/cursor/artifacts/screenshots";
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 1,
});

const shots = [
  { path: "/login", file: "01-login.png", fullPage: true },
  { path: "/projects", file: "02-projects.png", fullPage: true },
  { path: "/clients", file: "03-clients.png", fullPage: true },
  {
    path: "/projects/33333333-3333-3333-3333-333333333301",
    file: "04-project-detail.png",
    fullPage: true,
  },
  { path: "/leaderboard", file: "05-leaderboard.png", fullPage: true },
];

for (const shot of shots) {
  const url = `http://localhost:3000${shot.path}`;
  console.log(`Capturing ${url}`);
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: `${outDir}/${shot.file}`,
    fullPage: shot.fullPage,
  });
}

await browser.close();
console.log(`Saved screenshots to ${outDir}`);
