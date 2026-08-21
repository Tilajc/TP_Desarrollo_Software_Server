import express from "express";
import router from "./routes/index.js";

const app = express();
app.use(express.json());
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Server is running on background");
});

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});

app.use("/api", router);
