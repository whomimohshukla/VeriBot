import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import {
	authRateLimiter,
	loginRateLimiter,
	registerRateLimiter,
	resetRateLimiter,
	verificationRateLimiter,
} from "./lib/rate-limit.js";
import router from "./routes/index.js";

const app: Express = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(express.json());
app.use(helmet());
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(cookieParser(env.cookieSecret));
app.use("/api/v1/auth", authRateLimiter);
app.use("/api/v1/auth/register", registerRateLimiter);
app.use("/api/v1/auth/login", loginRateLimiter);
app.use("/api/v1/auth/password-reset", resetRateLimiter);
app.use("/api/v1/auth/password-reset/request", resetRateLimiter);
app.use("/api/v1/auth/verify-email", verificationRateLimiter);
app.use("/api/v1", router);

app.listen(PORT, () => {
	console.log(`API server running on port ${PORT}`);
});

export default app;
