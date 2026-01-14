import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

//Estrutura do JWT:
export interface JwtPayload {
  uid: number;
  role: 'RECICLADOR' | 'COLETOR';
  email: string;
  name: string;
}

//Gerar o Token JWT:
export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

//Verificar o Token JWT:
export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
