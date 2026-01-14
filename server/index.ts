import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import passport, { googleEnabled } from "./auth/google";
import { handleDemo } from "./routes/demo";
import { handleGoogleStatus } from "./routes/auth";
import { api } from "./routes/api";
import { initDb } from "./db";

import 'dotenv/config';

export function createServer() {
  const app = express();

  //Importante para as requisições:
  const corsOrigin = process.env.CORS_ORIGIN || "*";
  app.use(cors({ origin: corsOrigin, credentials: true }));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  //Teste de ping:
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  //Sessões pro OAuth:
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dev-session",
      resave: false,
      saveUninitialized: false,
    }),
  );

  //Passport para o Google OAuth:
  app.use(passport.initialize());
  app.use(passport.session());

  //Iniciar banco de dados:
  initDb().catch((e) => console.error("DB init error", e));

  //Testes:
  app.get("/api/demo", handleDemo);

  //Google status:
  app.get("/api/auth/google/status", handleGoogleStatus);

  //Google OAuth:
  if (googleEnabled) {
    app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/conta/entrar?error=google" }),
      (req: any, res) => {
        const token = req.user?.token;
        const target = `/auth/callback?token=${encodeURIComponent(token || "")}`;
        res.redirect(target);
      },
    );
  }

  //API de requisições:
  app.use("/api", api);

  return app;
}
