import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { pool } from "../db";
import { signToken } from "./jwt";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback";
export const googleEnabled = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);

//Autentica o usuário e salva ele na sessão:
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: number, done) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, role FROM users WHERE id=$1', [id]);
    done(null, rows[0]);
  } catch (e) { done(e as any); }
});

if (googleEnabled) {
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: GOOGLE_CALLBACK_URL,
}, async (_accessToken: string, _refreshToken: string, profile: Profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName || 'Usuário Google';
    const googleId = profile.id;
    if (!email) return done(new Error('Google sem email'));

    const existing = await pool.query('SELECT id, role, email, name FROM users WHERE google_id=$1 OR email=$2', [googleId, email]);
    let user = existing.rows[0];
    if (!user) {
      const role: 'RECICLADOR' = 'RECICLADOR';
      const ins = await pool.query('INSERT INTO users(name,email,role,google_id) VALUES($1,$2,$3,$4) RETURNING id, name, email, role', [name, email, role, googleId]);
      user = ins.rows[0];
    } else if (!existing.rows[0].google_id) {
      await pool.query('UPDATE users SET google_id=$1 WHERE id=$2', [googleId, existing.rows[0].id]);
    }
    const token = signToken({ uid: user.id, role: user.role, email: user.email, name: user.name });
    return done(null, { ...user, token });
  } catch (e) {
    done(e as any);
  }
}));
}

export default passport;
