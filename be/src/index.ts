import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8100",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Better Auth handler
app.use("/api/auth", toNodeHandler(auth));

// Healthcheck endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Example protected route
app.get("/api/protected", async (req, res) => {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    res.json({ message: "Hello from protected route!", user: session.user });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});
