import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { normalizePhone, phoneKeys, nameSimilarity, normalizeName } from "@/lib/phone";

type DupPatient = {
    id: number;
    name: string;
    phone1: string;
    phone2: string | null;
    archived: boolean;
    createdAt: Date;
    lastVisitDate: Date | null;
    reservationCount: number;
};

// Which of this patient's raw phone fields normalized to `key` — shown to
// staff instead of the normalized key itself, so the group header reads as
// a phone number they recognise rather than a bare digit string.
function displayFor(p: { phone1: string; phone2: string | null }, key: string): string {
    if (normalizePhone(p.phone1) === key) return p.phone1;
    if (p.phone2 && normalizePhone(p.phone2) === key) return p.phone2;
    return p.phone1;
}

function minPairwiseNameSimilarity(patients: { name: string }[]): number {
    let min = 1;
    for (let i = 0; i < patients.length; i++) {
        for (let j = i + 1; j < patients.length; j++) {
            const sim = nameSimilarity(patients[i].name, patients[j].name);
            if (sim < min) min = sim;
        }
    }
    return min;
}

// nameSimilarity alone can't distinguish "literally the same name" from
// "different name that happens to reduce to the same token set once
// connectors are dropped" — both score exactly 1 (see /lib/phone.ts). That
// collapsed the "ali hamami" vs "ali al hamami" case into the neutral
// "same" band, when it's precisely the case the amber "variant" band exists
// to flag. So classify on two signals instead of nameSimilarity alone:
// whether every pair is BYTE-IDENTICAL after normalizeName decides "same"
// vs "variant"; nameSimilarity's 0.34 floor still decides "different".
function allSameNormalizedName(patients: { name: string }[]): boolean {
    if (patients.length === 0) return true;
    const first = normalizeName(patients[0].name);
    return patients.every((p) => normalizeName(p.name) === first);
}

function nameMatchBand(patients: { name: string }[]): "same" | "variant" | "different" {
    const minSim = minPairwiseNameSimilarity(patients);
    if (minSim < 0.34) return "different";
    return allSameNormalizedName(patients) ? "same" : "variant";
}

const NAME_MATCH_RANK: Record<"same" | "variant" | "different", number> = {
    different: 0,
    variant: 1,
    same: 2,
};

// GET /api/patients/duplicates?phone=xxx — find duplicate patients by phone
export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
        // Grouping duplicates requires comparing NORMALIZED phone numbers
        // ("0790022404" == "+962 7 9101 0021"-shaped numbers that reduce to
        // the same key), and there is no normalized column in the schema to
        // do that in SQL. Adding one means a migration against the live
        // clinic database, which is out of scope here — so this scans every
        // patient in memory instead. That's fine at clinic scale (low
        // thousands of patients); revisit if it stops being fine.
        //
        // Archived patients are NOT filtered out here: an archived record is
        // still a duplicate staff need to see (e.g. it may hold the session
        // history that should have been kept). The UI marks archived rows.
        const patients = await prisma.patient.findMany({
            select: {
                id: true,
                name: true,
                phone1: true,
                phone2: true,
                archived: true,
                createdAt: true,
                lastVisitDate: true,
                _count: { select: { reservations: true } },
            },
        });

        const flat: DupPatient[] = patients.map((p) => ({
            id: p.id,
            name: p.name,
            phone1: p.phone1,
            phone2: p.phone2,
            archived: p.archived,
            createdAt: p.createdAt,
            lastVisitDate: p.lastVisitDate,
            reservationCount: p._count.reservations,
        }));

        // A patient with two distinct numbers appears under two keys, so a
        // duplicate hiding in phone2 (invisible to a phone1-only grouping)
        // still surfaces.
        const byKey = new Map<string, DupPatient[]>();
        for (const p of flat) {
            for (const key of phoneKeys(p)) {
                if (!byKey.has(key)) byKey.set(key, []);
                byKey.get(key)!.push(p);
            }
        }

        // Two different keys (e.g. a patient's phone1 and phone2 both
        // normalizing the same way as some other patient's numbers) can
        // point at the exact same set of patient ids — emit each distinct
        // member set once, keyed by its sorted id signature.
        const bySignature = new Map<
            string,
            { phone: string; phoneDisplay: string; patients: DupPatient[] }
        >();
        for (const [key, group] of byKey) {
            const distinct = Array.from(new Map(group.map((p) => [p.id, p])).values());
            if (distinct.length < 2) continue; // a patient whose own phone1/phone2 collide is not a group with itself

            const signature = distinct
                .map((p) => p.id)
                .sort((a, b) => a - b)
                .join(",");
            if (bySignature.has(signature)) continue;

            bySignature.set(signature, {
                phone: key,
                phoneDisplay: displayFor(distinct[0], key),
                patients: distinct,
            });
        }

        const duplicates = Array.from(bySignature.values())
            .map((group) => ({
                ...group,
                nameMatch: nameMatchBand(group.patients),
            }))
            .sort((a, b) => {
                // Least obvious first — a phone match with clearly different
                // names is the one that most needs a human to look at it.
                const rankDiff = NAME_MATCH_RANK[a.nameMatch] - NAME_MATCH_RANK[b.nameMatch];
                if (rankDiff !== 0) return rankDiff;
                return b.patients.length - a.patients.length;
            });

        return NextResponse.json({ duplicates, total: duplicates.length });
    }

    // Search for a specific phone number
    const key = normalizePhone(phone);
    if (!key) {
        // Doesn't normalize to a usable key (too short / not phone-shaped) —
        // fall back to the old partial-string search so callers can still
        // look up patients mid-typing.
        const matches = await prisma.patient.findMany({
            where: {
                OR: [
                    { phone1: { contains: phone } },
                    { phone2: { contains: phone } },
                ],
            },
            select: {
                id: true,
                name: true,
                phone1: true,
                phone2: true,
                archived: true,
                createdAt: true,
            },
        });
        return NextResponse.json({ matches, total: matches.length });
    }

    const patients = await prisma.patient.findMany({
        select: {
            id: true,
            name: true,
            phone1: true,
            phone2: true,
            archived: true,
            createdAt: true,
        },
    });
    const matches = patients.filter((p) => phoneKeys(p).includes(key));

    return NextResponse.json({ matches, total: matches.length });
}
