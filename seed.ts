import 'dotenv/config';
import { pool, initDb } from "./server/db";
import bcrypt from "bcryptjs";

async function seed() {
    console.log("Seeding database...");

    try {
        // Initialize DB schema
        await initDb();
        console.log("Database schema initialized.");
        // Hash password "123456"
        const hash = await bcrypt.hash("123456", 10);

        // Create Coletor Bruno
        const brunoEmail = "bruno@teste.com";
        const brunoCheck = await pool.query("SELECT id FROM users WHERE email=$1", [brunoEmail]);
        if (brunoCheck.rowCount === 0) {
            await pool.query(
                "INSERT INTO users(name, email, password_hash, role) VALUES($1, $2, $3, $4)",
                ["Bruno", brunoEmail, hash, "COLETOR"]
            );
            console.log("Created Coletor: Bruno (bruno@teste.com / 123456)");
        } else {
            console.log("User Bruno already exists");
        }

        // Create Reciclador Pedro
        const pedroEmail = "pedro@teste.com";
        const pedroCheck = await pool.query("SELECT id FROM users WHERE email=$1", [pedroEmail]);
        if (pedroCheck.rowCount === 0) {
            await pool.query(
                "INSERT INTO users(name, email, password_hash, role) VALUES($1, $2, $3, $4)",
                ["Pedro", pedroEmail, hash, "RECICLADOR"]
            );
            console.log("Created Reciclador: Pedro (pedro@teste.com / 123456)");
        } else {
            console.log("User Pedro already exists");
        }

        console.log("Seeding complete!");
    } catch (e) {
        console.error("Error seeding database:", e);
    } finally {
        await pool.end();
    }
}

seed();
