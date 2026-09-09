/** Minimal ABIs — must stay in sync with contracts/contracts/*.sol */

export const survivorAbi = [
  {
    type: "function",
    name: "forge",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "animal", type: "string" },
      { name: "categories", type: "string[]" },
      { name: "speedTier", type: "string" },
      { name: "launchpad", type: "string" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "tokenOfOwnerByIndex",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "getTraits",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "name", type: "string" },
          { name: "animal", type: "string" },
          { name: "mintedAt", type: "uint256" },
          { name: "categories", type: "string[]" },
          { name: "speedTier", type: "string" },
          { name: "launchpad", type: "string" },
        ],
      },
    ],
  },
  {
    type: "event",
    name: "Forged",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "animal", type: "string", indexed: false },
      { name: "categories", type: "string[]", indexed: false },
      { name: "speedTier", type: "string", indexed: false },
      { name: "launchpad", type: "string", indexed: false },
    ],
  },
] as const;

export const farmTokenAbi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
] as const;

export const treasuryAbi = [
  {
    type: "function",
    name: "currentEpoch",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "currentPool",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "currentEpochStartedAt",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "currentEpochEnd",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "remainingSeconds",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "isFinalHunt",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "protocolBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "adminBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "rolloverBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

export const depotAbi = [
  {
    type: "function",
    name: "items",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "name", type: "string" },
      { name: "category", type: "uint8" },
      { name: "price", type: "uint256" },
      { name: "treasuryBps", type: "uint256" },
      { name: "cosmetic", type: "bool" },
      { name: "utility", type: "bool" },
      { name: "active", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "purchase",
    stateMutability: "payable",
    inputs: [
      { name: "survivorTokenId", type: "uint256" },
      { name: "itemId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "survivorOwns",
    stateMutability: "view",
    inputs: [
      { name: "survivorTokenId", type: "uint256" },
      { name: "itemId", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;
