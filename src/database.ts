import { Pool } from "pg";

// Create a PostgreSQL pool
console.log("[DATABASE] Connecting with config:", {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "postgres",
    database: process.env.DB_NAME || "webauthn_db",
    port: process.env.DB_PORT || "5433",
});

export const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "my-secret-pw",
    database: process.env.DB_NAME || "webauthn_db",
    port: parseInt(process.env.DB_PORT || "5433"),
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.error("[DATABASE] Connection error:", err);
    } else {
        console.log("[DATABASE] Connected successfully!");
        release();
    }
});
