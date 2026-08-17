// Generates level-based static geo JSON files for both apps.
// Sources (verified, MIT/official):
//  - iqbalhasandev/bangladesh-geo-json (divisions/districts/upazilas/unions/pourashavas)
//  - raadu/dhaka-city-corporation-data (DNCC/DSCC ward -> area names)
//  - Local Government Division (lgd.gov.bd) for official CC ward counts
// Output:
//  - {app}/public/geo/index.json            (divisions -> districts)
//  - {app}/public/geo/district-{id}.json    (upazilas + unions/pourashavas + CC list)
//  - {app}/public/geo/cc-{id}.json          (CC wards -> areas; empty areas => free text)
// Static files are served by Cloudflare CDN edge FREE + UNLIMITED (never hits
// the Workers request quota), so huge user counts don't cost anything.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TMP = process.env.GEO_TMP || path.join(require("os").tmpdir(), "opencode", "geo");
const TARGETS = [path.join(ROOT, "public", "geo"), path.join(ROOT, "join-app", "public", "geo")];

// Verified ward counts (Local Government Division / official CC portals / Wikipedia).
// Mymensingh became a CC in 2018 (33 wards per official gazette + Wikipedia council list).
// DSCC expanded to 75 wards (LGD 2026); raadu only covers wards 1-57, rest are number-only.
const CC_WARDS = {
  "Dhaka North City Corporation": 54,
  "Dhaka South City Corporation": 75,
  "Chattogram City Corporation": 41,
  "Khulna City Corporation": 31,
  "Rajshahi City Corporation": 30,
  "Barishal City Corporation": 30,
  "Sylhet City Corporation": 27,
  "Narayanganj City Corporation": 27,
  "Cumilla City Corporation": 27,
  "Rangpur City Corporation": 33,
  "Gazipur City Corporation": 57,
  "Mymensingh City Corporation": 33,
};

const slug = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function load(name) {
  const p = path.join(TMP, name);
  if (!fs.existsSync(p)) throw new Error(`Missing source: ${p} (set GEO_TMP or download first)`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function main() {
  const geo = load("bangladesh-geo.json");
  const cc = load("city_corp.json");

  // raadu: city_corp_tag -> { ward -> [{en, bn}] }
  const ccAreas = {};
  for (const item of cc) {
    const tag = item.city_corp_tag;
    const w = String(item.ward);
    if (!ccAreas[tag]) ccAreas[tag] = {};
    if (!ccAreas[tag][w]) ccAreas[tag][w] = [];
    const en = String(item.area_name.en || "").trim();
    const bn = String(item.area_name.bn || "").trim();
    if (en) ccAreas[tag][w].push({ en, bn });
  }
  // raadu tag -> iqbalhasandev CC name
  const tagToCCName = { DNCC: "Dhaka North City Corporation", DSCC: "Dhaka South City Corporation" };

  const index = { divisions: [] };
  const districtsMap = {};

  for (const div of geo) {
    const divEntry = { id: slug(div.name), en: div.name, bn: div.bn_name, districts: [] };
    for (const di of div.districts) {
      const did = slug(di.name);
      const ccs = (di.city_corporations || []).map((c) => {
        const name = c.name;
        const wardCount = CC_WARDS[name] || 0;
        return { id: slug(name), en: name, bn: c.bn_name, wardCount };
      });
      const upazilas = (di.upazilas || []).map((u) => ({
        id: slug(u.name),
        en: u.name,
        bn: u.bn_name,
        unions: (u.unions || []).map((x) => ({ en: x.name, bn: x.bn_name })),
        pourashavas: (u.pourashavas || []).map((x) => ({ en: x.name, bn: x.bn_name })),
      }));
      districtsMap[did] = { id: did, en: di.name, bn: di.bn_name, cityCorporations: ccs, upazilas };
      divEntry.districts.push({ id: did, en: di.name, bn: di.bn_name, hasCC: ccs.length > 0 });
    }
    index.divisions.push(divEntry);
  }

  // CC detail files: ward -> areas (raadu for Dhaka, otherwise empty => free text)
  const ccFiles = {};
  for (const [ccName, wardCount] of Object.entries(CC_WARDS)) {
    const cid = slug(ccName);
    const raaduTag = Object.keys(tagToCCName).find((t) => tagToCCName[t] === ccName);
    const areas = raaduTag ? ccAreas[raaduTag] || {} : {};
    const wards = [];
    for (let n = 1; n <= wardCount; n++) {
      wards.push({ n, areas: (areas[String(n)] || []).map((a) => ({ en: a.en, bn: a.bn })) });
    }
    ccFiles[cid] = { id: cid, en: ccName, bn: "", wardCount, wards };
    // fill bn from geo data if present
    for (const div of geo) {
      for (const di of div.districts) {
        for (const c of di.city_corporations || []) {
          if (c.name === ccName) ccFiles[cid].bn = c.bn_name;
        }
      }
    }
  }

  for (const target of TARGETS) {
    fs.mkdirSync(target, { recursive: true });
    fs.writeFileSync(path.join(target, "index.json"), JSON.stringify(index));
    for (const [did, data] of Object.entries(districtsMap)) {
      fs.writeFileSync(path.join(target, `district-${did}.json`), JSON.stringify(data));
    }
    for (const [cid, data] of Object.entries(ccFiles)) {
      fs.writeFileSync(path.join(target, `cc-${cid}.json`), JSON.stringify(data));
    }
  }

  const totalUnions = Object.values(districtsMap).reduce((s, d) => s + d.upazilas.reduce((s2, u) => s2 + u.unions.length, 0), 0);
  const totalPour = Object.values(districtsMap).reduce((s, d) => s + d.upazilas.reduce((s2, u) => s2 + u.pourashavas.length, 0), 0);
  console.log(`OK: ${index.divisions.length} divisions / ${Object.keys(districtsMap).length} districts / ${totalUnions} unions / ${totalPour} pourashavas / ${Object.keys(ccFiles).length} CCs`);
  for (const t of TARGETS) {
    let bytes = 0;
    for (const f of fs.readdirSync(t)) bytes += fs.statSync(path.join(t, f)).size;
    console.log(`  ${path.relative(ROOT, t)}: ${fs.readdirSync(t).length} files, ${(bytes / 1024).toFixed(0)} KB total`);
  }
}

main();