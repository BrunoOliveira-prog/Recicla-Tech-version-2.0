import { RequestHandler } from "express";
import { verifyToken, JwtPayload } from "../auth/jwt";

//JWT para autenticar:
declare global {
  namespace Express {
    interface Request {
      userJwt?: JwtPayload;
    }
  }
}

//Autenticação:
export const requireAuth: RequestHandler = (req, res, next) => {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: 'Sem token' });
  try {
    const payload = verifyToken(token);
    req.userJwt = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
