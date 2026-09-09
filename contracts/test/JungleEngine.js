const { expect } = require("chai");
const hre = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const CATEGORIES = ["MEME", "AI", "GAMING"];

async function deployFixture() {
  const [owner, other] = await hre.ethers.getSigners();

  const FarmToken = await hre.ethers.getContractFactory("FarmToken");
  const farmToken = await FarmToken.deploy(owner.address);
  await farmToken.waitForDeployment();

  const Survivor = await hre.ethers.getContractFactory("Survivor");
  const survivor = await Survivor.deploy(owner.address, "https://example.com/meta/");
  await survivor.waitForDeployment();

  const JungleEngine = await hre.ethers.getContractFactory("JungleEngine");
  const engine = await JungleEngine.deploy(
    await survivor.getAddress(),
    await farmToken.getAddress()
  );
  await engine.waitForDeployment();

  await (await farmToken.grantRole(await farmToken.MINTER_ROLE(), await engine.getAddress())).wait();

  return { owner, other, farmToken, survivor, engine };
}

describe("Farming Agents protocol", () => {
  describe("FarmToken", () => {
    it("mints initial supply to deployer", async () => {
      const { owner, farmToken } = await deployFixture();
      expect(await farmToken.balanceOf(owner.address)).to.equal(hre.ethers.parseUnits("1000000000", 18));
    });
  });

  describe("Survivor", () => {
    it("forges a survivor with valid traits", async () => {
      const { owner, survivor } = await deployFixture();
      const tx = await survivor.forge("NIGHTFANG", "panther", CATEGORIES, "STANDARD", "PONS");
      await tx.wait();

      expect(await survivor.ownerOf(0)).to.equal(owner.address);
      const t = await survivor.getTraits(0);
      expect(t.name).to.equal("NIGHTFANG");
      expect(t.animal).to.equal("panther");
      expect(t.speedTier).to.equal("STANDARD");
      expect(t.launchpad).to.equal("PONS");
      expect(t.categories).to.deep.equal(CATEGORIES);
    });

    it("rejects invalid names", async () => {
      const { survivor } = await deployFixture();
      await expect(survivor.forge("AB", "panther", CATEGORIES, "STANDARD", "PONS")).to.be.revertedWith("SURVIVOR: name length");
      await expect(survivor.forge("A".repeat(25), "panther", CATEGORIES, "STANDARD", "PONS")).to.be.revertedWith("SURVIVOR: name length");
      await expect(survivor.forge("NIGHT-FANG", "panther", CATEGORIES, "STANDARD", "PONS")).to.be.revertedWith("SURVIVOR: invalid name char");
    });

    it("rejects bad category counts", async () => {
      const { survivor } = await deployFixture();
      await expect(survivor.forge("NIGHTFANG", "panther", [], "STANDARD", "PONS")).to.be.revertedWith("SURVIVOR: categories count");
      await expect(survivor.forge("NIGHTFANG", "panther", ["A", "B", "C", "D"], "STANDARD", "PONS")).to.be.revertedWith("SURVIVOR: categories count");
    });
  });

  describe("JungleEngine", () => {
    it("hunt → ripen → harvest rewards $FARM", async () => {
      const { owner, survivor, engine, farmToken } = await deployFixture();
      await (await survivor.forge("NIGHTFANG", "panther", CATEGORIES, "STANDARD", "PONS")).wait();

      await (await engine.hunt(0, "MEME", "$ROAR")).wait();
      let f = await engine.farmers(0);
      expect(f.status).to.equal(1); // Growing
      expect(f.targetTicker).to.equal("$ROAR");

      await time.increaseTo(f.readyAt + 1n);
      await (await engine.ripen(0)).wait();
      f = await engine.farmers(0);
      expect(f.status).to.equal(2); // Ripe

      const before = await farmToken.balanceOf(owner.address);
      await (await engine.harvest(0)).wait();
      const after = await farmToken.balanceOf(owner.address);
      expect(after - before).to.equal(hre.ethers.parseUnits("100", 18));

      f = await engine.farmers(0);
      expect(f.status).to.equal(3); // Cooldown
      expect(f.harvests).to.equal(1);
    });

    it("uses speed tiers for growth duration", async () => {
      const { survivor, engine } = await deployFixture();
      await (await survivor.forge("SLOWCAT", "tiger", ["MEME"], "SLOW", "PONS")).wait();
      await (await survivor.forge("SWIFTCAT", "tiger", ["MEME"], "SWIFT", "PONS")).wait();

      const slowTx = await engine.hunt(0, "MEME", "$ROAR");
      const slowReceipt = await slowTx.wait();
      const slowBlockTime = (await hre.ethers.provider.getBlock(slowReceipt.blockNumber)).timestamp;
      const slowFarmer = await engine.farmers(0);
      expect(slowFarmer.readyAt - BigInt(slowBlockTime)).to.equal(8n * 60n * 60n);

      const swiftTx = await engine.hunt(1, "MEME", "$ROAR");
      const swiftReceipt = await swiftTx.wait();
      const swiftBlockTime = (await hre.ethers.provider.getBlock(swiftReceipt.blockNumber)).timestamp;
      const swiftFarmer = await engine.farmers(1);
      expect(swiftFarmer.readyAt - BigInt(swiftBlockTime)).to.equal(2n * 60n * 60n);
    });

    it("only owner can hunt or harvest", async () => {
      const { other, survivor, engine } = await deployFixture();
      await (await survivor.forge("NIGHTFANG", "panther", CATEGORIES, "STANDARD", "PONS")).wait();
      await expect(engine.connect(other).hunt(0, "MEME", "$ROAR")).to.be.revertedWith("ENGINE: not owner");
    });
  });
});

describe("JungleTreasury", () => {
  async function treasuryFixture() {
    const [owner, keeper, user, winner] = await hre.ethers.getSigners();
    const Treasury = await hre.ethers.getContractFactory("JungleTreasury");
    const treasury = await Treasury.deploy(owner.address, keeper.address);
    await treasury.waitForDeployment();
    return { owner, keeper, user, winner, treasury };
  }

  it("accepts contributions into the current epoch pool", async () => {
    const { user, treasury } = await loadFixture(treasuryFixture);
    await expect(treasury.connect(user).contribute({ value: hre.ethers.parseEther("1.5") }))
      .to.emit(treasury, "Contributed")
      .withArgs(1, user.address, hre.ethers.parseEther("1.5"));
    expect(await treasury.currentPool()).to.equal(hre.ethers.parseEther("1.5"));
  });

  it("settles a 24-hour epoch and pays the winner", async () => {
    const { keeper, winner, treasury } = await loadFixture(treasuryFixture);
    await treasury.contribute({ value: hre.ethers.parseEther("10") });

    const before = await hre.ethers.provider.getBalance(winner.address);
    await time.increase(24 * 60 * 60 + 1);
    await expect(treasury.connect(keeper).settleEpoch(winner.address, hre.ethers.parseEther("100000")))
      .to.emit(treasury, "EpochSettled")
      .withArgs(1, winner.address, hre.ethers.parseEther("8.5"), hre.ethers.parseEther("1"), hre.ethers.parseEther("0.5"), 0n, hre.ethers.parseEther("100000"));
    const after = await hre.ethers.provider.getBalance(winner.address);

    expect(after - before).to.equal(hre.ethers.parseEther("8.5"));
    expect(await treasury.currentPool()).to.equal(0);
    expect(await treasury.totalSettled()).to.equal(hre.ethers.parseEther("10"));
  });

  it("rejects early settlement", async () => {
    const { keeper, winner, treasury } = await loadFixture(treasuryFixture);
    await treasury.contribute({ value: hre.ethers.parseEther("1") });
    await expect(treasury.connect(keeper).settleEpoch(winner.address, 0)).to.be.revertedWith("TREASURY: epoch active");
  });

  it("flags final hunt in last ten minutes", async () => {
    const { treasury } = await loadFixture(treasuryFixture);
    expect(await treasury.isFinalHunt()).to.equal(false);
    await time.increase(23 * 60 * 60 + 55 * 60);
    expect(await treasury.isFinalHunt()).to.equal(true);
  });
});

describe("SupplyDepot", () => {
  async function depotFixture() {
    const [owner, keeper, user] = await hre.ethers.getSigners();
    const Treasury = await hre.ethers.getContractFactory("JungleTreasury");
    const treasury = await Treasury.deploy(owner.address, keeper.address);
    await treasury.waitForDeployment();

    const Depot = await hre.ethers.getContractFactory("SupplyDepot");
    const depot = await Depot.deploy(owner.address, await treasury.getAddress());
    await depot.waitForDeployment();

    const Survivor = await hre.ethers.getContractFactory("Survivor");
    const survivor = await Survivor.deploy(owner.address, "");
    await survivor.waitForDeployment();

    return { owner, keeper, user, treasury, depot, survivor };
  }

  it("sells an item and splits payment", async () => {
    const { user, treasury, depot, survivor } = await loadFixture(depotFixture);
    await (await depot.addItem("Machete", 0, hre.ethers.parseEther("1"), 5_000, false, true)).wait();
    await (await survivor.forge("SLASHER", "tiger", ["MEME"], "STANDARD", "PONS")).wait();

    await expect(depot.connect(user).purchase(0, 0, { value: hre.ethers.parseEther("1") }))
      .to.emit(depot, "Purchased")
      .withArgs(0, 0, hre.ethers.parseEther("0.5"), hre.ethers.parseEther("0.2"));

    expect(await depot.survivorOwns(0, 0)).to.equal(true);
    expect(await treasury.currentPool()).to.equal(hre.ethers.parseEther("0.5"));
  });

  it("rejects purchases with wrong value", async () => {
    const { user, depot, survivor } = await loadFixture(depotFixture);
    await depot.addItem("Tarp", 2, hre.ethers.parseEther("0.5"), 2_000, false, true);
    await (await survivor.forge("SLASHER", "tiger", ["MEME"], "STANDARD", "PONS")).wait();
    await expect(depot.connect(user).purchase(0, 0, { value: hre.ethers.parseEther("0.49") }))
      .to.be.revertedWith("DEPOT: wrong value");
  });
});

describe("LaunchpadRouter", () => {
  async function routerFixture() {
    const [owner, keeper, user] = await hre.ethers.getSigners();
    const Survivor = await hre.ethers.getContractFactory("Survivor");
    const survivor = await Survivor.deploy(owner.address, "");
    await survivor.waitForDeployment();

    const Router = await hre.ethers.getContractFactory("LaunchpadRouter");
    const router = await Router.deploy(owner.address, await survivor.getAddress(), keeper.address, hre.ethers.parseEther("0.01"));
    await router.waitForDeployment();

    return { owner, keeper, user, survivor, router };
  }

  it("registers a launch request with fee", async () => {
    const { user, survivor, router } = await loadFixture(routerFixture);
    await (await survivor.connect(user).forge("LAUNCHER", "panther", ["MEME"], "STANDARD", "PONS")).wait();

    await expect(
      router.connect(user).requestLaunch(0, 3, "$JUNGLE", hre.ethers.parseEther("1000000"), "ipfs://meta", { value: hre.ethers.parseEther("0.01") })
    )
      .to.emit(router, "LaunchRequested")
      .withArgs(0, 0, 3, "$JUNGLE", hre.ethers.parseEther("1000000"), user.address);

    const l = await router.launches(0);
    expect(l.tokenId).to.equal(0);
    expect(l.launched).to.equal(false);
  });

  it("only keeper can fulfill a launch", async () => {
    const { owner, keeper, user, survivor, router } = await loadFixture(routerFixture);
    await (await survivor.connect(user).forge("LAUNCHER", "panther", ["MEME"], "STANDARD", "PONS")).wait();
    await router.connect(user).requestLaunch(0, 3, "$JUNGLE", hre.ethers.parseEther("1000000"), "ipfs://meta", { value: hre.ethers.parseEther("0.01") });

    const mockToken = hre.ethers.Wallet.createRandom().address;
    const txHash = hre.ethers.keccak256("0x1234");
    await expect(router.connect(keeper).fulfillLaunch(0, mockToken, txHash))
      .to.emit(router, "LaunchFulfilled")
      .withArgs(0, mockToken, txHash);
    expect((await router.launches(0)).launched).to.equal(true);
    await expect(router.connect(owner).fulfillLaunch(0, mockToken, txHash)).to.be.revertedWith("ROUTER: not keeper");
  });
});
