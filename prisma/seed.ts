import "dotenv/config";
import { PrismaClient, Role, EmploymentStatus } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

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
        where: { username: "admin" },
    });

    if (existingAdmin) {
        console.log("✅ Admin user already exists, skipping seed.");
        return;
    }

    // Create default admin — override with ADMIN_PASSWORD env var for anything beyond local dev
    const seedPassword = process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await bcrypt.hash(seedPassword, 12);

    await prisma.user.create({
        data: {
            username: "admin",
            passwordHash: hashedPassword,
            role: Role.ADMIN,
            name: "Admin",
            email: "admin@therapyjo.com",
            status: EmploymentStatus.ACTIVE,
        },
    });

    console.log("✅ Admin user created:");
    console.log("   Username: admin");
    if (process.env.ADMIN_PASSWORD) {
        console.log("   Password: (from ADMIN_PASSWORD env var)");
    } else {
        console.log("   Password: admin123");
        console.log("   ⚠️  This is the default password. Set ADMIN_PASSWORD before seeding production, or change it after first login!");
    }

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
