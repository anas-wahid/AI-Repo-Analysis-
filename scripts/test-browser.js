const { chromium } = require('playwright-core');
const fs = require('fs');

function findChromium() {
  if (process.platform === "win32") {
    const paths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    ];
    return paths.find((p) => fs.existsSync(p));
  }
  return undefined;
}

const exe = findChromium();
console.log("Found Chromium at:", exe);

if (exe) {
  chromium.launch({ executablePath: exe, headless: true })
    .then(b => {
      console.log("Successfully launched browser!");
      b.close();
    })
    .catch(err => {
      console.error("Failed to launch:", err);
    });
} else {
  console.log("No browser found");
}
