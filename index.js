import express from "express";
import router from "./routes/index.js";
import cors from "cors";

const app = express();

const PORT = 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running on background");
});

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});

app.use("/api", router);
