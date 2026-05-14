// ============================================================
// simulated.jsx
// Synthetic demo dataset — 30 bacterial species, 20 000 records.
// Key design decisions:
//   • Large unique name pool (5 000+) so dedup doesn't over-collapse
//   • Weights strongly skewed: E. coli ≫ K. pneumoniae ≫ S. aureus >> rest
//   • Resistance profiles based on Vietnam/SEA surveillance 2020–2024
//   • CLSI intrinsic-resistance pairs always produce BLANK (not R/I/S)
//     so they are excluded from analysis automatically
//   • Antibiotics irrelevant to an organism class produce BLANK
// ============================================================

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { normAB } from "./calculate.jsx";

// ────────────────────────────────────────────────────────────
// ANTIBIOTIC COLUMNS IN DEMO / TEMPLATE
// ────────────────────────────────────────────────────────────
export const DEMO_AB = [
  "Ampi",
  "Am/cl",
  "Ampi/sul",
  "Cefa",
  "Cefoxi",
  "Cefta",
  "Ceftri",
  "Cefe",
  "Imi",
  "Mero",
  "Erta",
  "Genta",
  "Amik",
  "Tobra",
  "Cipro",
  "Levo",
  "Trime/Sulfa",
  "Piper/tazo",
  "Van",
  "Line",
  "Nitro",
  "Colis",
  "Oxa",
  "Ery",
  "Clin",
  "Fos",
  "Tige",
  "Doxy",
  "Tetra",
  "Rifa",
  "Chloram",
];

// ────────────────────────────────────────────────────────────
// INTRINSIC / NOT-APPLICABLE PAIRS  →  always blank
// Key: organism name (substring match ok)
// Value: array of DEMO_AB codes that must NOT be reported
// ────────────────────────────────────────────────────────────
const INTRINSIC_BLANK = {
  // Gram-negative: vancomycin, oxacillin, and other GP-only agents never reported
  "Escherichia coli": ["Van", "Oxa", "Ery", "Clin", "Rifa"],
  "Klebsiella pneumoniae": ["Ampi", "Van", "Oxa", "Ery", "Clin", "Rifa"],
  "Klebsiella oxytoca": ["Ampi", "Van", "Oxa", "Ery", "Clin", "Rifa"],
  "Pseudomonas aeruginosa": [
    "Ampi",
    "Am/cl",
    "Cefa",
    "Cefoxi",
    "Ceftri",
    "Erta",
    "Van",
    "Oxa",
    "Ery",
    "Clin",
    "Nitro",
    "Rifa",
    "Tetra",
    "Doxy",
    "Fos",
  ],
  "Acinetobacter baumannii": [
    "Ampi",
    "Am/cl",
    "Cefa",
    "Cefoxi",
    "Ceftri",
    "Erta",
    "Van",
    "Oxa",
    "Ery",
    "Clin",
    "Nitro",
    "Rifa",
    "Tetra",
    "Doxy",
    "Fos",
  ],
  "Enterobacter cloacae": [
    "Ampi",
    "Am/cl",
    "Cefa",
    "Van",
    "Oxa",
    "Ery",
    "Clin",
    "Rifa",
  ],
  "Enterobacter aerogenes": [
    "Ampi",
    "Am/cl",
    "Cefa",
    "Van",
    "Oxa",
    "Ery",
    "Clin",
    "Rifa",
  ],
  "Proteus mirabilis": ["Van", "Oxa", "Ery", "Clin", "Rifa", "Colis"],
  "Proteus vulgaris": ["Ampi", "Van", "Oxa", "Ery", "Clin", "Rifa", "Colis"],
  "Serratia marcescens": [
    "Ampi",
    "Am/cl",
    "Cefa",
    "Colis",
    "Van",
    "Oxa",
    "Ery",
    "Clin",
    "Rifa",
  ],
  "Morganella morganii": [
    "Ampi",
    "Am/cl",
    "Cefa",
    "Colis",
    "Van",
    "Oxa",
    "Ery",
    "Clin",
    "Rifa",
  ],
  "Citrobacter freundii": [
    "Ampi",
    "Am/cl",
    "Van",
    "Oxa",
    "Ery",
    "Clin",
    "Rifa",
  ],
  "Citrobacter koseri": ["Ampi", "Van", "Oxa", "Ery", "Clin", "Rifa"],
  "Stenotrophomonas maltophilia": [
    "Ampi",
    "Am/cl",
    "Ampi/sul",
    "Cefa",
    "Cefoxi",
    "Imi",
    "Mero",
    "Erta",
    "Van",
    "Oxa",
    "Ery",
    "Clin",
  ],
  "Haemophilus influenzae": [
    "Van",
    "Oxa",
    "Ery",
    "Clin",
    "Rifa",
    "Colis",
    "Nitro",
    "Cefoxi",
    "Cefta",
  ],
  "Moraxella catarrhalis": ["Van", "Oxa", "Colis", "Nitro", "Cefoxi", "Cefta"],
  "Providencia stuartii": [
    "Ampi",
    "Am/cl",
    "Colis",
    "Van",
    "Oxa",
    "Ery",
    "Clin",
    "Nitro",
    "Rifa",
  ],
  "Providencia rettgeri": [
    "Ampi",
    "Am/cl",
    "Colis",
    "Van",
    "Oxa",
    "Ery",
    "Clin",
    "Nitro",
    "Rifa",
  ],
  "Burkholderia cepacia": [
    "Ampi",
    "Am/cl",
    "Ampi/sul",
    "Cefa",
    "Cefoxi",
    "Colis",
    "Genta",
    "Amik",
    "Tobra",
    "Van",
    "Oxa",
    "Ery",
    "Clin",
    "Nitro",
  ],
  "Chryseobacterium indologenes": [
    "Ampi",
    "Am/cl",
    "Genta",
    "Amik",
    "Tobra",
    "Colis",
    "Van",
    "Oxa",
    "Ery",
    "Clin",
    "Nitro",
    "Imi",
    "Mero",
    "Erta",
  ],
  "Elizabethkingia meningoseptica": [
    "Ampi",
    "Am/cl",
    "Genta",
    "Amik",
    "Tobra",
    "Colis",
    "Nitro",
    "Imi",
    "Mero",
    "Erta",
  ],
  // Gram-positive: GN-only agents blank
  "Staphylococcus aureus": ["Ampi/sul", "Cefta", "Colis", "Fos"],
  "Staphylococcus epidermidis": ["Ampi/sul", "Cefta", "Colis", "Fos", "Nitro"],
  "Staphylococcus haemolyticus": [
    "Ampi/sul",
    "Cefta",
    "Colis",
    "Fos",
    "Nitro",
    "Genta",
    "Amik",
    "Tobra",
  ],
  "Enterococcus faecalis": ["Oxa", "Cefta", "Colis", "Ampi/sul"],
  "Enterococcus faecium": ["Oxa", "Cefta", "Colis", "Ampi/sul"],
  "Streptococcus pneumoniae": [
    "Oxa",
    "Cefta",
    "Colis",
    "Ampi/sul",
    "Genta",
    "Amik",
    "Tobra",
    "Fos",
    "Nitro",
  ],
  "Streptococcus pyogenes": [
    "Oxa",
    "Cefta",
    "Colis",
    "Ampi/sul",
    "Genta",
    "Amik",
    "Tobra",
    "Fos",
    "Nitro",
  ],
  "Streptococcus agalactiae": [
    "Oxa",
    "Cefta",
    "Colis",
    "Ampi/sul",
    "Genta",
    "Amik",
    "Tobra",
    "Fos",
    "Nitro",
  ],
  "Candida albicans": [
    "Ampi",
    "Am/cl",
    "Ampi/sul",
    "Cefa",
    "Cefoxi",
    "Cefta",
    "Ceftri",
    "Cefe",
    "Imi",
    "Mero",
    "Erta",
    "Genta",
    "Amik",
    "Tobra",
    "Cipro",
    "Levo",
    "Trime/Sulfa",
    "Piper/tazo",
    "Van",
    "Line",
    "Nitro",
    "Colis",
    "Oxa",
    "Ery",
    "Clin",
    "Fos",
    "Tige",
    "Doxy",
    "Tetra",
    "Rifa",
    "Chloram",
  ],
};

// ────────────────────────────────────────────────────────────
// 30 BACTERIA — weights heavily skewed toward top 3
// Total weight ≈ 1 440; E. coli alone = 28%
// ────────────────────────────────────────────────────────────
export const DEMO_BACTERIA = [
  {
    name: "Escherichia coli",
    w: 400,
    st: ["Urine", "Blood", "Wound", "Stool"],
  },
  {
    name: "Klebsiella pneumoniae",
    w: 280,
    st: ["Blood", "Sputum", "Urine", "Wound"],
  },
  {
    name: "Staphylococcus aureus",
    w: 220,
    st: ["Blood", "Wound", "Sputum", "Bone"],
  },
  {
    name: "Pseudomonas aeruginosa",
    w: 110,
    st: ["Sputum", "Blood", "Wound", "Urine"],
  },
  { name: "Acinetobacter baumannii", w: 90, st: ["Sputum", "Blood", "Wound"] },
  { name: "Enterococcus faecalis", w: 60, st: ["Urine", "Blood"] },
  { name: "Enterobacter cloacae", w: 50, st: ["Blood", "Urine", "Sputum"] },
  { name: "Streptococcus pneumoniae", w: 40, st: ["Sputum", "Blood", "CSF"] },
  { name: "Proteus mirabilis", w: 35, st: ["Urine", "Wound", "Blood"] },
  { name: "Serratia marcescens", w: 28, st: ["Blood", "Sputum", "Urine"] },
  { name: "Klebsiella oxytoca", w: 25, st: ["Urine", "Blood", "Wound"] },
  { name: "Enterobacter aerogenes", w: 22, st: ["Blood", "Urine", "Sputum"] },
  { name: "Citrobacter freundii", w: 18, st: ["Urine", "Blood", "Wound"] },
  { name: "Staphylococcus epidermidis", w: 16, st: ["Blood", "Wound", "CSF"] },
  { name: "Morganella morganii", w: 14, st: ["Urine", "Wound"] },
  { name: "Proteus vulgaris", w: 12, st: ["Urine", "Wound"] },
  { name: "Enterococcus faecium", w: 11, st: ["Blood", "Urine"] },
  { name: "Streptococcus pyogenes", w: 10, st: ["Wound", "Throat", "Blood"] },
  { name: "Streptococcus agalactiae", w: 9, st: ["Blood", "CSF", "Urine"] },
  { name: "Citrobacter koseri", w: 8, st: ["Urine", "Blood", "CSF"] },
  { name: "Stenotrophomonas maltophilia", w: 7, st: ["Sputum", "Blood"] },
  { name: "Staphylococcus haemolyticus", w: 6, st: ["Blood", "Wound"] },
  { name: "Providencia stuartii", w: 5, st: ["Urine", "Wound"] },
  { name: "Haemophilus influenzae", w: 5, st: ["Sputum", "Blood", "CSF"] },
  { name: "Moraxella catarrhalis", w: 4, st: ["Sputum"] },
  { name: "Providencia rettgeri", w: 4, st: ["Urine", "Wound"] },
  { name: "Burkholderia cepacia", w: 3, st: ["Sputum", "Blood"] },
  { name: "Chryseobacterium indologenes", w: 3, st: ["Blood", "CSF"] },
  { name: "Elizabethkingia meningoseptica", w: 2, st: ["Blood", "CSF"] },
  { name: "Candida albicans", w: 2, st: ["Blood", "Urine"] },
];

// ────────────────────────────────────────────────────────────
// RESISTANCE PROFILES
// Based on Vietnam ASTS / ANSORP / WHO GLASS 2020–2024
// Only codes that ARE tested for each organism; blanks handled
// separately by INTRINSIC_BLANK above.
// ────────────────────────────────────────────────────────────
const DEMO_RESIST = {
  // ── E. coli (ESBL >50%, FQ >50%, carbapenem <5%) ──────
  "Escherichia coli": {
    Ampi: 0.72,
    "Am/cl": 0.45,
    Cefa: 0.4,
    Cefoxi: 0.2,
    Ceftri: 0.42,
    Cefe: 0.22,
    Imi: 0.04,
    Mero: 0.04,
    Erta: 0.06,
    Genta: 0.35,
    Amik: 0.08,
    Tobra: 0.32,
    Cipro: 0.55,
    Levo: 0.52,
    "Trime/Sulfa": 0.6,
    "Piper/tazo": 0.2,
    Nitro: 0.12,
    Fos: 0.08,
    Tige: 0.04,
    Colis: 0.03,
    Doxy: 0.48,
    Tetra: 0.52,
    Chloram: 0.3,
  },
  // ── K. pneumoniae (ESBL ~55%, CRE 20–25%) ─────────────
  "Klebsiella pneumoniae": {
    Cefa: 0.6,
    Cefoxi: 0.35,
    Ceftri: 0.55,
    Cefe: 0.4,
    Imi: 0.22,
    Mero: 0.22,
    Erta: 0.26,
    Genta: 0.45,
    Amik: 0.15,
    Tobra: 0.42,
    Cipro: 0.5,
    Levo: 0.5,
    "Trime/Sulfa": 0.55,
    "Piper/tazo": 0.35,
    Nitro: 0.55,
    Fos: 0.3,
    Tige: 0.1,
    Colis: 0.05,
    Doxy: 0.52,
    Tetra: 0.55,
    Chloram: 0.35,
    "Ampi/sul": 0.75,
  },
  // ── K. oxytoca ─────────────────────────────────────────
  "Klebsiella oxytoca": {
    Cefa: 0.42,
    Cefoxi: 0.25,
    Ceftri: 0.38,
    Cefe: 0.28,
    Imi: 0.1,
    Mero: 0.1,
    Erta: 0.12,
    Genta: 0.3,
    Amik: 0.1,
    Tobra: 0.28,
    Cipro: 0.35,
    Levo: 0.35,
    "Trime/Sulfa": 0.45,
    "Piper/tazo": 0.25,
    Nitro: 0.45,
    Tige: 0.08,
    Colis: 0.04,
  },
  // ── S. aureus (MRSA ~55–60%, VISA ~2%) ─────────────────
  "Staphylococcus aureus": {
    Oxa: 0.58,
    Cefa: 0.58,
    Cefoxi: 0.58,
    Ery: 0.68,
    Clin: 0.48,
    Cipro: 0.52,
    Levo: 0.52,
    "Trime/Sulfa": 0.28,
    Van: 0.02,
    Line: 0.01,
    Tige: 0.03,
    Rifa: 0.05,
    Doxy: 0.22,
    Tetra: 0.28,
    Chloram: 0.2,
    Genta: 0.42,
    Amik: 0.15,
    Tobra: 0.38, // synergy testing
    Nitro: 0.18,
  },
  // ── S. epidermidis (CoNS, high oxacillin R) ────────────
  "Staphylococcus epidermidis": {
    Oxa: 0.78,
    Cefa: 0.78,
    Cefoxi: 0.78,
    Ery: 0.72,
    Clin: 0.58,
    Cipro: 0.62,
    Levo: 0.62,
    "Trime/Sulfa": 0.42,
    Van: 0.02,
    Line: 0.02,
    Rifa: 0.08,
    Doxy: 0.28,
    Tetra: 0.32,
    Chloram: 0.22,
    Genta: 0.55,
  },
  // ── S. haemolyticus ────────────────────────────────────
  "Staphylococcus haemolyticus": {
    Oxa: 0.82,
    Cefoxi: 0.82,
    Ery: 0.78,
    Clin: 0.6,
    Cipro: 0.68,
    Levo: 0.68,
    Van: 0.06,
    Line: 0.03,
    "Trime/Sulfa": 0.48,
    Rifa: 0.1,
  },
  // ── P. aeruginosa (MDR high; naturally resistant to many) ─
  "Pseudomonas aeruginosa": {
    Cefta: 0.42,
    Cefe: 0.35,
    "Piper/tazo": 0.35,
    Imi: 0.4,
    Mero: 0.35,
    Cipro: 0.4,
    Levo: 0.45,
    Genta: 0.48,
    Amik: 0.22,
    Tobra: 0.38,
    Colis: 0.06,
    Tige: 0.9, // intrinsically reduced susceptibility
  },
  // ── A. baumannii (CRAB 65–70% in Vietnam ICU) ─────────
  "Acinetobacter baumannii": {
    "Ampi/sul": 0.65,
    Cefta: 0.85,
    Cefe: 0.85,
    Imi: 0.68,
    Mero: 0.68,
    Cipro: 0.8,
    Levo: 0.8,
    Genta: 0.75,
    Amik: 0.55,
    Tobra: 0.72,
    Colis: 0.08,
    Tige: 0.25,
    Doxy: 0.62,
    Tetra: 0.65,
    Chloram: 0.5,
    "Trime/Sulfa": 0.75,
  },
  // ── E. faecalis ────────────────────────────────────────
  "Enterococcus faecalis": {
    Ampi: 0.15,
    Van: 0.05,
    Line: 0.01,
    Cipro: 0.6,
    Levo: 0.6,
    Nitro: 0.12,
    Fos: 0.08,
    Genta: 0.88,
    Amik: 0.88, // HLAR
    Ery: 0.6,
    Doxy: 0.45,
    Tetra: 0.5,
    Chloram: 0.28,
    Tige: 0.06,
  },
  // ── E. faecium (VRE ~35%) ──────────────────────────────
  "Enterococcus faecium": {
    Ampi: 0.88,
    Van: 0.38,
    Line: 0.05,
    Cipro: 0.85,
    Levo: 0.82,
    Nitro: 0.22,
    Genta: 0.92,
    Amik: 0.92,
    Ery: 0.72,
    Doxy: 0.55,
    Tetra: 0.6,
    Chloram: 0.32,
    Tige: 0.08,
  },
  // ── Enterobacter cloacae (AmpC inducible) ──────────────
  "Enterobacter cloacae": {
    Ceftri: 0.45,
    Cefe: 0.28,
    "Piper/tazo": 0.4,
    Imi: 0.12,
    Mero: 0.12,
    Erta: 0.15,
    Genta: 0.4,
    Amik: 0.15,
    Tobra: 0.35,
    Cipro: 0.45,
    Levo: 0.45,
    "Trime/Sulfa": 0.5,
    Tige: 0.1,
    Colis: 0.04,
    Doxy: 0.5,
    Tetra: 0.55,
    Chloram: 0.35,
  },
  // ── Enterobacter aerogenes ─────────────────────────────
  "Enterobacter aerogenes": {
    Ceftri: 0.4,
    Cefe: 0.25,
    Imi: 0.1,
    Mero: 0.1,
    Erta: 0.12,
    Genta: 0.35,
    Amik: 0.12,
    Tobra: 0.3,
    Cipro: 0.4,
    Levo: 0.4,
    "Trime/Sulfa": 0.45,
    "Piper/tazo": 0.35,
    Tige: 0.08,
    Colis: 0.04,
  },
  // ── S. pneumoniae ──────────────────────────────────────
  "Streptococcus pneumoniae": {
    Ampi: 0.3,
    "Am/cl": 0.15,
    Cefa: 0.25,
    Ceftri: 0.12,
    Cefe: 0.1,
    Ery: 0.5,
    Clin: 0.35,
    Cipro: 0.3,
    Levo: 0.12,
    Van: 0.0,
    Line: 0.0,
    Doxy: 0.38,
    Tetra: 0.58,
    Chloram: 0.18,
    Tige: 0.02,
  },
  // ── S. pyogenes ────────────────────────────────────────
  "Streptococcus pyogenes": {
    Ampi: 0.02,
    "Am/cl": 0.02,
    Cefa: 0.02,
    Ceftri: 0.02,
    Ery: 0.2,
    Clin: 0.15,
    Van: 0.0,
    Line: 0.0,
    Doxy: 0.12,
    Tetra: 0.2,
    Chloram: 0.08,
    Cipro: 0.18,
    Levo: 0.1,
  },
  // ── S. agalactiae ──────────────────────────────────────
  "Streptococcus agalactiae": {
    Ampi: 0.02,
    "Am/cl": 0.02,
    Cefa: 0.02,
    Ceftri: 0.02,
    Ery: 0.22,
    Clin: 0.18,
    Van: 0.0,
    Line: 0.0,
    Cipro: 0.25,
    Levo: 0.15,
    Doxy: 0.18,
    Tetra: 0.25,
    Chloram: 0.1,
  },
  // ── P. mirabilis ───────────────────────────────────────
  "Proteus mirabilis": {
    Ampi: 0.6,
    "Am/cl": 0.4,
    Cefa: 0.35,
    Cefoxi: 0.3,
    Ceftri: 0.3,
    Cefe: 0.18,
    Imi: 0.05,
    Mero: 0.05,
    Erta: 0.07,
    Genta: 0.35,
    Amik: 0.1,
    Tobra: 0.3,
    Cipro: 0.42,
    Levo: 0.42,
    "Trime/Sulfa": 0.55,
    "Piper/tazo": 0.25,
    Tige: 0.88, // intrinsically resistant to tigecycline
  },
  // ── P. vulgaris ────────────────────────────────────────
  "Proteus vulgaris": {
    Cefa: 0.88,
    Cefoxi: 0.88,
    Ceftri: 0.38,
    Cefe: 0.2,
    Imi: 0.06,
    Mero: 0.06,
    Erta: 0.08,
    Genta: 0.38,
    Amik: 0.12,
    Tobra: 0.32,
    Cipro: 0.45,
    Levo: 0.45,
    "Trime/Sulfa": 0.55,
    "Piper/tazo": 0.3,
  },
  // ── Serratia marcescens ────────────────────────────────
  "Serratia marcescens": {
    Cefoxi: 0.98,
    Ceftri: 0.38,
    Cefe: 0.25,
    "Piper/tazo": 0.35,
    Imi: 0.1,
    Mero: 0.1,
    Erta: 0.12,
    Genta: 0.35,
    Amik: 0.12,
    Tobra: 0.3,
    Cipro: 0.38,
    Levo: 0.38,
    "Trime/Sulfa": 0.45,
    Tige: 0.12,
    Doxy: 0.5,
    Tetra: 0.55,
  },
  // ── Citrobacter freundii (strong AmpC) ─────────────────
  "Citrobacter freundii": {
    Cefa: 0.98,
    Cefoxi: 0.98,
    Ceftri: 0.42,
    Cefe: 0.28,
    Imi: 0.1,
    Mero: 0.1,
    Erta: 0.12,
    Genta: 0.35,
    Amik: 0.12,
    Tobra: 0.3,
    Cipro: 0.4,
    Levo: 0.4,
    "Trime/Sulfa": 0.48,
    "Piper/tazo": 0.35,
    Tige: 0.1,
    Colis: 0.05,
  },
  // ── Citrobacter koseri ─────────────────────────────────
  "Citrobacter koseri": {
    Cefa: 0.32,
    Cefoxi: 0.32,
    Ceftri: 0.3,
    Cefe: 0.18,
    Imi: 0.06,
    Mero: 0.06,
    Erta: 0.08,
    Genta: 0.25,
    Amik: 0.08,
    Tobra: 0.2,
    Cipro: 0.32,
    Levo: 0.32,
    "Trime/Sulfa": 0.4,
    "Piper/tazo": 0.22,
  },
  // ── Morganella morganii ────────────────────────────────
  "Morganella morganii": {
    Cefoxi: 0.98,
    Ceftri: 0.35,
    Cefe: 0.22,
    Imi: 0.08,
    Mero: 0.08,
    Erta: 0.1,
    Genta: 0.32,
    Amik: 0.1,
    Tobra: 0.28,
    Cipro: 0.38,
    Levo: 0.38,
    "Trime/Sulfa": 0.48,
    "Piper/tazo": 0.32,
    Tige: 0.95, // intrinsically reduced
  },
  // ── Stenotrophomonas maltophilia ───────────────────────
  "Stenotrophomonas maltophilia": {
    "Trime/Sulfa": 0.2,
    Levo: 0.22,
    Doxy: 0.28,
    Chloram: 0.3,
    Colis: 0.12,
    Tige: 0.18,
  },
  // ── H. influenzae ──────────────────────────────────────
  "Haemophilus influenzae": {
    Ampi: 0.35,
    "Am/cl": 0.06,
    "Trime/Sulfa": 0.32,
    Cipro: 0.05,
    Levo: 0.05,
    Ceftri: 0.02,
    Cefe: 0.04,
    Chloram: 0.12,
    Doxy: 0.1,
  },
  // ── Moraxella catarrhalis ──────────────────────────────
  "Moraxella catarrhalis": {
    Ampi: 0.95,
    "Am/cl": 0.05,
    "Trime/Sulfa": 0.22,
    Cipro: 0.05,
    Levo: 0.05,
    Ceftri: 0.02,
    Cefe: 0.03,
    Doxy: 0.05,
    Chloram: 0.1,
  },
  // ── Providencia stuartii ───────────────────────────────
  "Providencia stuartii": {
    Ceftri: 0.35,
    Cefe: 0.32,
    Cefoxi: 0.88,
    Imi: 0.18,
    Mero: 0.18,
    Erta: 0.2,
    Genta: 0.55,
    Amik: 0.25,
    Tobra: 0.5,
    Cipro: 0.5,
    Levo: 0.5,
    "Trime/Sulfa": 0.55,
    "Piper/tazo": 0.4,
    Tige: 0.15,
  },
  // ── Providencia rettgeri ───────────────────────────────
  "Providencia rettgeri": {
    Ceftri: 0.32,
    Cefe: 0.28,
    Imi: 0.12,
    Mero: 0.12,
    Erta: 0.15,
    Genta: 0.48,
    Amik: 0.2,
    Tobra: 0.42,
    Cipro: 0.45,
    Levo: 0.45,
    "Trime/Sulfa": 0.5,
    "Piper/tazo": 0.35,
  },
  // ── Burkholderia cepacia ───────────────────────────────
  "Burkholderia cepacia": {
    "Trime/Sulfa": 0.18,
    Levo: 0.22,
    Mero: 0.3,
    Cefta: 0.38,
    Tige: 0.2,
    Doxy: 0.32,
    Chloram: 0.28,
  },
  // ── Chryseobacterium indologenes ───────────────────────
  "Chryseobacterium indologenes": {
    "Trime/Sulfa": 0.25,
    Levo: 0.2,
    Rifa: 0.15,
    Van: 0.1, // paradoxically susceptible to vancomycin (unusual GN)
    Tige: 0.2,
    Doxy: 0.25,
    Chloram: 0.3,
  },
  // ── Elizabethkingia meningoseptica ─────────────────────
  "Elizabethkingia meningoseptica": {
    "Trime/Sulfa": 0.3,
    Levo: 0.25,
    Rifa: 0.15,
    Van: 0.08, // paradoxically susceptible
    Tige: 0.22,
    Doxy: 0.3,
    Chloram: 0.35,
  },
  "Candida albicans": {},
};

// ────────────────────────────────────────────────────────────
// DEPARTMENTS
// ────────────────────────────────────────────────────────────
const DEMO_DEPTS = [
  "ICU",
  "Internal Medicine",
  "Surgery",
  "Pediatrics",
  "Urology",
  "Respiratory",
  "Infectious Disease",
  "Obstetrics",
  "Orthopedics",
  "Hematology",
];
const BACT_DEPT = {
  "Staphylococcus aureus": [
    "Surgery",
    "ICU",
    "Infectious Disease",
    "Orthopedics",
  ],
  "Staphylococcus epidermidis": ["Hematology", "ICU", "Surgery"],
  "Staphylococcus haemolyticus": ["ICU", "Hematology"],
  "Escherichia coli": [
    "Internal Medicine",
    "Urology",
    "Obstetrics",
    "Pediatrics",
  ],
  "Klebsiella pneumoniae": ["Respiratory", "ICU", "Internal Medicine"],
  "Klebsiella oxytoca": ["Internal Medicine", "Urology"],
  "Pseudomonas aeruginosa": ["ICU", "Respiratory"],
  "Acinetobacter baumannii": ["ICU", "Respiratory"],
  "Enterococcus faecalis": ["Urology", "Internal Medicine"],
  "Enterococcus faecium": ["Hematology", "ICU"],
  "Enterobacter cloacae": ["Internal Medicine", "ICU"],
  "Enterobacter aerogenes": ["Internal Medicine", "ICU"],
  "Streptococcus pneumoniae": ["Respiratory", "Pediatrics"],
  "Streptococcus pyogenes": ["Surgery", "Pediatrics", "Infectious Disease"],
  "Streptococcus agalactiae": ["Obstetrics", "Pediatrics"],
  "Proteus mirabilis": ["Urology", "Surgery"],
  "Serratia marcescens": ["ICU", "Respiratory"],
  "Citrobacter freundii": ["Internal Medicine", "ICU"],
  "Stenotrophomonas maltophilia": ["ICU", "Respiratory"],
  "Haemophilus influenzae": ["Respiratory", "Pediatrics"],
  "Burkholderia cepacia": ["Respiratory", "ICU"],
};

// ────────────────────────────────────────────────────────────
// LARGE UNIQUE NAME POOL — prevents over-deduplication
// 50 last × 100 IDs = 5 000 unique patient names
// ────────────────────────────────────────────────────────────
const LAST_NAMES = [
  "Nguyen",
  "Tran",
  "Le",
  "Pham",
  "Hoang",
  "Vu",
  "Do",
  "Phan",
  "Truong",
  "Bui",
  "Dang",
  "Ngo",
  "Ho",
  "Duong",
  "Ly",
  "Dinh",
  "Dao",
  "Luong",
  "Luu",
  "Ha",
  "Mai",
  "Trinh",
  "Lam",
  "Huynh",
  "Cao",
  "Vo",
  "Thai",
  "Nguyen-Tran",
  "Pham-Le",
  "Tran-Nguyen",
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Garcia",
  "Miller",
  "Davis",
  "Wilson",
  "Taylor",
  "Anderson",
  "Thomas",
  "Moore",
  "Jackson",
  "Martin",
  "White",
  "Harris",
  "Thompson",
  "Young",
  "Walker",
  "Hall",
];
const ID_POOL = Array.from({ length: 100 }, (_, i) =>
  String(i + 1).padStart(3, "0")
);

// ────────────────────────────────────────────────────────────
// RANDOM HELPERS
// ────────────────────────────────────────────────────────────
const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const rndI = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pad2 = (n) => String(n).padStart(2, "0");
const wpick = (items) => {
  let t = items.reduce((s, i) => s + i.w, 0),
    r = Math.random() * t;
  for (const i of items) {
    r -= i.w;
    if (r <= 0) return i;
  }
  return items[items.length - 1];
};

// Generate unique-enough patient name
const genName = () => `${rnd(LAST_NAMES)}-${rnd(ID_POOL)}`;

const genDate = (yr, months) => {
  const d = new Date(yr, 0, 1);
  d.setDate(d.getDate() + rndI(0, months * 30 - 1));
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
};

// Get intrinsic-blank set for an organism
const getBlankSet = (bactName) => {
  const n = bactName.toLowerCase();
  for (const [k, v] of Object.entries(INTRINSIC_BLANK)) {
    if (
      n === k.toLowerCase() ||
      (n.includes(k.toLowerCase().split(" ")[0]) &&
        n.includes(k.toLowerCase().split(" ")[1] || ""))
    ) {
      // exact key match preferred
      if (INTRINSIC_BLANK[bactName]) return new Set(INTRINSIC_BLANK[bactName]);
    }
  }
  return new Set(INTRINSIC_BLANK[bactName] || []);
};

const getSIR = (bact, ab, blankSet) => {
  // Always blank for intrinsic/not-applicable combos
  if (blankSet.has(ab)) return "";

  const p = DEMO_RESIST[bact] || {};
  const r = p[ab];

  // Not in resistance table → mostly blank (organism doesn't routinely test this)
  if (r === undefined)
    return Math.random() < 0.7 ? "" : Math.random() < 0.5 ? "S" : "R";

  const x = Math.random();
  // Add small intermediate zone (realistic)
  if (x < r) return "R";
  if (x < r + 0.06) return "I";
  return "S";
};

// ────────────────────────────────────────────────────────────
// MAIN BUILDER
// ────────────────────────────────────────────────────────────
/**
 * Build synthetic dataset.
 * n=20000, yr=2023, months=24 by default.
 */
export function buildSampleData(n = 20000, yr = 2023, months = 24) {
  const header = [
    "NO",
    "DATE",
    "PATIENT NAME",
    "",
    "DEPARTMENT",
    "AGE",
    "GENDER",
    "SPECIMEN TYPE",
    "ORGANISM",
    ...DEMO_AB,
  ];
  const rows = [header];
  // Pre-cache blank sets per organism for performance
  const blankCache = {};
  DEMO_BACTERIA.forEach((b) => {
    blankCache[b.name] = getBlankSet(b.name);
  });

  for (let i = 0; i < n; i++) {
    const bact = wpick(DEMO_BACTERIA);
    const st = rnd(bact.st);
    const dept = rnd(BACT_DEPT[bact.name] || DEMO_DEPTS);
    const blankSet = blankCache[bact.name];
    rows.push([
      i + 1,
      genDate(yr, months),
      genName(), // large unique pool
      "",
      dept,
      rndI(1, 90),
      Math.random() < 0.52 ? "Male" : "Female",
      st,
      bact.name,
      ...DEMO_AB.map((ab) => getSIR(bact.name, ab, blankSet)),
    ]);
  }
  return { headers: rows[0], rows: rows.slice(1) };
}

// ────────────────────────────────────────────────────────────
// TEMPLATE DOWNLOAD
// ────────────────────────────────────────────────────────────
export async function downloadTemplate() {
  const header = [
    "NO",
    "DATE",
    "PATIENT NAME",
    "(skip)",
    "DEPARTMENT",
    "AGE",
    "GENDER",
    "SPECIMEN TYPE",
    "ORGANISM",
    ...DEMO_AB,
  ];
  const example = [
    1,
    "15/03/2024",
    "Nguyen-001",
    "",
    "ICU",
    45,
    "Male",
    "Blood",
    "Escherichia coli",
    ...DEMO_AB.map(() => rnd(["S", "S", "I", "R", "", "S"])),
  ];
  const note = [
    "",
    "← dd/mm/yyyy",
    "← Patient name (dedup)",
    "",
    "← Department",
    "← Integer",
    "← Male/Female",
    "← Specimen type",
    "← Full organism name",
    ...DEMO_AB.map((ab) => `← ${normAB(ab) || ab}`),
  ];
  const ws = XLSX.utils.aoa_to_sheet([header, example, note]);
  ws["!cols"] = header.map((_, i) => ({ wch: i < 9 ? 24 : 10 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, "antibiogram_template.xlsx");
}

// ────────────────────────────────────────────────────────────
// SHARED STYLE TOKENS
// ────────────────────────────────────────────────────────────
export const S = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#eff6ff,#eef2ff)",
    padding: "8px",
    fontFamily: "system-ui,-apple-system,sans-serif",
    fontSize: 14,
    color: "#1f2937",
  },
  wrap: { maxWidth: 1500, margin: "0 auto" },
  card: {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,.07)",
    padding: 20,
    marginBottom: 16,
  },
  btn: (bg = "#2563eb", tc = "#fff") => ({
    padding: "8px 16px",
    background: bg,
    color: tc,
    border: "none",
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  }),
  btnOut: {
    padding: "8px 16px",
    background: "#fff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: 7,
    fontSize: 13,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  inp: {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #d1d5db",
    borderRadius: 7,
    fontSize: 13,
    boxSizing: "border-box",
    color: "#1f2937",
    background: "#fff",
  },
  lbl: {
    display: "block",
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    fontWeight: 500,
  },
  tab: (on) => ({
    padding: "8px 14px",
    background: on ? "#2563eb" : "transparent",
    color: on ? "#fff" : "#6b7280",
    border: "none",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: "nowrap",
  }),
  badge: (bg, tc) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: bg,
    color: tc,
    borderRadius: 5,
    padding: "2px 8px",
    fontSize: 11,
    fontWeight: 600,
  }),
};

// ────────────────────────────────────────────────────────────
// UPLOAD SCREEN
// ────────────────────────────────────────────────────────────
export function UploadScreen({ onLoadSample, onLoadFile, loading, loadError }) {
  const [drag, setDrag] = useState(false);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext)) {
      alert("Only .xlsx, .xls or .csv files are supported");
      return;
    }
    onLoadFile(file);
  };

  return (
    <div style={S.page}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .drop-zone:hover{border-color:#2563eb!important;background:#f0f7ff!important;}`}</style>
      <div style={{ ...S.wrap, maxWidth: 900 }}>
        {/* Header */}
        <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
          <div
            style={{
              width: 60,
              height: 60,
              background: "#2563eb",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              margin: "0 0 6px",
              color: "#1e3a5f",
            }}
          >
            Antibiogram Analyzer
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
            Hospital Microbiology · Resistance Surveillance · CLSI M39 ·
            MDR/XDR/PDR (ECDC 2012)
          </p>
        </div>

        {/* Privacy notice */}
        <div
          style={{
            ...S.card,
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            padding: "12px 16px",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2"
              style={{ flexShrink: 0, marginTop: 1 }}
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div style={{ fontSize: 12, color: "#166534", lineHeight: 1.7 }}>
              <strong>Privacy & Data Security:</strong> This app runs entirely
              in your browser (client-side only). Your Excel file is processed
              locally — <strong>never uploaded to any server</strong>. All data
              is erased when you close or refresh the tab.
            </div>
          </div>
        </div>

        {/* Upload + Demo */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          {/* Upload */}
          <div style={S.card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
              📂 Upload Your File
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#6b7280",
                marginBottom: 14,
                lineHeight: 1.6,
              }}
            >
              Supports <strong>.xlsx / .xls / .csv</strong>. Real hospital data
              — processed in-browser, never transmitted.
            </div>
            <div
              className="drop-zone"
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                handleFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${drag ? "#2563eb" : "#d1d5db"}`,
                borderRadius: 10,
                padding: "32px 16px",
                textAlign: "center",
                cursor: "pointer",
                background: drag ? "#f0f7ff" : "#f8fafc",
                transition: "all .2s",
                marginBottom: 10,
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="1.5"
                style={{ margin: "0 auto 10px", display: "block" }}
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <div
                style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}
              >
                Drag & drop file here
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>
                or click to select
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {loadError && (
              <div
                style={{
                  marginTop: 8,
                  padding: "8px 12px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 6,
                  fontSize: 12,
                  color: "#dc2626",
                }}
              >
                {loadError}
              </div>
            )}
            {loading && (
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "#2563eb",
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid #2563eb",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                Reading file...
              </div>
            )}
          </div>

          {/* Demo */}
          <div
            style={{
              ...S.card,
              border: "2px solid #bfdbfe",
              background: "#f0f7ff",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 4,
                color: "#1e40af",
              }}
            >
              🧪 Run Demo Data
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#3b5998",
                marginBottom: 8,
                lineHeight: 1.6,
              }}
            >
              <strong>20 000 simulated records</strong> — 30 species, 31
              antibiotics, 24 months. E. coli / K. pneumoniae / S. aureus
              dominate (~55% combined). Resistance profiles match Vietnam/SEA
              surveillance 2020–2024. Intrinsic-resistance antibiotic pairs are
              left blank per CLSI M39.
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 5,
                marginBottom: 14,
              }}
            >
              {[
                "E. coli ~28%",
                "K. pneumoniae ~20%",
                "S. aureus ~15%",
                "P. aeruginosa ~8%",
                "A. baumannii ~6%",
                "+ 25 more",
              ].map((b) => (
                <span
                  key={b}
                  style={{ ...S.badge("#dbeafe", "#1e40af"), fontSize: 10 }}
                >
                  {b}
                </span>
              ))}
            </div>
            <button style={S.btn()} onClick={onLoadSample} disabled={loading}>
              {loading ? (
                <>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      border: "2px solid #fff",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />{" "}
                  Generating 20k records…
                </>
              ) : (
                "▶ Run Demo Now"
              )}
            </button>
          </div>
        </div>

        {/* Column guide */}
        <div style={S.card}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              📋 Required File Structure
            </div>
            <button style={S.btn("#059669")} onClick={downloadTemplate}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Template (.xlsx)
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Col", "Header", "Required", "Example", "Notes"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "7px 10px",
                          textAlign: "left",
                          borderBottom: "2px solid #e5e7eb",
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {[
                  ["A", "NO", "No", "1,2,3…", "Serial number — optional"],
                  [
                    "B",
                    "DATE",
                    "Yes",
                    "15/03/2024",
                    "Collection date: dd/mm/yyyy or dd/mm",
                  ],
                  [
                    "C",
                    "PATIENT NAME",
                    "Yes",
                    "Nguyen-001",
                    "Patient name — used for duplicate isolate filtering (CLSI M39 30-day rule)",
                  ],
                  ["D", "(skip)", "No", "—", "App ignores this column"],
                  [
                    "E",
                    "DEPARTMENT",
                    "No",
                    "ICU",
                    "Department (leave blank if unavailable)",
                  ],
                  [
                    "F",
                    "AGE",
                    "No",
                    "45",
                    "Integer age (leave blank if unavailable)",
                  ],
                  [
                    "G",
                    "GENDER",
                    "No",
                    "Male / Female",
                    "Gender (leave blank if unavailable)",
                  ],
                  [
                    "H",
                    "SPECIMEN TYPE",
                    "Yes",
                    "Blood",
                    "Specimen / sample type",
                  ],
                  [
                    "I",
                    "ORGANISM",
                    "Yes",
                    "Escherichia coli",
                    "Full organism name (as reported by lab)",
                  ],
                  [
                    "J+",
                    "[Antibiotic name]",
                    "Yes",
                    "S / I / R",
                    "From column J onward — one antibiotic per column; blank = not tested",
                  ],
                ].map(([col, name, req, ex, note], i) => (
                  <tr
                    key={col}
                    style={{ background: i % 2 ? "#f9fafb" : "#fff" }}
                  >
                    <td
                      style={{
                        padding: "6px 10px",
                        border: "1px solid #f3f4f6",
                        fontWeight: 700,
                        fontFamily: "monospace",
                      }}
                    >
                      {col}
                    </td>
                    <td
                      style={{
                        padding: "6px 10px",
                        border: "1px solid #f3f4f6",
                        fontFamily: "monospace",
                        fontSize: 11,
                      }}
                    >
                      {name}
                    </td>
                    <td
                      style={{
                        padding: "6px 10px",
                        border: "1px solid #f3f4f6",
                      }}
                    >
                      <span
                        style={{
                          ...S.badge(
                            req === "Yes" ? "#dbeafe" : "#dcfce7",
                            req === "Yes" ? "#1e40af" : "#166534"
                          ),
                        }}
                      >
                        {req}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "6px 10px",
                        border: "1px solid #f3f4f6",
                        color: "#6b7280",
                      }}
                    >
                      {ex}
                    </td>
                    <td
                      style={{
                        padding: "6px 10px",
                        border: "1px solid #f3f4f6",
                        color: "#6b7280",
                      }}
                    >
                      {note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            style={{
              marginTop: 12,
              padding: 10,
              background: "#fefce8",
              borderRadius: 7,
              fontSize: 12,
              color: "#78350f",
              lineHeight: 1.8,
            }}
          >
            <strong>Accepted antibiotic column headers (short codes):</strong>
            &nbsp;
            {DEMO_AB.map((a) => (
              <span
                key={a}
                style={{
                  display: "inline-block",
                  background: "#fef3c7",
                  color: "#92400e",
                  border: "1px solid #fcd34d",
                  borderRadius: 4,
                  padding: "1px 6px",
                  fontSize: 11,
                  margin: "2px 2px 2px 0",
                }}
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
