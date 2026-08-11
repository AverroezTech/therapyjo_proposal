// Demo/mock data seed — NOT part of the production `db:seed` flow.
// Run manually with: npx tsx prisma/seed-demo.ts
// Populates realistic-looking sample data across every admin screen and
// public page so the UI can be reviewed end-to-end. Safe to re-run: it
// skips sections that already have data.

import "dotenv/config";
import { PrismaClient, Role, EmploymentStatus, SessionStatus, PaymentType, PostStatus, PostLang, ChangeField, ChangeStatus } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL!, ssl: { rejectUnauthorized: false } });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function slugify(input: string): string {
    return input.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "post";
}

async function main() {
    console.log("Seeding demo data...");

    // ── Employees ──────────────────────────────────────────
    const doctorSeeds = [
        { username: "noor", name: "Noor Hamami", email: "noor@therapyjo.com", phone: "0791234501", workingHours: "9:00 AM – 5:00 PM", color: "#6ee7b7" },
        { username: "ahmad", name: "Ahmad Khalil", email: "ahmad@therapyjo.com", phone: "0791234502", workingHours: "10:00 AM – 6:00 PM", color: "#93c5fd" },
        { username: "layla", name: "Layla Mansour", email: "layla@therapyjo.com", phone: "0791234503", workingHours: "9:00 AM – 3:00 PM", color: "#f472b6" },
    ];
    const doctorPass = await bcrypt.hash("doctor123", 12);
    const doctors: Record<string, string> = {};
    for (const d of doctorSeeds) {
        const user = await prisma.user.upsert({
            where: { username: d.username },
            update: {},
            create: { ...d, username: d.username, passwordHash: doctorPass, role: Role.DOCTOR, status: EmploymentStatus.ACTIVE },
        });
        doctors[d.username] = user.id;
    }

    const secretaryPass = await bcrypt.hash("secretary123", 12);
    await prisma.user.upsert({
        where: { username: "rana" },
        update: {},
        create: { username: "rana", name: "Rana Odeh", email: "rana@therapyjo.com", phone: "0791234510", passwordHash: secretaryPass, role: Role.SECRETARY, status: EmploymentStatus.ACTIVE },
    });

    console.log(`✓ Employees: 3 doctors, 1 secretary (password: doctor123 / secretary123)`);

    // ── Patients ───────────────────────────────────────────
    const patientCount = await prisma.patient.count();
    let patientIds: number[] = [];
    if (patientCount === 0) {
        const patientNames = [
            "Yousef Abdallah", "Rania Saleh", "Omar Tarawneh", "Dina Qassem", "Khalid Nassar",
            "Hala Freihat", "Bassam Odeh", "Maya Kurdi", "Fadi Haddad", "Salma Barakat",
            "Ziad Qutaish", "Nour Sami", "Tariq Awad", "Lina Rousan", "Ibrahim Zoubi",
        ];
        const created = await Promise.all(
            patientNames.map((name, i) =>
                prisma.patient.create({
                    data: {
                        name,
                        phone1: `07${9 + (i % 10)}${String(1000000 + i * 37).slice(0, 7)}`,
                        phone2: i % 4 === 0 ? `07${8}${String(2000000 + i * 51).slice(0, 7)}` : null,
                        archived: i === patientNames.length - 1,
                        lastVisitDate: new Date(Date.now() - i * 86400000 * 3),
                    },
                })
            )
        );
        patientIds = created.map((p) => p.id);
        console.log(`✓ Patients: ${created.length}`);
    } else {
        const existing = await prisma.patient.findMany({ select: { id: true }, take: 15 });
        patientIds = existing.map((p) => p.id);
        console.log(`✓ Patients: already have ${patientCount}, reusing existing`);
    }

    // ── Reservations ───────────────────────────────────────
    const reservationCount = await prisma.reservation.count();
    if (reservationCount === 0 && patientIds.length > 0) {
        const doctorIds = Object.values(doctors);
        const today = new Date();
        const dateStr = (offsetDays: number) => {
            const d = new Date(today);
            d.setDate(d.getDate() + offsetDays);
            return d.toISOString().split("T")[0];
        };
        const times = ["09:00", "10:00", "11:00", "13:00", "14:30", "16:00"];
        const statuses: (keyof typeof SessionStatus)[] = ["CHECKED_OUT", "CHECKED_OUT", "WITH_DOCTOR", "CHECKED_IN", "WAITING", "SCHEDULED"];

        let created = 0;
        for (const offset of [-2, -1, 0, 1, 2]) {
            const ds = dateStr(offset);
            for (let i = 0; i < times.length; i++) {
                const patientId = patientIds[(created * 3) % patientIds.length];
                const doctorId = doctorIds[created % doctorIds.length];
                const status = offset < 0 ? "CHECKED_OUT" : offset === 0 ? statuses[i] : "SCHEDULED";
                await prisma.reservation.create({
                    data: {
                        patientId,
                        doctorId,
                        sessionDate: new Date(ds),
                        sessionTime: new Date(`${ds}T${times[i]}`),
                        status: status as SessionStatus,
                        paymentType: i % 2 === 0 ? PaymentType.CASH : PaymentType.INSURANCE,
                        note: i === 0 ? "Follow-up on lower back program" : null,
                        showNoteOnCalendar: i === 0,
                    },
                });
                created++;
            }
        }
        console.log(`✓ Reservations: ${created}`);
    } else {
        console.log(`✓ Reservations: already have ${reservationCount}, skipping`);
    }

    // ── Notes ──────────────────────────────────────────────
    const noteCount = await prisma.note.count();
    if (noteCount === 0) {
        const doctorIds = Object.values(doctors);
        await prisma.note.createMany({
            data: [
                { name: "Clinic closed for Eid", noteDate: new Date(), doctorId: doctorIds[0], details: "Clinic closed for the public holiday, resuming next week.", doctorCheckNote: true },
                { name: "New Hawkgrips unit arrived", noteDate: new Date(), doctorId: doctorIds[1], details: "Second Hawkgrips unit is now available in Room 2.", doctorCheckNote: false },
                { name: "Reminder: update patient intake forms", noteDate: new Date(Date.now() - 86400000), doctorId: doctorIds[2], details: "Please use the revised intake form for all new patients this month.", doctorCheckNote: true },
            ],
        });
        console.log("✓ Notes: 3");
    } else {
        console.log(`✓ Notes: already have ${noteCount}, skipping`);
    }

    // ── Blog posts ─────────────────────────────────────────
    // Remove any leftover manual test posts before seeding the demo set
    await prisma.pendingChange.deleteMany({});
    await prisma.blogPost.deleteMany({});

    type SeedPost = { category: string; title: string; body: string; status: PostStatus; daysAgo?: number; daysAhead?: number };
    const posts: SeedPost[] = [
        {
            category: "Recovery Tips",
            title: "5 Stretches to Ease Lower Back Pain at Home",
            status: PostStatus.PUBLISHED,
            daysAgo: 5,
            body: "Lower back pain often comes from tight hip flexors, hamstrings, and a weak core rather than the back itself. A few minutes of daily stretching can relieve pressure on the spine and improve how you move throughout the day.\n\nTry a supine knee-to-chest hold, a seated spinal twist, a cat-cow flow, a child's pose, and a gentle hamstring stretch against a wall. Hold each position for 20 to 30 seconds and breathe slowly.\n\nThese stretches are a starting point, not a diagnosis. If pain persists beyond a few days or radiates down your leg, book a session so we can assess what's actually going on.",
        },
        {
            category: "Rehabilitation",
            title: "Understanding Post-Surgery Rehabilitation: What to Expect",
            status: PostStatus.PUBLISHED,
            daysAgo: 19,
            body: "Surgery repairs the structure; rehabilitation restores the function. The first weeks after an operation focus on protecting the healing tissue while keeping nearby joints and muscles from stiffening up.\n\nA typical plan moves through phases: gentle range-of-motion work, then progressive strengthening, then a return to normal activity or sport. Your therapist adjusts the pace based on how your body responds, not a fixed calendar.\n\nConsistency matters more than intensity early on. Missing sessions or pushing too hard both slow recovery down — the goal is steady, measurable progress.",
        },
        {
            category: "Treatments",
            title: "Dry Needling vs. Acupuncture: What's the Difference?",
            status: PostStatus.PUBLISHED,
            daysAgo: 33,
            body: "Both use thin, sterile needles inserted into the skin, which is where the similarity mostly ends. Acupuncture is rooted in traditional Chinese medicine and targets meridian points to balance the body's energy.\n\nDry needling is a modern technique grounded in Western anatomy. It targets myofascial trigger points — tight knots in muscle — to release tension and reduce referred pain.\n\nWhich one helps depends on what you're treating. During an assessment, we'll tell you which technique fits your condition, or whether another approach is a better fit altogether.",
        },
        {
            category: "Sports",
            title: "How Sports Physiotherapy Speeds Up Recovery",
            status: PostStatus.SCHEDULED,
            daysAhead: 6,
            body: "Athletes who work with a physiotherapist before an injury tend to recover faster after one. Baseline strength and mobility data make it easier to spot what's changed and target treatment precisely.\n\nSports rehab programs combine manual therapy with sport-specific movement retraining, so recovery doesn't stop at 'pain-free' — it continues until the athlete can cut, jump, or lift with full confidence.\n\nReturning too early is the most common setback we see. A structured program includes clear benchmarks for return to play, not just a date on the calendar.",
        },
        {
            category: "Women's Health",
            title: "Pelvic Floor Health: Why It Matters at Every Age",
            status: PostStatus.DRAFT,
            body: "Pelvic floor therapy is best known for postpartum recovery, but the muscles involved support bladder control, core stability, and posture for everyone, at every stage of life.\n\nAthletes, people recovering from abdominal or pelvic surgery, and anyone dealing with chronic lower back pain can all benefit from an assessment, regardless of age or gender.\n\nSessions are private, gradual, and led by a specialist trained specifically in pelvic floor rehabilitation. There's nothing to be uncomfortable about in asking for an evaluation.",
        },
        {
            category: "Guidance",
            title: "When Should You See a Physiotherapist?",
            status: PostStatus.ARCHIVED,
            daysAgo: 90,
            body: "Many people wait for pain to become unbearable before booking an appointment. Earlier is almost always better — small movement issues are easier to correct before they turn into compensations elsewhere.\n\nCommon signs it's time to come in: pain that lasts more than a few days, stiffness that limits daily movement, a recent injury, or reduced strength on one side of the body.\n\nA first visit is really just a conversation and an assessment. We'll tell you honestly whether physiotherapy is the right next step for what you're experiencing.",
        },
    ];

    const arTranslations: Record<string, { title: string; body: string }> = {
        "5 Stretches to Ease Lower Back Pain at Home": {
            title: "5 تمارين إطالة لتخفيف آلام أسفل الظهر في المنزل",
            body: "غالباً ما ينتج ألم أسفل الظهر عن تيبس عضلات مقدمة الفخذ وأوتار الركبة وضعف عضلات الجذع أكثر من كونه مشكلة في الظهر نفسه. بضع دقائق من التمدد اليومي يمكن أن تخفف الضغط عن العمود الفقري وتحسّن طريقة حركتك خلال اليوم.\n\nجرّب سحب الركبة نحو الصدر أثناء الاستلقاء، والالتفاف الجالس للعمود الفقري، وحركة القط والبقرة، ووضعية الطفل، وتمديد وتر الركبة بلطف مقابل الحائط. حافظ على كل وضعية لمدة 20 إلى 30 ثانية مع التنفس ببطء.\n\nهذه التمارين نقطة انطلاق وليست تشخيصاً. إذا استمر الألم لأكثر من بضعة أيام أو امتد إلى الساق، احجز جلسة لنقيّم ما يحدث فعلياً.",
        },
        "Understanding Post-Surgery Rehabilitation: What to Expect": {
            title: "فهم التأهيل بعد الجراحة: ماذا تتوقع",
            body: "الجراحة تُصلح التركيب، والتأهيل يُعيد الوظيفة. تركّز الأسابيع الأولى بعد العملية على حماية الأنسجة أثناء شفائها مع منع المفاصل والعضلات المجاورة من التيبس.\n\nتمر الخطة النموذجية بمراحل: عمل لطيف على مدى الحركة، ثم تقوية تدريجية، ثم عودة للنشاط الطبيعي أو الرياضي. يُعدّل المعالج الوتيرة حسب استجابة جسمك، وليس وفق جدول زمني ثابت.\n\nالانتظام أهم من الشدة في البداية. تفويت الجلسات أو المبالغة في الجهد يبطئان التعافي — الهدف هو تقدّم ثابت وقابل للقياس.",
        },
    };

    for (const p of posts) {
        const publishedAt = p.daysAgo ? new Date(Date.now() - p.daysAgo * 86400000) : p.status === PostStatus.PUBLISHED ? new Date() : null;
        const publishAt = p.daysAhead ? new Date(Date.now() + p.daysAhead * 86400000) : null;

        const post = await prisma.blogPost.create({
            data: {
                title: p.title,
                slug: slugify(p.title),
                lang: PostLang.EN,
                category: p.category,
                body: p.body,
                status: p.status,
                publishedAt,
                publishAt,
            },
        });

        const ar = arTranslations[p.title];
        if (ar) {
            const arPost = await prisma.blogPost.create({
                data: {
                    title: ar.title,
                    slug: slugify(ar.title),
                    lang: PostLang.AR,
                    category: p.category,
                    body: ar.body,
                    status: p.status,
                    publishedAt,
                    publishAt,
                    linkedId: post.id,
                },
            });
            await prisma.blogPost.update({ where: { id: post.id }, data: { linkedId: arPost.id } });
        }
    }
    console.log(`✓ Blog posts: ${posts.length} EN (+ ${Object.keys(arTranslations).length} AR translations)`);

    // ── Doctor profiles (public site) ───────────────────────
    const profileCount = await prisma.doctorProfile.count();
    if (profileCount === 0) {
        const noor = await prisma.doctorProfile.create({
            data: {
                userId: doctors["noor"],
                name: "Noor Hamami",
                title: "Head Physiotherapist",
                specialty: "Manual Therapy & Sports Rehab",
                bio: "Noor leads the clinic's clinical program with a focus on manual therapy and sports rehabilitation, drawing on over a decade of hands-on experience.",
                contact: "noor@therapyjo.com",
                photo: "/noor_hamami_head_doctor.jpg",
                order: 1,
            },
        });
        const ahmad = await prisma.doctorProfile.create({
            data: {
                userId: doctors["ahmad"],
                name: "Ahmad Khalil",
                title: "Physiotherapist",
                specialty: "Sports Rehabilitation",
                bio: "Ahmad works primarily with athletes recovering from ligament and tendon injuries, building return-to-play programs around clear benchmarks.",
                contact: "ahmad@therapyjo.com",
                photo: null,
                order: 2,
            },
        });
        const layla = await prisma.doctorProfile.create({
            data: {
                userId: doctors["layla"],
                name: "Layla Mansour",
                title: "Physiotherapist",
                specialty: "Pediatric Physical Therapy",
                bio: "Layla specializes in gentle, developmentally-focused therapy for children, working closely with families throughout treatment.",
                contact: "layla@therapyjo.com",
                photo: null,
                order: 3,
            },
        });
        await prisma.doctorProfile.create({
            data: {
                name: "Sami Barakat",
                title: "Physiotherapist",
                specialty: "Post-Op Rehabilitation",
                bio: "Sami focuses on post-surgical recovery, helping patients rebuild strength and mobility in staged, structured programs.",
                contact: null,
                photo: null,
                order: 4,
            },
        });
        await prisma.doctorProfile.create({
            data: {
                name: "Dina Qasem",
                title: "Physiotherapist",
                specialty: "Pelvic Floor Rehabilitation",
                bio: "Dina is currently on leave — profile kept hidden until she returns.",
                contact: null,
                photo: null,
                order: 5,
                hidden: true,
            },
        });
        console.log("✓ Doctor profiles: 5 (1 hidden, 3 linked to login accounts)");

        // ── Pending changes (Approvals queue demo) ──────────
        await prisma.pendingChange.createMany({
            data: [
                {
                    doctorId: ahmad.id,
                    field: ChangeField.BIO,
                    oldValue: ahmad.bio || "",
                    newValue: "Ahmad works primarily with athletes recovering from ligament and tendon injuries, and now also runs the clinic's pre-season screening program.",
                    submittedBy: ahmad.name,
                    status: ChangeStatus.PENDING,
                },
                {
                    doctorId: layla.id,
                    field: ChangeField.SPECIALTY,
                    oldValue: layla.specialty,
                    newValue: "Pediatric & Adolescent Physical Therapy",
                    submittedBy: layla.name,
                    status: ChangeStatus.PENDING,
                },
                {
                    doctorId: noor.id,
                    field: ChangeField.CONTACT,
                    oldValue: noor.contact || "",
                    newValue: "noor@therapyjo.com / 0791234501",
                    submittedBy: noor.name,
                    status: ChangeStatus.APPROVED,
                    reviewedBy: "Admin",
                    reviewedAt: new Date(),
                },
            ],
        });
        console.log("✓ Pending changes: 2 pending, 1 approved (Approvals queue)");
    } else {
        console.log(`✓ Doctor profiles: already have ${profileCount}, skipping`);
    }

    console.log("\nDemo seed complete.");
    console.log("Login as admin / admin123, or doctor accounts: noor / ahmad / layla, password doctor123.");
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
