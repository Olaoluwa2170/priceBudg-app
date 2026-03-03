const { ConvexHttpClient } = require("convex/browser");
const client = new ConvexHttpClient("https://" + process.env.CONVEX_URL);
async function run() {
  console.log("Setting up client");
}
run();
