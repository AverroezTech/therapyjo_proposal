import "dotenv/config";
import { PrismaClient, Role, EmploymentStatus } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

// Admin identity/credentials come from the environment, not hardcoded — this
// script now seeds the one real admin account behind a publicly reachable
// login (https://therapyjo.com/login), not a local throwaway. There used to
// be a fallback to a default "admin123" password for local-dev convenience;
// it was removed because a known default password on a live medical clinic's
// admin login is a real exposure, not a convenience. Run this validation
// BEFORE the pg.Pool below is constructed, so a missing var fails instantly
// with a clear message instead of after a Postgres connection timeout.
function requireAdminCredentials(): { username: string; password: string; email: string | null } {
    const username = process.env.ADMIN_USERNAME;
    if (!username) {
        console.error("Seed error: ADMIN_USERNAME is not set. Refusing to seed an admin account without one.");
        process.exit(1);
    }

    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
        console.error("Seed error: ADMIN_PASSWORD is not set. Refusing to seed an admin account without one.");
        process.exit(1);
    }
    if (password === "admin123") {
        console.error(
            'Seed error: ADMIN_PASSWORD is "admin123", the old hardcoded default. Choose a real password — this login is publicly reachable.'
        );
        process.exit(1);
    }

    // ADMIN_EMAIL is optional. User.email is String? in the schema, so null is
    // a valid value — do not synthesise a default address here. A fabricated
    // email on an account that receives password resets is worse than none.
    const email = process.env.ADMIN_EMAIL || null;

    return { username, password, email };
}

const { username: adminUsername, password: adminPassword, email: adminEmail } = requireAdminCredentials();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Seeding database...");

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { username: adminUsername },
    });

    if (existingAdmin) {
        console.log("✅ Admin user already exists, skipping seed.");
        return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await prisma.user.create({
        data: {
            username: adminUsername,
            passwordHash: hashedPassword,
            role: Role.ADMIN,
            name: "Admin",
            email: adminEmail,
            status: EmploymentStatus.ACTIVE,
        },
    });

    // Never print the password, even the one just supplied via env var — this
    // seeds a live medical clinic's admin login, not a local throwaway.
    console.log("✅ Admin user created:");
    console.log(`   Username: ${adminUsername}`);
    console.log(`   Email: ${adminEmail ? "set" : "not set"}`);

    console.log("\n🌱 Seed complete!");
}

main()
    .catch((e) => {
        console.error("Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
