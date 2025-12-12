import { pool } from "../database";
import { v4 as uuidv4 } from "uuid";

export const userService = {
    async getUserById(userId: string) {
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [
            userId,
        ]);
        return result.rows[0];
    },

    async getUserByUsername(username: string) {
        try {
            console.log("[USER SERVICE] getUserByUsername -", username);
            const result = await pool.query(
                "SELECT * FROM users WHERE username = $1",
                [username],
            );
            console.log("[USER SERVICE] Query result:", result.rows);
            return result.rows[0];
        } catch (error) {
            console.error("[USER SERVICE] Error in getUserByUsername:", error);
            return null;
        }
    },

    async createUser(username: string) {
        try {
            const id = uuidv4();
            console.log("[USER SERVICE] Creating user with id:", id, "username:", username);
            await pool.query("INSERT INTO users (id, username) VALUES ($1, $2)", [
                id,
                username,
            ]);
            console.log("[USER SERVICE] User created successfully");
            return { id, username };
        } catch (error) {
            console.error("[USER SERVICE] Error creating user:", error);
            throw error;
        }
    },
};
