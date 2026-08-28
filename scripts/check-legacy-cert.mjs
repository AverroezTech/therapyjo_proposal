// Watches the legacy clinic host's Let's Encrypt certificate for a renewal
// failure that produces NO other signal: the certificate stays valid for
// weeks after the ACME renewal starts failing, so nothing pages, nothing
// logs, and nothing breaks until the day it expires and /clinic/* starts
// returning 502 for every staff member (see Production_Cutover.md, Hazard 9).
// This script is the substitute for a human remembering to check by hand.
//
// Run it: `npm run cert:check` (add `-- --host <name>` to point elsewhere,
// or `-- --update` to accept the current cert as the new baseline). It
// prints a verdict word as the first token of its output — greppable from a
// scheduler — and exits 0/1/2/3 depending on what it found. See the six
// states below.
//
// Node's `tls` module covers all of this; no dependency is added on
// purpose, because a tripwire that only runs where its dependency happens
// to be installed is a tripwire that stops running.
import tls from "node:tls";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = path.join(__dirname, "legacy-cert-baseline.json");

// The host this tripwire tracks. Retargeted 2026-08-28: the legacy shared
// certificate (SAN therapyjo.com + www.therapyjo.com) is now irrelevant —
// neither name resolves to the legacy host any more, so that certificate
// will simply fail renewal and lapse on 2026-10-22, harmlessly. The job now
// is to watch the certificate on the /clinic/* origin itself, which is what
// actually breaks staff logins if its renewal silently fails.
const TRACKED_HOST = "online.therapyjo.com";
const DEFAULT_HOST = TRACKED_HOST;
const PORT = 443;
const TIMEOUT_MS = 15_000;
// Production_Cutover.md's fallback runbook: fire the tripwire two weeks
// before the certificate's notAfter date, not on the day it lapses.
const TRIPWIRE_DAYS_THRESHOLD = 14;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const EXIT = {
  OK: 0,
  TRIPWIRE: 1,
  EXPIRED: 2,
  FOREIGN: 3,
  ERROR: 3,
};

function parseArgs(argv) {
  let host = DEFAULT_HOST;
  let update = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--host") {
      host = argv[++i];
    } else if (argv[i] === "--update") {
      update = true;
    }
  }
  return { host, update };
}

function issuerToString(issuer) {
  if (!issuer) return "unknown";
  return issuer.O || issuer.CN || JSON.stringify(issuer);
}

// Splits a subjectaltname string ("DNS:online.therapyjo.com") into exact
// hostnames. This exists because a substring check on the raw SAN string
// would mismatch names that merely contain the tracked host as a substring
// (e.g. some-other.online.therapyjo.com) — exact-name comparison is what
// makes FOREIGN mean "this is not the certificate we track," not "this
// certificate's SAN happens to contain our string somewhere."
function parseSanNames(san) {
  if (!san) return [];
  return san
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.toUpperCase().startsWith("DNS:"))
    .map((entry) => entry.slice(entry.indexOf(":") + 1).trim());
}

// Right-aligns every printed field to one column, regardless of label
// length — so a long label like "baselineSerial" can't throw off the
// block's alignment the way a hand-padded string literal would.
const LABEL_WIDTH = 16;
function formatLine(label, value) {
  return `${(label + ":").padEnd(LABEL_WIDTH)}${value}`;
}

// Connects with rejectUnauthorized:false and reads the certificate from the
// secureConnect callback, then latches success. The ECONNRESET-after-a-good-
// certificate behavior this latch defends against was measured on the OLD
// tracked host, www.therapyjo.com, during planning — not yet re-measured on
// online.therapyjo.com. The latch is kept anyway, defensively: if the
// socket's "error" handler were left to own the exit code and this new host
// ever does the same thing, a healthy weekly check would report a false
// failure and train the operator to ignore the tripwire by the third week.
// Once the certificate has been read here, every later socket event is a
// no-op, at negligible cost if the new host never resets at all.
function readCertificate(host) {
  return new Promise((resolve) => {
    let latched = false;
    let settled = false;

    const settle = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const socket = tls.connect({
      host,
      port: PORT,
      servername: host,
      // Mandatory, not laziness: the single most important state this
      // script exists to catch is an EXPIRED certificate, and Node refuses
      // the handshake on an expired peer certificate by default. Strict
      // validation would make the script blind in exactly the case it was
      // written for. Read the certificate, then judge it — don't let TLS
      // pre-empt the judgement.
      rejectUnauthorized: false,
    });

    socket.setTimeout(TIMEOUT_MS, () => {
      socket.destroy();
      if (!latched) {
        settle({ ok: false, reason: `connection timed out after ${TIMEOUT_MS}ms` });
      }
    });

    socket.on("secureConnect", () => {
      const cert = socket.getPeerCertificate();
      latched = true;
      socket.end();

      if (!cert || Object.keys(cert).length === 0) {
        settle({ ok: false, reason: "no certificate received from peer" });
        return;
      }

      settle({
        ok: true,
        serial: cert.serialNumber,
        from: cert.valid_from,
        to: cert.valid_to,
        san: cert.subjectaltname || "",
        issuer: issuerToString(cert.issuer),
      });
    });

    socket.on("error", (err) => {
      if (latched) return; // known post-read ECONNRESET (or similar); ignore it
      settle({ ok: false, reason: err.message });
    });
  });
}

async function loadBaseline() {
  const raw = await readFile(BASELINE_PATH, "utf8");
  return JSON.parse(raw);
}

function printBlock(lines) {
  console.log(lines.join("\n"));
}

function daysRemaining(notAfter) {
  return Math.floor((notAfter.getTime() - Date.now()) / MS_PER_DAY);
}

async function main() {
  const { host, update } = parseArgs(process.argv.slice(2));
  const observation = await readCertificate(host);

  if (!observation.ok) {
    printBlock([
      "ERROR",
      formatLine("host", host),
      formatLine("reason", observation.reason),
      formatLine("meaning", "could not measure the certificate — never imply OK"),
    ]);
    process.exitCode = EXIT.ERROR;
    return;
  }

  // --update must never run implicitly: a baseline that silently follows
  // whatever serial is currently observed can never detect that the serial
  // stopped changing, which is the entire signal this script watches for.
  // It only runs behind this explicit flag.
  if (update) {
    const sanNames = parseSanNames(observation.san);
    if (!sanNames.includes(TRACKED_HOST)) {
      // A typo'd --host, or any host that isn't the tracked origin cert, must
      // not be allowed to overwrite the one piece of state the tripwire
      // depends on.
      printBlock([
        "ERROR",
        formatLine("host", host),
        formatLine(
          "reason",
          `refusing --update — observed SAN does not name ${TRACKED_HOST} (san: ${observation.san})`
        ),
        formatLine("meaning", "refusing to avoid clobbering the tracked baseline"),
      ]);
      process.exitCode = EXIT.ERROR;
      return;
    }

    const newBaseline = {
      serial: observation.serial,
      from: observation.from,
      to: observation.to,
      san: observation.san,
      issuer: observation.issuer,
      measured: new Date().toISOString().slice(0, 10),
    };
    await writeFile(BASELINE_PATH, JSON.stringify(newBaseline, null, 2) + "\n");
    printBlock([
      "UPDATED",
      formatLine("host", host),
      formatLine("serial", observation.serial),
      `baseline written to ${path.relative(process.cwd(), BASELINE_PATH)}`,
    ]);
    process.exitCode = EXIT.OK;
    return;
  }

  const baseline = await loadBaseline();
  const notAfter = new Date(observation.to);
  const remaining = daysRemaining(notAfter);
  const serialMatches = observation.serial === baseline.serial;
  const sanNames = parseSanNames(observation.san);
  // If the SAN doesn't even name the tracked origin host, none of the other
  // verdicts mean anything — not expiry, not the serial comparison, none of
  // it, because we're not looking at the certificate this script tracks.
  // The realistic way to hit this isn't a --host typo: it's online.therapyjo.com
  // itself getting repointed by a hand-edit at HostGator, which is exactly
  // the mistake Production_Cutover.md warns against. Checked first, ahead of
  // EXPIRED, so an unrelated expired certificate can never be reported as
  // "the clinic is degraded."
  const isForeign = !sanNames.includes(TRACKED_HOST);

  // The RESOLVED verdict (isResolved = !sanNames.includes(LEGACY_APEX_HOST))
  // was removed 2026-08-28: Hazard 9 — the shared apex+www certificate — is
  // over, and this script now tracks online.therapyjo.com, whose SAN never
  // contained the apex to begin with. Left in place, isResolved would have
  // been permanently true here, so the verdict ladder below would print
  // RESOLVED on every single run and could never reach TRIPWIRE — a tripwire
  // that always reads green is worse than no tripwire. Do not re-add a
  // verdict that is a tautology for the host it's checked against.

  let verdict;
  let exitCode;
  let meaning;

  if (isForeign) {
    verdict = "FOREIGN";
    exitCode = EXIT.FOREIGN;
    meaning = `not the tracked certificate — ${TRACKED_HOST} may have been repointed; check DNS before trusting any other verdict`;
  } else if (notAfter.getTime() < Date.now()) {
    verdict = "EXPIRED";
    exitCode = EXIT.EXPIRED;
    meaning = "Missed tripwire; clinic is already degraded";
  } else if (!serialMatches) {
    verdict = "RENEWED";
    exitCode = EXIT.OK;
    meaning = "Renewal succeeded. Re-run with --update to accept the new baseline";
  } else if (remaining <= TRIPWIRE_DAYS_THRESHOLD) {
    verdict = "TRIPWIRE";
    exitCode = EXIT.TRIPWIRE;
    meaning = "Fire the fallback runbook — renewal has failed";
  } else {
    verdict = "OK";
    exitCode = EXIT.OK;
    meaning = "Nothing to do";
  }

  printBlock([
    verdict,
    formatLine("host", host),
    formatLine("serial", observation.serial),
    formatLine("baselineSerial", baseline.serial),
    formatLine("daysRemaining", remaining),
    formatLine("notAfter", observation.to),
    formatLine("san", observation.san),
    formatLine("meaning", meaning),
  ]);
  process.exitCode = exitCode;
}

main().catch((err) => {
  console.error("ERROR");
  console.error(`reason:  unhandled failure — ${err.stack || err}`);
  process.exitCode = EXIT.ERROR;
});
