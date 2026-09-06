import express, { type Express } from "express";
import router from "./routes/index.js";

const app: Express = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(express.json());
app.use("/api/v1", router);

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

export default app;
