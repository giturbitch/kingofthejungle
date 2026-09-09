const { ethers } = require("ethers");
require("dotenv/config");
const fs = require("fs");
const path = require("path");

const RPC_URL = process.env.ROBINHOOD_RPC || process.env.RPC_URL_TESTNET || "https://rpc.testnet.chain.robinhood.com";
const PRIVATE_KEY = process.env.KEEPER_PRIVATE_KEY || process.env.PRIVATE_KEY;
const ENGINE_ADDRESS = process.env.VITE_JUNGLE_ENGINE;
const ROUTER_ADDRESS = process.env.VITE_LAUNCHPAD_ROUTER;
const POLL_MS = Number(process.env.POLL_MS || "30000");

const engineAbi = [
  "event Hunt(uint256 indexed tokenId, string targetCategory, string targetTicker, uint256 readyAt)",
  "function farmers(uint256) view returns (uint8 status, uint256 readyAt, uint256 nextActionAt, string targetCategory, string targetTicker, uint256 harvests)",
  "function ripen(uint256 tokenId)",
];

const routerAbi = [
  "event LaunchRequested(uint256 indexed launchId, uint256 indexed tokenId, uint8 launchpad, string ticker, uint256 supply, address requester)",
  "function fulfillLaunch(uint256 launchId, address launchedToken, bytes32 launchTxHash)",
];

async function main() {
  if (!PRIVATE_KEY || PRIVATE_KEY === "0x" + "0".repeat(64)) {
    console.error("Set KEEPER_PRIVATE_KEY in .env");
    process.exit(1);
  }
  if (!ENGINE_ADDRESS || !ROUTER_ADDRESS) {
    console.error("Set VITE_JUNGLE_ENGINE and VITE_LAUNCHPAD_ROUTER in .env");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const engine = new ethers.Contract(ENGINE_ADDRESS, engineAbi, wallet);
  const router = new ethers.Contract(ROUTER_ADDRESS, routerAbi, wallet);

  console.log(`Keeper running: ${wallet.address}`);
  console.log(`Engine: ${ENGINE_ADDRESS}, Router: ${ROUTER_ADDRESS}, RPC: ${RPC_URL}`);

  const statePath = path.join(process.cwd(), ".keeper-state.json");
  const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, "utf8")) : { processedHunts: [], processedLaunches: [] };

  const saveState = () => fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

  const processReadyFarmers = async () => {
    for (const tokenId of state.processedHunts) {
      const f = await engine.farmers(tokenId);
      const now = BigInt(Math.floor(Date.now() / 1000));
      if (f.status === 1n && now >= f.readyAt) {
        console.log(`Ripening farmer ${tokenId}`);
        try {
          const tx = await engine.ripen(tokenId);
          await tx.wait();
          console.log(`Ripened ${tokenId}: ${tx.hash}`);
        } catch (e) {
          console.error(`Failed to ripen ${tokenId}:`, e);
        }
      }
    }
  };

  engine.on("Hunt", (tokenId) => {
    const id = tokenId.toString();
    if (!state.processedHunts.includes(id)) {
      console.log(`Observed hunt: token ${id}`);
      state.processedHunts.push(id);
      saveState();
    }
  });

  router.on("LaunchRequested", (launchId) => {
    const id = launchId.toString();
    if (!state.processedLaunches.includes(id)) {
      console.log(`Observed launch request: ${id}`);
      state.processedLaunches.push(id);
      saveState();
      // TODO: run launchpad-specific token creation transaction, then call fulfillLaunch.
    }
  });

  setInterval(processReadyFarmers, POLL_MS);
  await processReadyFarmers();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
