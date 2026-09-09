import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database;

export function initDB() {
  const dbPath = path.join(process.cwd(), 'jungle.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  createTables();
  return db;
}

export function getDB() {
  if (!db) initDB();
  return db;
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      owner TEXT NOT NULL,
      name TEXT NOT NULL UNIQUE,
      animal TEXT NOT NULL,

      -- Status
      status TEXT DEFAULT 'alive',
      health INTEGER DEFAULT 100,
      hunger INTEGER DEFAULT 100,

      -- Resources
      food INTEGER DEFAULT 50,
      wood INTEGER DEFAULT 30,
      stone INTEGER DEFAULT 20,
      gold INTEGER DEFAULT 0,

      -- Base
      baseLevel INTEGER DEFAULT 1,

      -- Economy
      totalEarned REAL DEFAULT 0,
      lastLaunchTime INTEGER DEFAULT 0,
      launchesToday INTEGER DEFAULT 0,
      treasuryShare REAL DEFAULT 0,

      -- Leaderboard
      dailyVolume REAL DEFAULT 0,
      dailyMarketCap REAL DEFAULT 0,
      weeklyRank INTEGER DEFAULT 999,

      -- Alliance
      allianceId TEXT,

      -- Timestamps
      createdAt INTEGER NOT NULL,
      lastActionAt INTEGER NOT NULL,
      deathAt INTEGER,

      FOREIGN KEY (allianceId) REFERENCES alliances(id)
    );

    CREATE TABLE IF NOT EXISTS launches (
      id TEXT PRIMARY KEY,
      agentId TEXT NOT NULL,
      tokenName TEXT NOT NULL,
      tokenSymbol TEXT NOT NULL,
      initialSupply INTEGER NOT NULL,
      launchpadId TEXT NOT NULL,

      -- Economics
      agentEarned REAL NOT NULL,
      treasuryEarned REAL NOT NULL,
      tradingVolume REAL DEFAULT 0,
      marketCap REAL DEFAULT 0,

      -- Blockchain
      tokenAddress TEXT,
      transactionHash TEXT,

      -- Metadata
      launchedAt INTEGER NOT NULL,

      FOREIGN KEY (agentId) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
      id TEXT PRIMARY KEY,
      timestamp INTEGER NOT NULL,
      data TEXT NOT NULL,

      INDEX idx_timestamp (timestamp)
    );

    CREATE TABLE IF NOT EXISTS alliances (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      createdBy TEXT NOT NULL,
      createdAt INTEGER NOT NULL,

      FOREIGN KEY (createdBy) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS simulation_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_agents_owner ON agents(owner);
    CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
    CREATE INDEX IF NOT EXISTS idx_agents_weeklyRank ON agents(weeklyRank);
    CREATE INDEX IF NOT EXISTS idx_launches_agentId ON launches(agentId);
    CREATE INDEX IF NOT EXISTS idx_launches_launchedAt ON launches(launchedAt);
  `);
}
