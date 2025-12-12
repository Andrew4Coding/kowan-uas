import { pool } from "../database";
import type { AuthenticatorDevice } from "@simplewebauthn/typescript-types";

export const credentialService = {
    async saveNewCredential(
        userId: string,
        credentialId: string,
        publicKey: string,
        counter: number,
        transports: string,
    ) {
        try {
            await pool.query(
                "INSERT INTO credentials (user_id, credential_id, public_key, counter, transports) VALUES ($1, $2, $3, $4, $5)",
                [userId, credentialId, publicKey, counter, transports],
            );
        } catch (error) {
            console.error("Error saving new credential:", error);
            throw error;
        }
    },

    async getCredentialByCredentialId(
        credentialId: string,
    ): Promise<AuthenticatorDevice | null> {
        try {
            const result = await pool.query(
                "SELECT * FROM credentials WHERE credential_id = $1 LIMIT 1",
                [credentialId],
            );
            if (result.rows.length === 0) return null;
            const row = result.rows[0];
            return {
                userID: row.user_id,
                credentialID: row.credential_id,
                credentialPublicKey: row.public_key,
                counter: row.counter,
                transports: row.transports ? row.transports.split(",") : [],
            } as AuthenticatorDevice;
        } catch (error) {
            console.error("Error retrieving credential:", error);
            throw error;
        }
    },

    async updateCredentialCounter(credentialId: string, newCounter: number) {
        try {
            await pool.query(
                "UPDATE credentials SET counter = $1 WHERE credential_id = $2",
                [newCounter, credentialId],
            );
        } catch (error) {
            console.error("Error updating credential counter:", error);
            throw error;
        }
    },
};
