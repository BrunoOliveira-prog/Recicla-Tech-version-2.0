import { RequestHandler } from "express";

export const handleGoogleStatus: RequestHandler = (_req, res) => {
  const enabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  res.json({ enabled });
};

export const handleLogin: RequestHandler = (_req, res) => {
  res.status(501).json({ error: "Autenticação ainda não configurada. Conecte o PostgreSQL e configure o OAuth para funcionar o login." });
};

export const handleRegister: RequestHandler = (_req, res) => {
  res.status(501).json({ error: "Registro ainda não configurado. Conecte o PostgreSQL para funcionar." });
};
