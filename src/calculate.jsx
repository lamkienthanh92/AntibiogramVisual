// ============================================================
// calculate.js
// Core computation: CLSI tiers, MDR/XDR/PDR classification,
// heatmap matrix, time-series aggregation, quality flags,
// duplicate-isolate deduplication, date parsing utilities.
// No React. No UI. Pure functions only.
// ============================================================

// ────────────────────────────────────────────────────────────
// ANTIBIOTIC NAME NORMALIZER
// ────────────────────────────────────────────────────────────
export const AB_MAP = {
  "Am/cl": "Amoxicillin-Clavulanate",
  Amik: "Amikacin",
  Amo: "Amoxicillin",
  "Ampi/sul": "Ampicillin-Sulbactam",
  Ampi: "Ampicillin",
  Bac: "Bacitracin",
  Cefa: "Cefazolin",
  Cefe: "Cefepime",
  Cefop: "Cefoperazone",
  Cefota: "Cefotaxime",
  Cefoxi: "Cefoxitin",
  Cefta: "Ceftazidime",
  Ceftri: "Ceftriaxone",
  Cefu: "Cefuroxime",
  Cepha: "Cephalexin",
  Cipro: "Ciprofloxacin",
  Clin: "Clindamycin",
  Colis: "Colistin",
  Chloram: "Chloramphenicol",
  Doxy: "Doxycycline",
  Genta: "Gentamicin",
  Imi: "Imipenem",
  Erta: "Ertapenem",
  Ery: "Erythromycin",
  Levo: "Levofloxacin",
  Line: "Linezolid",
  Mero: "Meropenem",
  Nali: "Nalidixic acid",
  Neo: "Neomycin",
  Netil: "Netilmicin",
  Nitro: "Nitrofurantoin",
  Nor: "Norfloxacin",
  Oflo: "Ofloxacin",
  Oxa: "Oxacillin",
  Peni: "Penicillin",
  "Piper/tazo": "Piperacillin-Tazobactam",
  Fos: "Fosfomycin",
  Poly: "Polymyxin B",
  Rifa: "Rifampin",
  Tetra: "Tetracycline",
  Tica: "Ticarcillin",
  Tobra: "Tobramycin",
  "Trime/Sulfa": "Trimethoprim-Sulfamethoxazole",
  Van: "Vancomycin",
  Tige: "Tigecycline",
  Teicoplanin: "Teicoplanin",
  Clari: "Clarithromycin",
  "Clari.": "Clarithromycin",
};

export const normAB = (raw) => {
  if (!raw) return null;
  const s = raw.toString().trim();
  if (AB_MAP[s]) return AB_MAP[s];
  for (const [k, v] of Object.entries(AB_MAP))
    if (k.toLowerCase() === s.toLowerCase()) return v;
  return s;
};

// ────────────────────────────────────────────────────────────
// CLSI M100 TIERS — 30+ organisms
// ────────────────────────────────────────────────────────────
export const CLSI = {
  "Escherichia coli": {
    "Tier 1": [
      "Ampicillin",
      "Cefazolin",
      "Gentamicin",
      "Ciprofloxacin",
      "Levofloxacin",
      "Trimethoprim-Sulfamethoxazole",
    ],
    "Tier 2": [
      "Cefotaxime",
      "Ceftriaxone",
      "Cefepime",
      "Tobramycin",
      "Amikacin",
      "Amoxicillin-Clavulanate",
      "Piperacillin-Tazobactam",
    ],
    "Tier 3": ["Ertapenem", "Imipenem", "Meropenem", "Colistin"],
    "Urine only": ["Nitrofurantoin", "Fosfomycin"],
    intrinsic: [],
    removed: [],
  },
  "Klebsiella pneumoniae": {
    "Tier 1": [
      "Cefazolin",
      "Gentamicin",
      "Ciprofloxacin",
      "Levofloxacin",
      "Trimethoprim-Sulfamethoxazole",
    ],
    "Tier 2": [
      "Cefotaxime",
      "Ceftriaxone",
      "Cefepime",
      "Tobramycin",
      "Amikacin",
      "Piperacillin-Tazobactam",
    ],
    "Tier 3": ["Ertapenem", "Imipenem", "Meropenem", "Colistin"],
    "Urine only": ["Nitrofurantoin"],
    intrinsic: ["Ampicillin", "Amoxicillin-Clavulanate"],
    removed: [],
  },
  "Klebsiella oxytoca": {
    "Tier 1": [
      "Cefazolin",
      "Gentamicin",
      "Ciprofloxacin",
      "Trimethoprim-Sulfamethoxazole",
    ],
    "Tier 2": [
      "Ceftriaxone",
      "Cefepime",
      "Amikacin",
      "Piperacillin-Tazobactam",
    ],
    "Tier 3": ["Ertapenem", "Imipenem", "Meropenem"],
    "Urine only": ["Nitrofurantoin"],
    intrinsic: ["Ampicillin"],
    removed: [],
  },
  "Pseudomonas aeruginosa": {
    "Tier 1": [
      "Ceftazidime",
      "Cefepime",
      "Piperacillin-Tazobactam",
      "Tobramycin",
      "Ciprofloxacin",
      "Levofloxacin",
    ],
    "Tier 2": ["Imipenem", "Meropenem"],
    "Tier 3": ["Colistin"],
    "Urine only": ["Amikacin"],
    intrinsic: [
      "Ampicillin",
      "Amoxicillin",
      "Cefazolin",
      "Cefuroxime",
      "Ertapenem",
      "Trimethoprim-Sulfamethoxazole",
      "Tigecycline",
    ],
    removed: ["Gentamicin"],
  },
  "Acinetobacter baumannii": {
    "Tier 1": ["Ampicillin-Sulbactam", "Ciprofloxacin", "Levofloxacin"],
    "Tier 2": ["Imipenem", "Meropenem", "Tobramycin", "Amikacin"],
    "Tier 3": ["Colistin", "Tigecycline"],
    "Urine only": [],
    intrinsic: [],
    removed: [],
  },
  "Staphylococcus aureus": {
    "Tier 1": [
      "Oxacillin",
      "Cefoxitin",
      "Erythromycin",
      "Clindamycin",
      "Doxycycline",
      "Trimethoprim-Sulfamethoxazole",
    ],
    "Tier 2": ["Vancomycin", "Ciprofloxacin", "Levofloxacin"],
    "Tier 3": ["Linezolid", "Rifampin"],
    "Urine only": ["Nitrofurantoin"],
    intrinsic: [],
    removed: [],
  },
  "Staphylococcus epidermidis": {
    "Tier 1": [
      "Oxacillin",
      "Erythromycin",
      "Clindamycin",
      "Trimethoprim-Sulfamethoxazole",
    ],
    "Tier 2": ["Vancomycin", "Ciprofloxacin"],
    "Tier 3": ["Linezolid"],
    "Urine only": [],
    intrinsic: [],
    removed: [],
  },
  "Staphylococcus haemolyticus": {
    "Tier 1": ["Oxacillin", "Vancomycin"],
    "Tier 2": ["Linezolid"],
    "Tier 3": [],
    "Urine only": [],
    intrinsic: [],
    removed: [],
  },
  "Enterococcus faecalis": {
    "Tier 1": ["Ampicillin", "Vancomycin"],
    "Tier 2": ["Penicillin"],
    "Tier 3": ["Linezolid"],
    "Urine only": [
      "Nitrofurantoin",
      "Ciprofloxacin",
      "Levofloxacin",
      "Fosfomycin",
      "Tetracycline",
    ],
    intrinsic: [
      "Cefazolin",
      "Ceftriaxone",
      "Cefepime",
      "Ceftazidime",
      "Clindamycin",
      "Trimethoprim-Sulfamethoxazole",
    ],
    removed: [],
  },
  "Enterococcus faecium": {
    "Tier 1": ["Vancomycin", "Linezolid"],
    "Tier 2": [],
    "Tier 3": [],
    "Urine only": ["Nitrofurantoin"],
    intrinsic: [
      "Ampicillin",
      "Cefazolin",
      "Ceftriaxone",
      "Cefepime",
      "Ceftazidime",
      "Clindamycin",
      "Trimethoprim-Sulfamethoxazole",
    ],
    removed: [],
  },
  "Streptococcus pneumoniae": {
    "Tier 1": ["Penicillin", "Erythromycin", "Clindamycin", "Doxycycline"],
    "Tier 2": ["Cefotaxime", "Ceftriaxone", "Levofloxacin", "Vancomycin"],
    "Tier 3": ["Linezolid"],
    "Urine only": [],
    intrinsic: [],
    removed: [],
  },
  "Streptococcus pyogenes": {
    "Tier 1": ["Penicillin", "Erythromycin", "Clindamycin"],
    "Tier 2": ["Ceftriaxone", "Vancomycin"],
    "Tier 3": [],
    "Urine only": [],
    intrinsic: [],
    removed: [],
  },
  "Streptococcus agalactiae": {
    "Tier 1": ["Penicillin", "Ampicillin", "Erythromycin", "Clindamycin"],
    "Tier 2": ["Ceftriaxone", "Vancomycin"],
    "Tier 3": [],
    "Urine only": [],
    intrinsic: [],
    removed: [],
  },
  "Enterobacter cloacae": {
    "Tier 1": [
      "Cefepime",
      "Gentamicin",
      "Ciprofloxacin",
      "Levofloxacin",
      "Trimethoprim-Sulfamethoxazole",
    ],
    "Tier 2": ["Amikacin", "Tobramycin", "Piperacillin-Tazobactam"],
    "Tier 3": ["Ertapenem", "Imipenem", "Meropenem"],
    "Urine only": ["Nitrofurantoin"],
    intrinsic: ["Ampicillin", "Amoxicillin-Clavulanate", "Cefazolin"],
    removed: [],
  },
  "Enterobacter aerogenes": {
    "Tier 1": ["Cefepime", "Gentamicin", "Ciprofloxacin"],
    "Tier 2": ["Amikacin", "Piperacillin-Tazobactam"],
    "Tier 3": ["Ertapenem", "Imipenem", "Meropenem"],
    "Urine only": [],
    intrinsic: ["Ampicillin", "Amoxicillin-Clavulanate", "Cefazolin"],
    removed: [],
  },
  "Proteus mirabilis": {
    "Tier 1": [
      "Ampicillin",
      "Cefazolin",
      "Gentamicin",
      "Ciprofloxacin",
      "Trimethoprim-Sulfamethoxazole",
    ],
    "Tier 2": [
      "Ceftriaxone",
      "Cefepime",
      "Amikacin",
      "Piperacillin-Tazobactam",
    ],
    "Tier 3": ["Ertapenem", "Imipenem", "Meropenem"],
    "Urine only": [],
    intrinsic: [],
    removed: [],
  },
  "Proteus vulgaris": {
    "Tier 1": ["Cefazolin", "Gentamicin", "Ciprofloxacin"],
    "Tier 2": ["Ceftriaxone", "Amikacin"],
    "Tier 3": ["Imipenem", "Meropenem"],
    "Urine only": [],
    intrinsic: ["Ampicillin"],
    removed: [],
  },
  "Morganella morganii": {
    "Tier 1": ["Cefepime", "Gentamicin", "Ciprofloxacin"],
    "Tier 2": ["Amikacin", "Ceftriaxone"],
    "Tier 3": ["Imipenem", "Meropenem"],
    "Urine only": [],
    intrinsic: [
      "Ampicillin",
      "Amoxicillin-Clavulanate",
      "Cefazolin",
      "Colistin",
    ],
    removed: [],
  },
  "Serratia marcescens": {
    "Tier 1": [
      "Cefepime",
      "Gentamicin",
      "Ciprofloxacin",
      "Trimethoprim-Sulfamethoxazole",
    ],
    "Tier 2": ["Amikacin", "Piperacillin-Tazobactam"],
    "Tier 3": ["Ertapenem", "Imipenem", "Meropenem"],
    "Urine only": [],
    intrinsic: [
      "Ampicillin",
      "Amoxicillin-Clavulanate",
      "Cefazolin",
      "Colistin",
    ],
    removed: [],
  },
  "Citrobacter freundii": {
    "Tier 1": ["Cefepime", "Gentamicin", "Ciprofloxacin"],
    "Tier 2": ["Amikacin", "Ceftriaxone", "Piperacillin-Tazobactam"],
    "Tier 3": ["Ertapenem", "Imipenem", "Meropenem"],
    "Urine only": [],
    intrinsic: ["Ampicillin", "Amoxicillin-Clavulanate"],
    removed: [],
  },
  "Citrobacter koseri": {
    "Tier 1": ["Cefazolin", "Gentamicin", "Ciprofloxacin"],
    "Tier 2": ["Ceftriaxone", "Amikacin"],
    "Tier 3": ["Ertapenem", "Imipenem"],
    "Urine only": [],
    intrinsic: ["Ampicillin"],
    removed: [],
  },
  "Stenotrophomonas maltophilia": {
    "Tier 1": ["Trimethoprim-Sulfamethoxazole", "Levofloxacin"],
    "Tier 2": ["Doxycycline", "Chloramphenicol"],
    "Tier 3": ["Colistin"],
    "Urine only": [],
    intrinsic: ["Ampicillin", "Cefazolin", "Imipenem", "Meropenem"],
    removed: [],
  },
  "Haemophilus influenzae": {
    "Tier 1": [
      "Ampicillin",
      "Amoxicillin-Clavulanate",
      "Trimethoprim-Sulfamethoxazole",
    ],
    "Tier 2": ["Ceftriaxone", "Ciprofloxacin", "Levofloxacin"],
    "Tier 3": [],
    "Urine only": [],
    intrinsic: [],
    removed: [],
  },
  "Moraxella catarrhalis": {
    "Tier 1": ["Amoxicillin-Clavulanate", "Trimethoprim-Sulfamethoxazole"],
    "Tier 2": ["Ceftriaxone", "Ciprofloxacin"],
    "Tier 3": [],
    "Urine only": [],
    intrinsic: ["Ampicillin"],
    removed: [],
  },
  "Providencia stuartii": {
    "Tier 1": ["Ciprofloxacin", "Cefepime"],
    "Tier 2": ["Amikacin", "Piperacillin-Tazobactam"],
    "Tier 3": ["Imipenem", "Meropenem"],
    "Urine only": [],
    intrinsic: ["Ampicillin", "Colistin"],
    removed: [],
  },
  "Providencia rettgeri": {
    "Tier 1": ["Ciprofloxacin", "Cefepime"],
    "Tier 2": ["Amikacin"],
    "Tier 3": ["Imipenem", "Meropenem"],
    "Urine only": [],
    intrinsic: ["Ampicillin", "Colistin"],
    removed: [],
  },
  "Burkholderia cepacia": {
    "Tier 1": ["Trimethoprim-Sulfamethoxazole", "Levofloxacin"],
    "Tier 2": ["Meropenem", "Ceftazidime"],
    "Tier 3": [],
    "Urine only": [],
    intrinsic: ["Ampicillin", "Cefazolin", "Colistin"],
    removed: [],
  },
  "Chryseobacterium indologenes": {
    "Tier 1": ["Trimethoprim-Sulfamethoxazole", "Levofloxacin"],
    "Tier 2": ["Rifampin"],
    "Tier 3": ["Vancomycin"],
    "Urine only": [],
    intrinsic: ["Ampicillin", "Imipenem", "Meropenem"],
    removed: [],
  },
  "Elizabethkingia meningoseptica": {
    "Tier 1": ["Trimethoprim-Sulfamethoxazole", "Levofloxacin", "Rifampin"],
    "Tier 2": ["Vancomycin"],
    "Tier 3": [],
    "Urine only": [],
    intrinsic: ["Ampicillin", "Imipenem", "Meropenem", "Colistin"],
    removed: [],
  },
};

export const findCLSI = (name) => {
  if (!name) return null;
  const n = name.toLowerCase().trim();
  for (const [k, v] of Object.entries(CLSI)) {
    if (
      k.toLowerCase() === n ||
      n.includes(k.toLowerCase()) ||
      k.toLowerCase().includes(n)
    )
      return { name: k, data: v };
  }
  return null;
};

export const shouldShowAB = (clsiData, ab, tier) => {
  if (!clsiData) return true;
  const an = ab.toLowerCase().trim();
  const inL = (list) =>
    (list || []).some((x) => {
      const xl = x.toLowerCase().trim();
      return an === xl || an.includes(xl) || xl.includes(an);
    });
  if (inL(clsiData.intrinsic) || inL(clsiData.removed)) return false;
  if (tier === "all") return true;
  const tn =
    tier === "tier1" ? "Tier 1" : tier === "tier2" ? "Tier 2" : "Tier 3";
  return inL(clsiData[tn]);
};

// ────────────────────────────────────────────────────────────
// CLSI-BASED INTRINSIC / NOT-APPLICABLE FILTER
// Applied during processRawData to EVERY uploaded file, not
// just demo data.  Three layers of exclusion:
//
//   1. CLSI `intrinsic` list for the organism  →  always exclude
//   2. CLSI `removed` list                     →  always exclude
//   3. Class-level rules: antibiotics whose drug class is
//      fundamentally inactive against the organism's gram
//      category (e.g. vancomycin for Gram-negatives,
//      oxacillin for Gram-negatives, colistin for
//      intrinsically-resistant genera).
//
// Returns true  → this result should be EXCLUDED (blank/ignored)
// Returns false → include the result normally
// ────────────────────────────────────────────────────────────

// Gram-positive organisms (vancomycin, oxacillin are relevant;
// colistin, polymyxins are NOT)
const GP_GENERA = new Set([
  "staphylococcus",
  "streptococcus",
  "enterococcus",
  "listeria",
  "bacillus",
  "clostridium",
  "corynebacterium",
  "lactobacillus",
]);

// Gram-negative organisms where vancomycin / oxacillin /
// penicillinase-resistant penicillins have NO activity
const GN_GENERA = new Set([
  "escherichia",
  "klebsiella",
  "pseudomonas",
  "acinetobacter",
  "enterobacter",
  "proteus",
  "morganella",
  "serratia",
  "citrobacter",
  "stenotrophomonas",
  "haemophilus",
  "moraxella",
  "providencia",
  "burkholderia",
  "chryseobacterium",
  "elizabethkingia",
  "salmonella",
  "shigella",
  "helicobacter",
  "campylobacter",
]);

// Organisms with intrinsic colistin / polymyxin resistance
const COLISTIN_INTRINSIC_RESISTANT = new Set([
  "serratia",
  "proteus",
  "morganella",
  "providencia",
  "burkholderia",
  "chryseobacterium",
  "elizabethkingia",
  "stenotrophomonas",
]);

// Antibiotics that are GP-only (no activity against GN)
const GP_ONLY_ABS = new Set([
  "vancomycin",
  "teicoplanin",
  "oxacillin",
  "nafcillin",
  "methicillin",
  "linezolid", // actually active against some GN but not reported
  "daptomycin",
  "tedizolid",
]);

// Antibiotics that are GN-only or not tested for GP
const GN_CONTEXT_ABS = new Set([
  // Colistin/polymyxin — not for GP
  "colistin",
  "polymyxin b",
]);

/**
 * Returns true if this organism × antibiotic combination
 * should be EXCLUDED from analysis (intrinsic resistance or
 * fundamentally not applicable per CLSI rules).
 *
 * @param {string} bacteriaName  — full organism name from file
 * @param {string} antibioticName — normalised antibiotic name
 */
export function isIntrinsicBlank(bacteriaName, antibioticName) {
  if (!bacteriaName || !antibioticName) return false;

  const bLow = bacteriaName.toLowerCase().trim();
  const aLow = antibioticName.toLowerCase().trim();

  // ── Layer 1 & 2: use CLSI intrinsic / removed lists ──────
  const clsi = findCLSI(bacteriaName);
  if (clsi) {
    const inL = (list) =>
      (list || []).some((x) => {
        const xl = x.toLowerCase().trim();
        return aLow === xl || aLow.includes(xl) || xl.includes(aLow);
      });
    if (inL(clsi.data.intrinsic)) return true;
    if (inL(clsi.data.removed)) return true;
  }

  // ── Layer 3a: GP-only antibiotics against GN organisms ───
  const genus = bLow.split(" ")[0];
  const isGN = GN_GENERA.has(genus);
  const isGP = GP_GENERA.has(genus);

  if (isGN) {
    // Vancomycin, oxacillin, etc. never reported for GN
    if (GP_ONLY_ABS.has(aLow)) return true;
    // Clindamycin, erythromycin, macrolides — GN intrinsic resistance
    if (
      [
        "clindamycin",
        "erythromycin",
        "azithromycin",
        "clarithromycin",
      ].includes(aLow)
    )
      return true;
  }

  // ── Layer 3b: Colistin / polymyxin for intrinsically-resistant genera ──
  if (GN_CONTEXT_ABS.has(aLow)) {
    if (isGP) return true; // GP organisms — colistin not applicable
    if (COLISTIN_INTRINSIC_RESISTANT.has(genus)) return true;
  }

  // ── Layer 3c: Organism-specific extra rules ───────────────

  // Pseudomonas: ertapenem is intrinsically inactive
  if (bLow.includes("pseudomonas") && aLow === "ertapenem") return true;

  // Stenotrophomonas: carbapenems intrinsically inactive (L1 MBL)
  if (
    bLow.includes("stenotrophomonas") &&
    ["imipenem", "meropenem", "ertapenem", "doripenem"].includes(aLow)
  )
    return true;

  // Enterococcus: cephalosporins, aminoglycosides (routine), TMP-SMX
  // are intrinsically resistant — CLSI data covers most; add catch-all
  if (bLow.includes("enterococcus")) {
    if (
      [
        "cefazolin",
        "ceftriaxone",
        "cefepime",
        "ceftazidime",
        "trimethoprim-sulfamethoxazole",
      ].includes(aLow)
    )
      return true;
  }

  // Proteus / Morganella / Providencia: colistin (already in Layer 3b)
  // Proteus / Morganella: tigecycline intrinsically reduced activity
  if (
    (bLow.includes("proteus") || bLow.includes("morganella")) &&
    aLow === "tigecycline"
  )
    return true;

  return false;
}

// ────────────────────────────────────────────────────────────
// MDR / XDR / PDR — ECDC/CDC 2012
// Magnusson et al. — Clin Microbiol Infect 2012;18(3):268–81
// ────────────────────────────────────────────────────────────

// Per-organism category lists used for classification.
// A "category" = a drug class. Non-susceptible means R or I.
export const ANTIBIOTIC_CATEGORIES = {
  "Pseudomonas aeruginosa": [
    {
      name: "Antipseudomonal penicillins",
      abs: ["Piperacillin-Tazobactam", "Ampicillin-Sulbactam"],
    },
    { name: "Cephalosporins (AP)", abs: ["Ceftazidime", "Cefepime"] },
    { name: "Carbapenems", abs: ["Imipenem", "Meropenem"] },
    { name: "Fluoroquinolones", abs: ["Ciprofloxacin", "Levofloxacin"] },
    { name: "Aminoglycosides", abs: ["Gentamicin", "Tobramycin", "Amikacin"] },
    { name: "Polymyxins", abs: ["Colistin", "Polymyxin B"] },
    { name: "Monobactams", abs: ["Aztreonam"] },
  ],
  "Acinetobacter baumannii": [
    {
      name: "β-lactam/inhibitor combos",
      abs: ["Ampicillin-Sulbactam", "Piperacillin-Tazobactam"],
    },
    { name: "Cephalosporins", abs: ["Ceftazidime", "Cefepime", "Ceftriaxone"] },
    { name: "Carbapenems", abs: ["Imipenem", "Meropenem"] },
    { name: "Fluoroquinolones", abs: ["Ciprofloxacin", "Levofloxacin"] },
    { name: "Aminoglycosides", abs: ["Gentamicin", "Tobramycin", "Amikacin"] },
    { name: "Polymyxins", abs: ["Colistin", "Polymyxin B"] },
    {
      name: "Tetracyclines/Glycylcyclines",
      abs: ["Tigecycline", "Tetracycline", "Doxycycline"],
    },
    { name: "Rifamycins", abs: ["Rifampin"] },
  ],
  // All other Enterobacterales (E. coli, Klebsiella, Enterobacter, Serratia, etc.)
  DEFAULT_GN: [
    { name: "Aminopenicillins", abs: ["Ampicillin", "Amoxicillin"] },
    {
      name: "BL/BLI combos",
      abs: [
        "Amoxicillin-Clavulanate",
        "Ampicillin-Sulbactam",
        "Piperacillin-Tazobactam",
      ],
    },
    {
      name: "Cephalosporins G1-2",
      abs: ["Cefazolin", "Cefuroxime", "Cefoxitin"],
    },
    {
      name: "Cephalosporins G3-4",
      abs: ["Ceftriaxone", "Cefotaxime", "Ceftazidime", "Cefepime"],
    },
    { name: "Carbapenems", abs: ["Imipenem", "Meropenem", "Ertapenem"] },
    {
      name: "Fluoroquinolones",
      abs: ["Ciprofloxacin", "Levofloxacin", "Ofloxacin"],
    },
    {
      name: "Aminoglycosides",
      abs: ["Gentamicin", "Tobramycin", "Amikacin", "Netilmicin"],
    },
    {
      name: "Folate-pathway inhibitors",
      abs: ["Trimethoprim-Sulfamethoxazole"],
    },
    { name: "Polymyxins", abs: ["Colistin", "Polymyxin B"] },
    {
      name: "Tetracyclines",
      abs: ["Tetracycline", "Doxycycline", "Tigecycline"],
    },
  ],
  // Gram-positive organisms
  DEFAULT_GP: [
    { name: "Penicillins", abs: ["Penicillin", "Ampicillin", "Oxacillin"] },
    { name: "BL/BLI combos", abs: ["Amoxicillin-Clavulanate"] },
    { name: "Cephalosporins", abs: ["Cefazolin", "Cefoxitin", "Ceftriaxone"] },
    { name: "Fluoroquinolones", abs: ["Ciprofloxacin", "Levofloxacin"] },
    { name: "Macrolides/Lincosamides", abs: ["Erythromycin", "Clindamycin"] },
    { name: "Glycopeptides", abs: ["Vancomycin", "Teicoplanin"] },
    { name: "Tetracyclines", abs: ["Tetracycline", "Doxycycline"] },
    {
      name: "Folate-pathway inhibitors",
      abs: ["Trimethoprim-Sulfamethoxazole"],
    },
    { name: "Oxazolidinones", abs: ["Linezolid"] },
    { name: "Rifamycins", abs: ["Rifampin"] },
  ],
};

const GRAM_NEG_GENERA = [
  "escherichia",
  "klebsiella",
  "pseudomonas",
  "acinetobacter",
  "enterobacter",
  "proteus",
  "morganella",
  "serratia",
  "citrobacter",
  "stenotrophomonas",
  "haemophilus",
  "moraxella",
  "providencia",
  "burkholderia",
  "chryseobacterium",
  "elizabethkingia",
  "salmonella",
  "shigella",
];

export function getCategoriesForOrganism(bactName) {
  if (!bactName) return ANTIBIOTIC_CATEGORIES.DEFAULT_GN;
  if (ANTIBIOTIC_CATEGORIES[bactName]) return ANTIBIOTIC_CATEGORIES[bactName];
  const n = bactName.toLowerCase();
  for (const gen of GRAM_NEG_GENERA)
    if (n.startsWith(gen)) {
      // Override for PA and AB
      if (n.includes("pseudomonas aeruginosa"))
        return ANTIBIOTIC_CATEGORIES["Pseudomonas aeruginosa"];
      if (n.includes("acinetobacter baumannii"))
        return ANTIBIOTIC_CATEGORIES["Acinetobacter baumannii"];
      return ANTIBIOTIC_CATEGORIES.DEFAULT_GN;
    }
  return ANTIBIOTIC_CATEGORIES.DEFAULT_GP;
}

/**
 * Classify an isolate as PDR / XDR / MDR / Non-MDR.
 * @param {string} bactName
 * @param {Object} sirMap  e.g. { "Ciprofloxacin": "R", "Meropenem": "S", ... }
 * @returns {"PDR"|"XDR"|"MDR"|"Non-MDR"|"Unknown"}
 *
 * Algorithm (ECDC/CDC 2012):
 *  - Count categories that have ≥1 tested antibiotic
 *  - Count categories where ALL tested antibiotics are R/I (non-susceptible)
 *  - Count categories with ≥1 S result (susceptible)
 *  - PDR  : all tested categories are non-susceptible (susceptibleCats == 0) AND testedCats ≥ 3
 *  - XDR  : susceptibleCats ≤ 2 AND testedCats ≥ 4 AND nonSusCats >= testedCats - 2
 *  - MDR  : nonSusCats ≥ 3
 *  - Non-MDR : otherwise
 */
export function classifyMDR(bactName, sirMap) {
  const cats = getCategoriesForOrganism(bactName);
  if (!cats || cats.length === 0) return "Unknown";

  let testedCats = 0,
    nonSusCats = 0,
    susceptibleCats = 0;

  for (const cat of cats) {
    const results = cat.abs
      .map((ab) => sirMap[ab])
      .filter((r) => r === "R" || r === "I" || r === "S");

    if (results.length === 0) continue;
    testedCats++;

    const anyS = results.some((r) => r === "S");
    const allNonSus = results.every((r) => r === "R" || r === "I");

    if (allNonSus) nonSusCats++;
    if (anyS) susceptibleCats++;
  }

  if (testedCats < 2) return "Unknown";
  if (susceptibleCats === 0 && testedCats >= 3) return "PDR";
  if (susceptibleCats <= 2 && testedCats >= 4 && nonSusCats >= testedCats - 2)
    return "XDR";
  if (nonSusCats >= 3) return "MDR";
  return "Non-MDR";
}

/**
 * Build per-isolate MDR classification for a group breakdown.
 * @param {Array} rawTests  - flat test records from processRawData
 * @param {string} groupField - "gender" | "ageGroup"
 * @param {string[]} groups
 * @returns {Object} stats[group] = { total, MDR, XDR, PDR, "Non-MDR", Unknown, mdrPct, xdrPct, pdrPct, nonMdrPct, byBact }
 */
export function buildMDRStats(rawTests, groupField, groups) {
  // Aggregate SIR per isolate (first result wins per antibiotic)
  const isolates = {};
  rawTests.forEach((t) => {
    const isoKey = `${t.patientName}__${t.bacteria}`;
    if (!isolates[isoKey]) {
      isolates[isoKey] = { bact: t.bacteria, group: t[groupField], sir: {} };
    }
    if (!isolates[isoKey].sir[t.antibiotic]) {
      isolates[isoKey].sir[t.antibiotic] = t.result;
    }
  });

  // Initialize stats
  const stats = {};
  groups.forEach((g) => {
    stats[g] = {
      total: 0,
      MDR: 0,
      XDR: 0,
      PDR: 0,
      "Non-MDR": 0,
      Unknown: 0,
      byBact: {},
    };
  });

  Object.values(isolates).forEach((iso) => {
    const g = iso.group;
    if (!g || !stats[g]) return;
    const cls = classifyMDR(iso.bact, iso.sir);
    stats[g].total++;
    stats[g][cls] = (stats[g][cls] || 0) + 1;

    if (!stats[g].byBact[iso.bact]) {
      stats[g].byBact[iso.bact] = {
        total: 0,
        MDR: 0,
        XDR: 0,
        PDR: 0,
        "Non-MDR": 0,
        Unknown: 0,
      };
    }
    stats[g].byBact[iso.bact].total++;
    stats[g].byBact[iso.bact][cls] = (stats[g].byBact[iso.bact][cls] || 0) + 1;
  });

  // Percentages
  groups.forEach((g) => {
    const t = stats[g].total || 1;
    stats[g].mdrPct = Math.round((stats[g].MDR / t) * 100);
    stats[g].xdrPct = Math.round((stats[g].XDR / t) * 100);
    stats[g].pdrPct = Math.round((stats[g].PDR / t) * 100);
    stats[g].nonMdrPct = Math.round((stats[g]["Non-MDR"] / t) * 100);
  });

  return stats;
}

// MDR visual constants
export const MDR_COLORS = {
  PDR: { bg: "#7f1d1d", text: "#fff", border: "#dc2626" },
  XDR: { bg: "#7c2d12", text: "#fff", border: "#ea580c" },
  MDR: { bg: "#713f12", text: "#fff", border: "#ca8a04" },
  "Non-MDR": { bg: "#14532d", text: "#fff", border: "#22c55e" },
  Unknown: { bg: "#374151", text: "#fff", border: "#9ca3af" },
};

// ────────────────────────────────────────────────────────────
// HEATMAP MATRIX CALCULATION
// ────────────────────────────────────────────────────────────

/**
 * Build resistance matrix from flat test records.
 * @param {Array} tests  - filtered rawTests
 * @param {Object} [filter] - { sampleType, department, gender, ageGroup }
 */
export function calcHeatmap(tests, filter = {}) {
  const ft = tests.filter((t) => {
    if (filter.sampleType && t.sampleType !== filter.sampleType) return false;
    if (filter.department && t.department !== filter.department) return false;
    if (filter.gender && t.gender !== filter.gender) return false;
    if (filter.ageGroup && t.ageGroup !== filter.ageGroup) return false;
    return true;
  });

  const matrix = {},
    bacteria = new Set(),
    antibiotics = new Set(),
    isolates = new Set();

  ft.forEach((t) => {
    bacteria.add(t.bacteria);
    antibiotics.add(t.antibiotic);
    isolates.add(`${t.patientName}__${t.bacteria}`);
    const k = `${t.bacteria}|${t.antibiotic}`;
    if (!matrix[k]) matrix[k] = { total: 0, R: 0, I: 0, S: 0 };
    matrix[k].total++;
    matrix[k][t.result]++;
  });

  const pct = {};
  Object.keys(matrix).forEach((k) => {
    const d = matrix[k];
    pct[k] = {
      resistance: Math.round((d.R / d.total) * 100),
      total: d.total,
      R: d.R,
      I: d.I,
      S: d.S,
    };
  });

  return {
    bacteria: [...bacteria].sort(),
    antibiotics: [...antibiotics].sort(),
    matrix: pct,
    totalTests: ft.length,
    totalIsolates: isolates.size,
  };
}

// ────────────────────────────────────────────────────────────
// TIME-SERIES AGGREGATION
// ────────────────────────────────────────────────────────────
export function calcTimeSeries(tests) {
  const dwy = parseDatesWithYear(tests);
  const monthly = {};
  tests.forEach((t, i) => {
    if (!t.date) return;
    const d = parseDate(t.date, i, dwy);
    if (!d || isNaN(d.getTime())) return;
    const y = d.getFullYear();
    if (y < 2018 || y > 2035) return;
    const mk = `${y}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthly[mk]) monthly[mk] = {};
    const k = `${t.bacteria}|${t.antibiotic}`;
    if (!monthly[mk][k]) monthly[mk][k] = { total: 0, R: 0, I: 0, S: 0 };
    monthly[mk][k].total++;
    monthly[mk][k][t.result]++;
  });
  return monthly;
}

// ────────────────────────────────────────────────────────────
// LINEAR REGRESSION (for trend line + CI)
// ────────────────────────────────────────────────────────────
/**
 * @param {{x:number, y:number}[]} points
 * @returns {{ slope, intercept, r2, se, seSl, meanX, sxx } | null}
 */
export function linearRegression(points) {
  if (points.length < 3) return null;
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sumXX - sumX * sumX;
  if (Math.abs(denom) < 1e-10) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const meanX = sumX / n;
  const meanY = sumY / n;
  const ssTot = points.reduce((s, p) => s + (p.y - meanY) ** 2, 0);
  const ssRes = points.reduce(
    (s, p) => s + (p.y - (slope * p.x + intercept)) ** 2,
    0
  );
  const r2 = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
  const se = Math.sqrt(ssRes / Math.max(n - 2, 1));
  const sxx = sumXX - sumX ** 2 / n;
  const seSl = se / Math.sqrt(Math.max(sxx, 1e-10));
  return { slope, intercept, r2, se, seSl, meanX, sxx, n };
}

// ────────────────────────────────────────────────────────────
// WILSON CONFIDENCE INTERVAL (for small n)
// ────────────────────────────────────────────────────────────
export function calcWilsonCI(R, n) {
  if (n >= 30) return null;
  const z = 1.96;
  const nT = n + z * z;
  const pT = (R + (z * z) / 2) / nT;
  const m = z * Math.sqrt((pT * (1 - pT)) / nT);
  return {
    lower: Math.max(0, Math.round((pT - m) * 100)),
    upper: Math.min(100, Math.round((pT + m) * 100)),
  };
}

// ────────────────────────────────────────────────────────────
// QUALITY FLAGS (CLSI M39 compliance)
// ────────────────────────────────────────────────────────────
export function generateFlags(tests, bacteria, antibiotics) {
  const flags = [];

  bacteria.forEach((b) => {
    const bt = tests.filter((t) => t.bacteria === b);
    const isolates = new Set(bt.map((t) => `${t.patientName}__${t.bacteria}`))
      .size;

    if (isolates < 10)
      flags.push({
        level: "error",
        code: "LOW_N",
        bacteria: b,
        n: isolates,
        message: `Very few isolates (n=${isolates})`,
        detail: `${b}: only ${isolates} isolates. CLSI M39 recommends minimum 30 for reliable cumulative antibiogram reporting.`,
      });
    else if (isolates < 30)
      flags.push({
        level: "warn",
        code: "LOW_N",
        bacteria: b,
        n: isolates,
        message: `Needs more isolates (n=${isolates})`,
        detail: `${b}: ${isolates} isolates. CLSI M39 recommends ≥30 — results shown with 95% Wilson CI.`,
      });
  });

  bacteria.forEach((b) => {
    const bt = tests.filter((t) => t.bacteria === b);
    const totalIso = new Set(bt.map((t) => `${t.patientName}__${t.bacteria}`))
      .size;
    antibiotics.forEach((ab) => {
      const abt = bt.filter((t) => t.antibiotic === ab);
      if (totalIso > 0 && abt.length > 0) {
        const cov = abt.length / totalIso;
        if (cov < 0.7)
          flags.push({
            level: "warn",
            code: "LOW_COVERAGE",
            bacteria: b,
            antibiotic: ab,
            coverage: Math.round(cov * 100),
            message: `Low antibiotic coverage`,
            detail: `${b} / ${ab}: only ${
              abt.length
            }/${totalIso} isolates tested (${Math.round(
              cov * 100
            )}%). Results may be biased.`,
          });
      }
    });
  });

  // ── INTRINSIC_MISMATCH: sanity check on CLSI-listed intrinsic agents ──
  // Since isIntrinsicBlank() already drops these during processRawData,
  // this check will fire ONLY for organisms not in the CLSI table above
  // (rare/novel organisms whose genus still matches a known pattern).
  // It alerts the user if S/I results appear for known-intrinsic pairs,
  // which may indicate misidentification or data entry errors.
  bacteria.forEach((b) => {
    const cd = findCLSI(b);
    if (!cd) return;
    (cd.data.intrinsic || []).forEach((ab) => {
      // These should have been removed by isIntrinsicBlank — if any
      // slipped through (unknown genus matching), flag it.
      const bt = tests.filter((t) => t.bacteria === b && t.antibiotic === ab);
      if (bt.length === 0) return; // correctly filtered — no flag needed
      const Rrate = bt.filter((t) => t.result === "R").length / bt.length;
      if (Rrate < 0.9)
        flags.push({
          level: "warn",
          code: "INTRINSIC_MISMATCH",
          bacteria: b,
          antibiotic: ab,
          rate: Math.round(Rrate * 100),
          message: `Intrinsic resistance mismatch`,
          detail: `${b} has intrinsic resistance to ${ab} per CLSI M100, but ${Math.round(
            (1 - Rrate) * 100
          )}% of results are S/I. These results have been excluded from analysis. Possible causes: isolate misidentification, transcription error, or a novel resistance mechanism requiring laboratory review.`,
        });
    });
  });

  return flags;
}

// ────────────────────────────────────────────────────────────
// DATE PARSING
// ────────────────────────────────────────────────────────────
export const AGE_ORDER = [
  "Under 18",
  "18–29",
  "30–44",
  "45–59",
  "60–74",
  "75+",
];

export const getAgeGroup = (age) => {
  if (age < 18) return "Under 18";
  if (age < 30) return "18–29";
  if (age < 45) return "30–44";
  if (age < 60) return "45–59";
  if (age < 75) return "60–74";
  return "75+";
};

export const parseDatesWithYear = (tests) => {
  const out = [];
  tests.forEach((t, i) => {
    if (!t.date) return;
    const s = t.date.toString().trim();
    const m4 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m4) {
      const [, d, mo, y] = m4;
      if (+y >= 2018 && +y <= 2035)
        out.push({ index: i, year: +y, month: +mo, day: +d });
      return;
    }
    const m2 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
    if (m2) {
      const [, d, mo, yy] = m2;
      const y = +yy <= 35 ? 2000 + +yy : 1900 + +yy;
      if (y >= 2018 && y <= 2035)
        out.push({ index: i, year: y, month: +mo, day: +d });
    }
  });
  return out.sort((a, b) => a.index - b.index);
};

export const inferYear = (index, month, dwy) => {
  let bef = null,
    aft = null;
  for (let i = dwy.length - 1; i >= 0; i--) {
    if (dwy[i].index < index) {
      bef = dwy[i];
      break;
    }
  }
  for (let i = 0; i < dwy.length; i++) {
    if (dwy[i].index > index) {
      aft = dwy[i];
      break;
    }
  }
  if (bef && aft) {
    if (bef.year === aft.year) return bef.year;
    if (bef.year + 1 === aft.year) {
      if (month >= 11) return bef.year;
      if (month <= 2) return aft.year;
    }
    return bef.year;
  }
  if (bef) {
    if (month < bef.month && month <= 3 && bef.month >= 11) return bef.year + 1;
    return bef.year;
  }
  if (aft) {
    if (month > aft.month && month >= 11 && aft.month <= 3) return aft.year - 1;
    return aft.year;
  }
  return new Date().getFullYear();
};

export const parseDate = (val, index, dwy) => {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val)) return val;
  if (typeof val === "number" && val > 1000 && val < 100000)
    return new Date(new Date(1899, 11, 30).getTime() + val * 86400000);
  const s = val.toString().trim();
  let day, month, year;
  const m4 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m4) [, day, month, year] = m4;
  else {
    const m2 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
    if (m2) {
      [, day, month] = m2;
      const yy = +m2[3];
      year = yy <= 35 ? 2000 + yy : 1900 + yy;
    } else {
      const m3 = s.match(/^(\d{1,2})\/(\d{1,2})$/);
      if (m3) {
        [, day, month] = m3;
        year = inferYear(index, +month, dwy);
      } else return null;
    }
  }
  if (
    !day ||
    !month ||
    !year ||
    +month < 1 ||
    +month > 12 ||
    +day < 1 ||
    +day > 31 ||
    +year < 2018 ||
    +year > 2035
  )
    return null;
  return new Date(+year, +month - 1, +day);
};

// ────────────────────────────────────────────────────────────
// MAIN DATA PROCESSING PIPELINE
// ────────────────────────────────────────────────────────────
const FC = {
  stt: 0,
  date: 1,
  patientName: 2,
  unk: 3,
  department: 4,
  age: 5,
  gender: 6,
  sampleType: 7,
  bacteria: 8,
  abStart: 9,
};

/**
 * Process raw parsed spreadsheet data into the app data model.
 * @param {{ headers: string[], rows: any[][] }} rawData
 * @returns {ProcessedData}
 */
export function processRawData(rawData) {
  if (!rawData.rows.length) throw new Error("File has no data");

  const rawABNames = rawData.headers
    .slice(FC.abStart)
    .filter((n) => n && n.toString().trim() !== "");
  const abNames = rawABNames.map(normAB).filter(Boolean);

  // ── Deduplicate isolates (CLSI M39: 30-day rule) ─────────
  const isolateMap = new Map();
  rawData.rows.forEach((row, idx) => {
    const date = row[FC.date],
      bacteria = row[FC.bacteria];
    const patient = (row[FC.patientName] || "Unknown").toString().trim();
    if (!bacteria || !date) return;
    const dObj = parseDate(date, idx, []);
    if (!dObj || isNaN(dObj.getTime())) return;
    const key = `${patient}_${bacteria}`;
    const ex = isolateMap.get(key);
    if (!ex) {
      isolateMap.set(key, { row, date: dObj });
      return;
    }
    const diff = Math.abs(dObj - ex.date) / (1000 * 60 * 60 * 24);
    if (diff <= 30) {
      if (dObj < ex.date) isolateMap.set(key, { row, date: dObj });
    } else isolateMap.set(`${key}_${dObj.getTime()}`, { row, date: dObj });
  });

  const originalCount = rawData.rows.length;
  const uniq = [...isolateMap.values()];

  const res = {
    sampleTypes: new Set(),
    bacteria: new Set(),
    departments: new Set(),
    genders: new Set(),
    ageGroups: new Set(),
    antibiotics: abNames,
    rawTests: [],
    heatmaps: {},
    timeSeries: {},
    originalCount,
    uniqueCount: uniq.length,
  };

  uniq.forEach(({ row }) => {
    const date = row[FC.date],
      dept = row[FC.department];
    const age = row[FC.age],
      gender = row[FC.gender];
    const st = row[FC.sampleType],
      bacteria = row[FC.bacteria];
    const patient = (row[FC.patientName] || "Unknown").toString().trim();
    if (st) res.sampleTypes.add(String(st).trim());
    if (bacteria) res.bacteria.add(String(bacteria).trim());
    if (dept) res.departments.add(String(dept).trim());
    if (gender) res.genders.add(String(gender).trim());
    const ag = age && !isNaN(Number(age)) ? getAgeGroup(parseInt(age)) : null;
    if (ag) res.ageGroups.add(ag);

    const bactName = String(bacteria).trim();
    abNames.forEach((ab, ai) => {
      const val = row[FC.abStart + ai];
      if (!val) return;
      const r = val.toString().toUpperCase().trim();
      if (!["R", "I", "S"].includes(r)) return;
      // ── CLSI intrinsic / not-applicable filter ──────────────
      // Applies to every uploaded file, not just demo data.
      // Results for organism × antibiotic pairs that are
      // intrinsically resistant or clinically inapplicable
      // per CLSI are silently dropped here so they never
      // enter heatmap, time-series, or MDR calculations.
      if (isIntrinsicBlank(bactName, ab)) return;
      res.rawTests.push({
        sampleType: st ? String(st).trim() : "Unknown",
        bacteria: bactName,
        department: dept ? String(dept).trim() : "Unknown",
        antibiotic: ab,
        result: r,
        date,
        gender: gender ? String(gender).trim() : null,
        ageGroup: ag,
        patientName: patient,
      });
    });
  });

  if (!res.rawTests.length)
    throw new Error(
      "No valid S/I/R data found. Check that the file structure matches the template (see column guide)."
    );

  res.sampleTypes = [...res.sampleTypes].sort();
  res.bacteria = [...res.bacteria].sort();
  res.departments = [...res.departments].sort();
  res.genders = [...res.genders].sort();
  res.ageGroups = AGE_ORDER.filter((g) => [...res.ageGroups].includes(g));

  // ── Pre-compute heatmaps ──────────────────────────────────
  res.sampleTypes.forEach((st) => {
    res.heatmaps[st] = calcHeatmap(res.rawTests, { sampleType: st });
  });
  res.departments.forEach((d) => {
    res.heatmaps[`dept_${d}`] = calcHeatmap(res.rawTests, { department: d });
  });
  res.sampleTypes.forEach((st) =>
    res.departments.forEach((d) => {
      res.heatmaps[`${st}||${d}`] = calcHeatmap(res.rawTests, {
        sampleType: st,
        department: d,
      });
    })
  );
  res.genders.forEach((g) => {
    res.heatmaps[`gender_${g}`] = calcHeatmap(res.rawTests, { gender: g });
  });
  res.ageGroups.forEach((a) => {
    res.heatmaps[`age_${a}`] = calcHeatmap(res.rawTests, { ageGroup: a });
  });

  res.timeSeries = calcTimeSeries(res.rawTests);
  res.flags = generateFlags(res.rawTests, res.bacteria, res.antibiotics);

  return res;
}

// ────────────────────────────────────────────────────────────
// VISUAL HELPERS (shared across tabs)
// ────────────────────────────────────────────────────────────
export const resistColor = (v) => {
  if (v === 0) return "#15803d";
  if (v <= 20) return "#22c55e";
  if (v <= 40) return "#a3e635";
  if (v <= 60) return "#facc15";
  if (v <= 80) return "#fb923c";
  return "#dc2626";
};
export const resistText = (v) => (v >= 20 && v <= 60 ? "#1f2937" : "#ffffff");
export const abbrevBact = (name) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2)
    return parts[0][0].toUpperCase() + ". " + parts.slice(1).join(" ");
  return name;
};
