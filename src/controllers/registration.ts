import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { uint8ArrayToBase64 } from "../utils/utils";
import { rpName, rpID, origin } from "../utils/constants";
import { credentialService } from "../services/credentialService";
import { userService } from "../services/userService";
import { RegistrationResponseJSON } from "@simplewebauthn/typescript-types";
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../middleware/customError";

export const handleRegisterStart = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { username } = req.body;
    console.log("[REGISTER START] Username:", username);

    if (!username) {
        console.log("[REGISTER START] Error: Username empty");
        return next(new CustomError("Username empty", 400));
    }

    try {
        console.log("[REGISTER START] Checking if user exists...");
        let user = await userService.getUserByUsername(username);
        console.log("[REGISTER START] User found:", user);
        if (user) {
            console.log("[REGISTER START] Error: User already exists");
            return next(new CustomError("User already exists", 400));
        } else {
            console.log("[REGISTER START] Creating new user...");
            user = await userService.createUser(username);
            console.log("[REGISTER START] User created:", user);
        }

        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userID: user.id,
            userName: user.username,
            timeout: 60000,
            attestationType: "direct",
            excludeCredentials: [],
            authenticatorSelection: {
                residentKey: "preferred",
            },
            // Support for the two most common algorithms: ES256, and RS256
            supportedAlgorithmIDs: [-7, -257],
        });

        console.log("[REGISTER START] Success, sending options with userId:", user.id);
        res.send(options);
    } catch (error) {
        console.error("[REGISTER START] Error:", error);
        next(
            error instanceof CustomError
                ? error
                : new CustomError("Internal Server Error", 500),
        );
    }
};

export const handleRegisterFinish = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { body } = req;
    const userId = body.userId;
    const currentChallenge = body.challenge;
    console.log("[REGISTER FINISH] Request body - userId:", userId, "challenge:", currentChallenge);

    if (!userId) {
        return next(new CustomError("User ID is missing", 400));
    }

    if (!currentChallenge) {
        return next(new CustomError("Current challenge is missing", 400));
    }

    try {
        const user = await userService.getUserById(userId);
        if (!user) {
            return next(new CustomError("User not found", 404));
        }
        const verification = await verifyRegistrationResponse({
            response: body as RegistrationResponseJSON,
            expectedChallenge: currentChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            requireUserVerification: true,
        });

        if (verification.verified && verification.registrationInfo) {
            const { credentialPublicKey, credentialID, counter } =
                verification.registrationInfo;
            await credentialService.saveNewCredential(
                user.id,
                uint8ArrayToBase64(credentialID),
                uint8ArrayToBase64(credentialPublicKey),
                counter,
                body.response.transports,
            );
            res.send({ verified: true });
        } else {
            next(new CustomError("Verification failed", 400));
        }
    } catch (error) {
        console.error("[REGISTER FINISH] Error:", error);
        next(
            error instanceof CustomError
                ? error
                : new CustomError("Internal Server Error", 500),
        );
    }
};
