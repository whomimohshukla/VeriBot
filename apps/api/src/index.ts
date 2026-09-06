import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import router from "./routes/index.js";

const app: Express = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(express.json());
app.use(helmet());
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(cookieParser(env.cookieSecret));
app.use(
	"/api/v1/auth",
	rateLimit({
		windowMs: 60 * 1000,
		max: 10,
		standardHeaders: true,
		legacyHeaders: false,
	}),
);
app.use("/api/v1", router);

app.listen(PORT, () => {
	console.log(`API server running on port ${PORT}`);
});

export default app;
