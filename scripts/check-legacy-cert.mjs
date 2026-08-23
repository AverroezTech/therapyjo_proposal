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

const DEFAULT_HOST = "www.therapyjo.com";
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

// Connects with rejectUnauthorized:false and reads the certificate from the
// secureConnect callback, then latches success. This host (www.therapyjo.com)
// sends ECONNRESET *after* delivering a perfectly good certificate — measured
// directly during planning. If the socket's "error" handler were left to own
// the exit code, a healthy weekly check would report a false failure and
// train the operator to ignore the tripwire by the third week. Once the
// certificate has been read here, every later socket event is a no-op.
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
      `host:    ${host}`,
      `reason:  ${observation.reason}`,
      "meaning: could not measure the certificate — never imply OK",
    ]);
    process.exitCode = EXIT.ERROR;
    return;
  }

  // --update must never run implicitly: a baseline that silently follows
  // whatever serial is currently observed can never detect that the serial
  // stopped changing, which is the entire signal this script watches for.
  // It only runs behind this explicit flag.
  if (update) {
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
      `host:    ${host}`,
      `serial:  ${observation.serial}`,
      `baseline written to ${path.relative(process.cwd(), BASELINE_PATH)}`,
    ]);
    process.exitCode = EXIT.OK;
    return;
  }

  const baseline = await loadBaseline();
  const notAfter = new Date(observation.to);
  const remaining = daysRemaining(notAfter);
  const serialMatches = observation.serial === baseline.serial;
  const sanStillNamesTherapyjo = observation.san.includes("therapyjo.com");

  let verdict;
  let exitCode;
  let meaning;

  if (notAfter.getTime() < Date.now()) {
    // Checked first: an expired certificate is the most urgent state
    // regardless of what its SAN or serial look like.
    verdict = "EXPIRED";
    exitCode = EXIT.EXPIRED;
    meaning = "Missed tripwire; clinic is already degraded";
  } else if (!sanStillNamesTherapyjo) {
    verdict = "RESOLVED";
    exitCode = EXIT.OK;
    meaning = "Hazard 9 is over — SAN no longer names therapyjo.com; runbook can be retired";
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
    `host:          ${host}`,
    `serial:        ${observation.serial}`,
    `baselineSerial:${" "}${baseline.serial}`,
    `daysRemaining: ${remaining}`,
    `notAfter:      ${observation.to}`,
    `san:           ${observation.san}`,
    `meaning:       ${meaning}`,
  ]);
  process.exitCode = exitCode;
}

main().catch((err) => {
  console.error("ERROR");
  console.error(`reason:  unhandled failure — ${err.stack || err}`);
  process.exitCode = EXIT.ERROR;
});
