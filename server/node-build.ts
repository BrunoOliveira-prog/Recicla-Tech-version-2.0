import path from "path";
import { createServer } from "./index";
import * as express from "express";

const app = createServer();
const port = process.env.PORT || 3000;

const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

app.use(express.static(distPath));

app.use((req, res, next) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return next();
  }
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`O servidor está rodando na porta: ${port}`);
  console.log(`Frontend: http://localhost:${port}`);
  console.log(`API: http://localhost:${port}/api`);
});

process.on("SIGTERM", () => {
  console.log("Parando o ReciclaTech");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Parando o ReciclaTech");
  process.exit(0);
});
