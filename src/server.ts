import express, { Express } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import config from "../config.json";
import { router as passkeyRoutes } from "./routes/routes";
import session from "express-session";

const app: Express = express();

declare module "express-session" {
    interface SessionData {
        currentChallenge?: string;
        loggedInUserId?: string;
    }
}


app.set("json spaces", 4);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "secret123-change-in-production",
        saveUninitialized: true,
        resave: false,
        cookie: {
            maxAge: 86400000,
            httpOnly: true,
        },
    }),
);

if (process.env.NODE_ENV === "development" || config.NODE_ENV === "development") {
    app.use(morgan("dev"));
    app.use(cors());
}

if (process.env.NODE_ENV === "production" || config.NODE_ENV === "production") {
    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: [
                        "'self'",
                        "https://unpkg.com",
                        "'unsafe-inline'"
                    ],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'"],
                    fontSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"],
                },
            },
        }),
    );
}

app.use("/api/passkey", passkeyRoutes);

app.use(express.static("src/public"));

export default app;
