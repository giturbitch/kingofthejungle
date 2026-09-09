const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const FarmToken = await hre.ethers.getContractFactory("FarmToken");
  const farmToken = await FarmToken.deploy(deployer.address);
  await farmToken.waitForDeployment();
  console.log("FarmToken deployed to:", await farmToken.getAddress());

  const Survivor = await hre.ethers.getContractFactory("Survivor");
  const survivor = await Survivor.deploy(deployer.address, "");
  await survivor.waitForDeployment();
  console.log("Survivor deployed to:", await survivor.getAddress());

  const JungleEngine = await hre.ethers.getContractFactory("JungleEngine");
  const engine = await JungleEngine.deploy(
    await survivor.getAddress(),
    await farmToken.getAddress()
  );
  await engine.waitForDeployment();
  console.log("JungleEngine deployed to:", await engine.getAddress());

  const JungleTreasury = await hre.ethers.getContractFactory("JungleTreasury");
  const treasury = await JungleTreasury.deploy(deployer.address, deployer.address);
  await treasury.waitForDeployment();
  console.log("JungleTreasury deployed to:", await treasury.getAddress());

  const SupplyDepot = await hre.ethers.getContractFactory("SupplyDepot");
  const depot = await SupplyDepot.deploy(deployer.address, await treasury.getAddress());
  await depot.waitForDeployment();
  console.log("SupplyDepot deployed to:", await depot.getAddress());

  const LaunchpadRouter = await hre.ethers.getContractFactory("LaunchpadRouter");
  const router = await LaunchpadRouter.deploy(
    deployer.address,
    await survivor.getAddress(),
    deployer.address,
    hre.ethers.parseEther("0.01")
  );
  await router.waitForDeployment();
  console.log("LaunchpadRouter deployed to:", await router.getAddress());

  let tx = await farmToken.grantRole(await farmToken.MINTER_ROLE(), await engine.getAddress());
  await tx.wait();
  console.log("Granted FarmToken MINTER_ROLE to JungleEngine");

  tx = await survivor.transferOwnership(await engine.getAddress());
  await tx.wait();
  console.log("Transferred Survivor ownership to JungleEngine (so engine can mint)");

  console.log("\nAdd these to your frontend .env / protocol adapter:");
  console.log(`VITE_FARM_TOKEN=${await farmToken.getAddress()}`);
  console.log(`VITE_SURVIVOR_NFT=${await survivor.getAddress()}`);
  console.log(`VITE_JUNGLE_ENGINE=${await engine.getAddress()}`);
  console.log(`VITE_JUNGLE_TREASURY=${await treasury.getAddress()}`);
  console.log(`VITE_SUPPLY_DEPOT=${await depot.getAddress()}`);
  console.log(`VITE_LAUNCHPAD_ROUTER=${await router.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
