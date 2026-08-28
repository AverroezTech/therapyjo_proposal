// Proves that a nameserver serves the therapyjo.com zone this cutover expects,
// record for record, BEFORE the nameservers are delegated to it
// (Production_Cutover.md, Phase 3).
//
// Phase 3 moves DNS from site4now — the legacy host, whose panel nobody can
// log into — to HostGator, by retyping the zone from scratch. Its entire
// safety argument is that no record changes value, so a split resolver
// population is harmless. That argument only holds if the new zone really is
// identical, and the failure it guards against is silent: a missed MX or SPF
// record bounces live clinic mail under _dmarc p=reject with no error
// anywhere, discovered days later.
//
// Run it: `npm run zone:diff -- --ns ns1.hostgator.com`. It prints a verdict
// word as the first token — greppable from a scheduler — then one line per
// check, and exits 0/1/2/3/4. See the five verdicts below.
//
// THE CRUX: this queries the nameserver named on the command line DIRECTLY,
// never the system resolver. Before the delegation changes, public recursive
// DNS still answers from site4now, so an ordinary lookup would test the old
// zone, pass, and say nothing about whether HostGator's zone is even
// populated. dns.promises.Resolver + setServers() is what makes the answer
// come from the server being judged. No dependency is added, for the same
// reason as the certificate tripwire: a check that only runs where its
// dependency happens to be installed is a check that stops running.
import { Resolver, lookup } from "node:dns/promises";
import { randomBytes } from "node:crypto";

// The zone as measured authoritatively against ns1.site4now.net on
// 2026-08-27, the day the legacy vendor pointed the apex, www and the
// wildcard at Vercel and left `online` on the legacy host as the /clinic/*
// proxy origin. The SOA serial moved 2025031307 -> 2026082704, confirming
// the edit — this is no longer the unchanged-since-March-2025 zone.
const ZONE = "therapyjo.com";
// Vercel's edge address — apex, www and the wildcard all point here now.
const VERCEL_IP = "216.198.79.1";
// The legacy site4now host. No longer the apex, but still `online`'s
// target: it is the origin the /clinic/* proxy rule forwards to, so staff
// access to the clinic system depends on this record specifically.
const LEGACY_IP = "208.98.35.122";
const MAIL_CNAME = "mail5010.site4now.net";
const MX_HOST = "igw10.site4now.net";
const MX_PREF = 10;
const DMARC = "v=DMARC1;p=reject;pct=100;rua=mailto:postmaster@therapyjo.com";
const EXPECTED_TTL = 300;

// The one deliberate difference between the old zone and the new one. The
// "a" mechanism means "whatever the apex A record points at may send mail as
// this domain" — which would have silently stopped authorising the legacy
// mail server the moment the apex started pointing at Vercel instead of
// 208.98.35.122. Neither 216.198.79.1 (Vercel) nor 208.98.35.122 nor
// igw10's 208.98.34.60 appears anywhere inside _spf.site4now.net (checked:
// it expands to 70.39.75.128/26, 70.39.90.0/24, 70.39.73.0/25, 14.1.20.0/22
// and _netblocks.site4now.net), so "a" and "mx" were the only things
// authorising them before. On 2026-08-27 the vendor flipped the apex to
// Vercel and applied this corrected record in the same edit, restating "a"
// as its literal legacy address so the policy carries forward unchanged
// instead of quietly dropping the legacy mail server's authorisation.
const SPF_CORRECTED = "v=spf1 ip4:208.98.35.122 mx include:_spf.site4now.net -all";
// Obsolete as of 2026-08-28: both zones now carry SPF_CORRECTED, since the
// vendor applied the fix to the live site4now zone at the same time as the
// apex flip rather than only in the HostGator transcription. Kept — with
// --legacy-spf below — only so the documented Phase 3 procedure doesn't
// break. Needing this flag now is itself a signal that something regressed.
const SPF_LEGACY = "v=spf1 a mx include:_spf.site4now.net -all";

const TIMEOUT_MS = 8_000;

const EXIT = {
  MATCH: 0,
  MISMATCH: 1,
  SPF_LEGACY: 2,
  NOZONE: 3,
  ERROR: 4,
};

// DNS failures that mean "this server did not give me an answer for this
// name" rather than "the record is wrong". During Phase 3 the overwhelmingly
// common state is a zone that isn't populated yet, and reporting that as a
// value mismatch would send the operator hunting for a typo that isn't there.
const NO_ANSWER_CODES = new Set([
  "ENOTFOUND",
  "ENODATA",
  "ESERVFAIL",
  "EREFUSED",
  "ETIMEOUT",
  "ECONNREFUSED",
]);

function parseArgs(argv) {
  let ns = null;
  let legacySpf = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--ns") {
      ns = argv[++i];
    } else if (argv[i] === "--legacy-spf") {
      legacySpf = true;
    }
  }
  return { ns, legacySpf };
}

const LABEL_WIDTH = 16;
function formatLine(label, value) {
  return `${(label + ":").padEnd(LABEL_WIDTH)}${value}`;
}

function printBlock(lines) {
  console.log(lines.join("\n"));
}

// Collapses runs of whitespace so that a panel which reformats a TXT record
// on save is not reported as having changed its meaning. Both SPF and DMARC
// are whitespace-insensitive in the places this matters.
function normalizeTxt(s) {
  return s.replace(/\s+/g, " ").trim();
}

function stripTrailingDot(s) {
  return s.endsWith(".") ? s.slice(0, -1) : s;
}

// Every check funnels through here so that a no-answer is distinguishable
// from a wrong answer at the point of comparison, not guessed at afterwards.
async function query(fn) {
  try {
    return { answered: true, data: await fn() };
  } catch (err) {
    return {
      answered: false,
      code: err.code || "EUNKNOWN",
      noAnswer: NO_ANSWER_CODES.has(err.code),
      message: err.message,
    };
  }
}

const results = [];
function record(status, name, type, detail) {
  results.push({ status, name, type, detail });
}

// Asks the target nameserver about a domain it certainly does not host, to
// find out whether it is capable of saying "no" at all.
//
// This is not hypothetical. Measured 2026-08-24: ns1.hostgator.com answers
// 162.214.129.144 — a parking host that 301s to wildcard.hostgator.com — for
// therapyjo.com, for google.com, and for a domain that does not exist. Its
// SOA for any of them is a generic catch-all (root.gator.hostgator.com,
// serial 1378556401), not a per-domain zone.
//
// That defeats the NOZONE detection below, which was written expecting an
// unpopulated zone to surface as NXDOMAIN or REFUSED. On a catch-all
// nameserver "the zone does not exist here" is instead indistinguishable
// from "every A record is wrong" — the exact confusion NOZONE exists to
// prevent, arriving by a different route. So measure the catch-all directly
// and let the verdict account for it, rather than inferring from error codes
// that this class of server never returns.
async function probeCatchAll(resolver) {
  const control = `zonecontrol-${randomBytes(8).toString("hex")}.com`;
  const r = await query(() => resolver.resolve4(control));
  if (!r.answered) return { catchAll: false, control, ips: [] };
  return { catchAll: true, control, ips: r.data };
}

async function checkA(resolver, name, label, expectedIp) {
  const r = await query(() => resolver.resolve4(name, { ttl: true }));
  if (!r.answered) {
    record("NOANSWER", label, "A", `${r.code} — no A record served for ${name}`);
    return;
  }
  const addresses = r.data.map((a) => a.address);
  if (addresses.length !== 1 || addresses[0] !== expectedIp) {
    record("FAIL", label, "A", `expected ${expectedIp} / got ${addresses.join(", ") || "(empty)"}`);
    return;
  }
  const ttl = r.data[0].ttl;
  if (ttl !== EXPECTED_TTL) {
    record("WARN", label, "A", `${expectedIp} — value correct, but TTL is ${ttl}, expected ${EXPECTED_TTL}`);
    return;
  }
  record("PASS", label, "A", `${expectedIp}  ttl ${ttl}`);
}

async function checkWildcard(resolver) {
  // A random label per run. A fixed probe name could one day collide with a
  // real record and turn this check into a tautology.
  const shortLabel = `zoneprobe-${randomBytes(4).toString("hex")}`;
  const probe = `${shortLabel}.${ZONE}`;
  const r = await query(() => resolver.resolve4(probe, { ttl: true }));
  if (!r.answered) {
    record(
      "NOANSWER",
      "*",
      "A",
      `${r.code} — wildcard did not answer for ${probe}; every unlisted subdomain dies without it`
    );
    return;
  }
  const addresses = r.data.map((a) => a.address);
  if (addresses.length !== 1 || addresses[0] !== VERCEL_IP) {
    record("FAIL", "*", "A", `expected ${VERCEL_IP} / got ${addresses.join(", ") || "(empty)"}`);
    return;
  }
  record("PASS", "*", "A", `${VERCEL_IP}  ttl ${r.data[0].ttl}  (probed ${shortLabel})`);
}

async function checkMailCname(resolver) {
  const name = `mail.${ZONE}`;
  const r = await query(() => resolver.resolveCname(name));
  if (!r.answered) {
    // The specific mistake this check exists for: transcribing the resolved
    // IP as an A record. It works today and breaks the day site4now
    // renumbers its own mail host, with no warning. Probe A so the failure
    // names the actual error instead of just saying "no CNAME".
    const asA = await query(() => resolver.resolve4(name));
    if (asA.answered) {
      record(
        "FAIL",
        "mail",
        "CNAME",
        `${r.code} — an A record answers instead (${asA.data.join(", ")}). It must be a CNAME.`
      );
      return;
    }
    // Nothing of either type came back, so this is the server declining to
    // answer for the name at all — not a record of the wrong type. Recorded
    // as NOANSWER so the zone-wide verdict below can tell "this server does
    // not serve the zone" from "this record is wrong."
    record("NOANSWER", "mail", "CNAME", `${r.code} — no CNAME served`);
    return;
  }
  const got = r.data.map(stripTrailingDot);
  if (got.length !== 1 || got[0] !== MAIL_CNAME) {
    record("FAIL", "mail", "CNAME", `expected ${MAIL_CNAME}. / got ${got.join(", ") || "(empty)"}`);
    return;
  }
  record("PASS", "mail", "CNAME", `${MAIL_CNAME}.`);
}

async function checkMx(resolver) {
  const r = await query(() => resolver.resolveMx(ZONE));
  if (!r.answered) {
    record("NOANSWER", "@", "MX", `${r.code} — no MX served; clinic mail has nowhere to land`);
    return;
  }
  const got = r.data.map((m) => `${m.priority} ${stripTrailingDot(m.exchange)}`);
  const want = `${MX_PREF} ${MX_HOST}`;
  if (got.length !== 1 || got[0] !== want) {
    // More than one MX is the classic leftover-default failure: cPanel zones
    // often ship a self-pointing MX that survives alongside the transcribed
    // one and quietly takes delivery.
    record(
      "FAIL",
      "@",
      "MX",
      `expected exactly "${want}." / got ${got.map((g) => `"${g}."`).join(", ") || "(empty)"}`
    );
    return;
  }
  record("PASS", "@", "MX", `${want}.`);
}

async function checkSpf(resolver, expectLegacy) {
  const expected = expectLegacy ? SPF_LEGACY : SPF_CORRECTED;
  const r = await query(() => resolver.resolveTxt(ZONE));
  if (!r.answered) {
    record("NOANSWER", "@", "TXT", `${r.code} — no TXT served, so no SPF record`);
    return null;
  }
  const records = r.data.map((chunks) => chunks.join(""));
  const spf = records.filter((t) => normalizeTxt(t).toLowerCase().startsWith("v=spf1"));
  if (spf.length === 0) {
    record("FAIL", "@", "TXT", `no v=spf1 record among ${records.length} TXT record(s)`);
    return null;
  }
  if (spf.length > 1) {
    // Two SPF records is not "one of them wins" — it is a permerror, and
    // under p=reject that bounces mail.
    record(
      "FAIL",
      "@",
      "TXT",
      `${spf.length} SPF records present — that is a permerror, not a fallback: ${spf.join(" | ")}`
    );
    return null;
  }
  const got = normalizeTxt(spf[0]);
  if (got === normalizeTxt(expected)) {
    record("PASS", "@", "TXT", `SPF  ${got}`);
    return null;
  }
  if (!expectLegacy && got === normalizeTxt(SPF_LEGACY)) {
    record("FAIL", "@", "TXT", "SPF is still the legacy 'a' form — see verdict below");
    return "SPF_LEGACY";
  }
  record("FAIL", "@", "TXT", `SPF expected "${expected}" / got "${got}"`);
  return null;
}

async function checkDmarc(resolver) {
  const name = `_dmarc.${ZONE}`;
  const r = await query(() => resolver.resolveTxt(name));
  if (!r.answered) {
    record("NOANSWER", "_dmarc", "TXT", `${r.code} — no TXT served`);
    return;
  }
  const records = r.data.map((chunks) => chunks.join(""));
  const dmarc = records.filter((t) => normalizeTxt(t).toLowerCase().startsWith("v=dmarc1"));
  if (dmarc.length !== 1) {
    record("FAIL", "_dmarc", "TXT", `expected exactly 1 DMARC record / got ${dmarc.length}`);
    return;
  }
  const got = normalizeTxt(dmarc[0]);
  if (got !== normalizeTxt(DMARC)) {
    record("FAIL", "_dmarc", "TXT", `expected "${DMARC}" / got "${got}"`);
    return;
  }
  record("PASS", "_dmarc", "TXT", got);
}

// Absence is a real assertion, not the absence of one. A stray CAA record
// can only turn Phase 4's certificate issuance from working into failing,
// and there is none in the zone today to transcribe.
async function checkAbsent(resolver, name, label, type, method, why) {
  const r = await query(() => resolver[method](name));
  if (!r.answered) {
    record("PASS", label, type, `absent (${r.code}) — as expected`);
    return;
  }
  const rendered = Array.isArray(r.data) ? JSON.stringify(r.data) : String(r.data);
  record("FAIL", label, type, `expected NO ${type} record / got ${rendered} — ${why}`);
}

async function main() {
  const { ns, legacySpf } = parseArgs(process.argv.slice(2));

  if (!ns) {
    printBlock([
      "ERROR",
      formatLine("reason", "no nameserver given — pass --ns <hostname-or-ip>"),
      formatLine(
        "meaning",
        "refusing to fall back to the system resolver, which would test the wrong zone"
      ),
      "",
      "  npm run zone:diff -- --ns ns1.hostgator.com",
      "  npm run zone:diff -- --ns ns1.site4now.net --legacy-spf",
    ]);
    process.exitCode = EXIT.ERROR;
    return;
  }

  // setServers wants addresses, so a hostname has to be resolved first — and
  // that one lookup is the only thing here that legitimately uses the system
  // resolver, because it is asking where a server is, not what it says.
  let nsAddress;
  try {
    nsAddress = /^[\d.]+$/.test(ns) ? ns : (await lookup(ns)).address;
  } catch (err) {
    printBlock([
      "ERROR",
      formatLine("nameserver", ns),
      formatLine(
        "reason",
        `could not resolve the nameserver's own address — ${err.code || err.message}`
      ),
      formatLine("meaning", "could not measure anything — never imply MATCH"),
    ]);
    process.exitCode = EXIT.ERROR;
    return;
  }

  const resolver = new Resolver({ timeout: TIMEOUT_MS, tries: 2 });
  resolver.setServers([nsAddress]);

  const control = await probeCatchAll(resolver);

  await checkA(resolver, ZONE, "@", VERCEL_IP);
  await checkWildcard(resolver);
  await checkA(resolver, `www.${ZONE}`, "www", VERCEL_IP);
  // `online` is the /clinic/* proxy origin, not a Vercel record — it stayed
  // on the legacy host through the flip and is checked unconditionally
  // because it exists as an explicit A record in both zones. If this one is
  // wrong or missing after delegation, every staff member loses access to
  // the clinic system.
  await checkA(resolver, `online.${ZONE}`, "online", LEGACY_IP);
  // Deliberately NOT checked: `new`. HostGator's zone has a CNAME
  // new -> 31e97fa68447aa19.vercel-dns-017.com, but the live site4now zone
  // has no `new` record at all and resolves it through the wildcard
  // instead. Checking it here would fail every run against the live zone —
  // one of this script's two supported targets (see --legacy-spf below) —
  // for a divergence that is known and intentional, not a transcription
  // error.
  await checkMailCname(resolver);
  await checkMx(resolver);
  const spfFlag = await checkSpf(resolver, legacySpf);
  await checkDmarc(resolver);
  await checkAbsent(resolver, ZONE, "@", "CAA", "resolveCaa", "it can only block Phase 4 issuance");
  await checkAbsent(
    resolver,
    `www.${ZONE}`,
    "www",
    "CAA",
    "resolveCaa",
    "it can only block Phase 4 issuance"
  );
  await checkAbsent(
    resolver,
    ZONE,
    "@",
    "AAAA",
    "resolve6",
    "the legacy host has no IPv6 address"
  );

  const failed = results.filter((r) => r.status === "FAIL").length;
  const noAnswer = results.filter((r) => r.status === "NOANSWER").length;
  const warned = results.filter((r) => r.status === "WARN").length;
  const passed = results.filter((r) => r.status === "PASS").length;

  // On a catch-all nameserver an absent zone looks like every A record being
  // wrong in the same way — all of them answering with the parking address —
  // while the record types the catch-all has no default for (MX, TXT) come
  // back empty. Recognising that shape is what keeps the operator from
  // hunting for a typo in a zone that was never created.
  // The absence assertions (no CAA, no AAAA) PASS when the server declines to
  // answer — which is correct for them individually, but means they must be
  // excluded when judging whether the server serves this zone at all.
  // Otherwise a nameserver refusing every query reports "7 of 10 checks did
  // not match", sending the operator hunting for a typo in a zone that
  // server has never heard of. Measured against dns1.name-services.com,
  // 2026-08-24.
  const ABSENT_TYPES = new Set(["CAA", "AAAA"]);
  const positives = results.filter((r) => !ABSENT_TYPES.has(r.type));
  const nothingServed = positives.length > 0 && positives.every((r) => r.status === "NOANSWER");

  const aResults = results.filter((r) => r.type === "A");
  const looksUncreated =
    control.catchAll &&
    aResults.length > 0 &&
    aResults.every((r) => r.status === "FAIL" && control.ips.some((ip) => r.detail.includes(ip))) &&
    results.some((r) => r.status === "NOANSWER");

  let verdict;
  let exitCode;
  let meaning;

  if (nothingServed) {
    verdict = "NOZONE";
    exitCode = EXIT.NOZONE;
    meaning = `${ns} serves no record of ${ZONE} — it refuses or has no data for every name. The zone is not published there. This is not a transcription error`;
  } else if (looksUncreated) {
    verdict = "NOZONE";
    exitCode = EXIT.NOZONE;
    meaning = `${ns} is a catch-all and is serving its parking address (${control.ips.join(", ")}) for ${ZONE} — the zone is not created there yet, and no record here is yours. Delegating now would park the domain and drop all mail`;
  } else if (spfFlag === "SPF_LEGACY") {
    verdict = "SPF-LEGACY";
    exitCode = EXIT.SPF_LEGACY;
    meaning =
      "zone carries the OLD SPF — 'a' authorises whatever the apex points at, so Phase 4 would hand that authority to Vercel and bounce clinic mail under p=reject. Replace 'a' with ip4:208.98.35.122";
  } else if (failed > 0 || noAnswer > 0) {
    verdict = "MISMATCH";
    exitCode = EXIT.MISMATCH;
    meaning = `${failed + noAnswer} of ${results.length} checks did not match — do NOT change the nameservers`;
  } else if (warned > 0) {
    verdict = "MATCH-WARN";
    exitCode = EXIT.MATCH;
    meaning = `all ${results.length} values correct, ${warned} TTL warning(s) — safe to delegate, but a long TTL slows Phase 4 rollback`;
  } else {
    verdict = "MATCH";
    exitCode = EXIT.MATCH;
    meaning = `all ${passed} checks match — this zone is a faithful copy`;
  }

  const rows = results.map(
    (r) => `  ${r.status.padEnd(9)}${r.name.padEnd(8)}${r.type.padEnd(6)}${r.detail}`
  );

  printBlock([
    verdict,
    formatLine("nameserver", `${ns} (${nsAddress})`),
    formatLine("zone", ZONE),
    formatLine("spfExpected", legacySpf ? "legacy 'a' form (--legacy-spf)" : "corrected ip4: form"),
    formatLine(
      "control",
      control.catchAll
        ? `CATCH-ALL — answers ${control.ips.join(", ")} for a domain it does not host, so it can never say NXDOMAIN`
        : "clean — refuses domains it does not host, so absence is meaningful"
    ),
    "",
    ...rows,
    "",
    // Node's resolver exposes a TTL only for A/AAAA answers, so the MX, TXT
    // and CNAME TTLs are unverified above — they have to be eyeballed in the
    // panel. Said here rather than in a comment because the operator reading
    // this output is the one who has to act on it.
    formatLine("ttlNote", "TTL verified for A records only — check MX/TXT/CNAME TTLs in the panel"),
    formatLine("meaning", meaning),
  ]);
  process.exitCode = exitCode;
}

main().catch((err) => {
  console.error("ERROR");
  console.error(`reason:  unhandled failure — ${err.stack || err}`);
  process.exitCode = EXIT.ERROR;
});
