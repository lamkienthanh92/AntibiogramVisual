// ============================================================
// microbeInfo.jsx
// Educational reference database — bacteria & antibiotics.
// Used by InfoSheet popup when clicking heatmap cells.
// All content translated to English; data structure preserved.
// ============================================================

// ════════════════════════════════════════════════════════════
// BACTERIA DATABASE
// ════════════════════════════════════════════════════════════
export const BACTERIA_INFO = {
  "Escherichia coli": {
    commonName: "E. coli",
    gramStain: "Gram-negative",
    shape: "Rod (bacillus)",
    family: "Enterobacteriaceae",
    oxygen: "Facultative anaerobe",
    color: "#3b82f6",
    icon: "🦠",
    summary:
      "The most common enteric bacterium, frequently causing urinary tract infections, bloodstream infections, and neonatal meningitis. A leading cause of community-acquired and hospital-acquired infections worldwide.",
    clinicalSites: [
      "Urinary tract",
      "Blood",
      "CSF (neonates)",
      "Wound",
      "GI tract",
    ],
    resistanceMechanisms: [
      {
        name: "ESBL",
        desc: "Extended-spectrum β-lactamase — destroys 3rd/4th-generation cephalosporins and penicillins. Prevalence >50% in many Vietnamese hospitals.",
      },
      {
        name: "Carbapenemase (KPC, NDM)",
        desc: "Resistance to carbapenems — the last-resort β-lactams. NDM-1 is rapidly spreading across Asia.",
      },
      {
        name: "AmpC β-lactamase",
        desc: "Confers resistance to 1st–2nd generation cephalosporins and cefoxitin.",
      },
      {
        name: "Quinolone resistance (QRDR)",
        desc: "Mutations in gyrA/parC genes lead to fluoroquinolone resistance.",
      },
    ],
    clsiNotes:
      "CLSI M100 recommends reporting Tier 1 agents (ampicillin, cefazolin, ciprofloxacin…) first. Report carbapenems only when ESBL is confirmed or Tier 1–2 agents are resistant.",
    refs: [
      { label: "CDC — E. coli", url: "https://www.cdc.gov/ecoli/index.html" },
      {
        label: "CLSI M100 (Enterobacterales)",
        url: "https://clsi.org/standards/products/microbiology/documents/m100/",
      },
    ],
  },

  "Klebsiella pneumoniae": {
    commonName: "K. pneumoniae",
    gramStain: "Gram-negative",
    shape: "Encapsulated rod",
    family: "Enterobacteriaceae",
    oxygen: "Facultative anaerobe",
    color: "#8b5cf6",
    icon: "🦠",
    summary:
      "A leading cause of hospital-acquired pneumonia, bacteraemia, and UTI, especially in immunocompromised patients. Hypervirulent strains cause community-acquired liver abscess even in healthy hosts.",
    clinicalSites: ["Lung", "Blood", "Urinary tract", "Liver (abscess)"],
    resistanceMechanisms: [
      {
        name: "ESBL",
        desc: "ESBL-KP prevalence >50% in Vietnam. Resistant to all cephalosporins and penicillins.",
      },
      {
        name: "KPC / NDM / OXA-48",
        desc: "Carbapenem-resistant K. pneumoniae (CRKP) — a critical global threat with high mortality.",
      },
      {
        name: "Hypervirulent strain (hvKP)",
        desc: "Thick capsule enables disseminated infection (liver abscess, endophthalmitis) without immunosuppression.",
      },
      {
        name: "Colistin resistance (mcr-1)",
        desc: "Plasmid-mediated colistin resistance — signals pan-drug resistance.",
      },
    ],
    clsiNotes:
      "Ampicillin = intrinsic resistance; do not report. Cefazolin may be reported for uncomplicated UTI only.",
    refs: [
      {
        label: "CDC — K. pneumoniae",
        url: "https://www.cdc.gov/HAI/organisms/klebsiella/klebsiella.html",
      },
      {
        label: "WHO Priority Pathogen",
        url: "https://www.who.int/publications/i/item/WHO-EMP-IAU-2017.12",
      },
    ],
  },

  "Klebsiella oxytoca": {
    commonName: "K. oxytoca",
    gramStain: "Gram-negative",
    shape: "Rod",
    family: "Enterobacteriaceae",
    oxygen: "Facultative anaerobe",
    color: "#7c3aed",
    icon: "🦠",
    summary:
      "Similar to K. pneumoniae but produces indole. Associated with antibiotic-associated haemorrhagic colitis. Opportunistic pathogen in hospitalised patients.",
    clinicalSites: ["Urinary tract", "Blood", "Wound", "Colitis (AAC)"],
    resistanceMechanisms: [
      {
        name: "Inducible AmpC",
        desc: "Chromosomal AmpC; can de-repress during cephalosporin therapy.",
      },
      {
        name: "ESBL",
        desc: "Less common than K. pneumoniae but increasingly reported.",
      },
    ],
    clsiNotes:
      "Ampicillin = intrinsic resistance. Treat like other Enterobacterales.",
    refs: [
      {
        label: "CLSI M100",
        url: "https://clsi.org/standards/products/microbiology/documents/m100/",
      },
    ],
  },

  "Staphylococcus aureus": {
    commonName: "S. aureus / MRSA",
    gramStain: "Gram-positive",
    shape: "Cluster coccus (grape-like)",
    family: "Staphylococcaceae",
    oxygen: "Facultative anaerobe",
    color: "#f59e0b",
    icon: "🔴",
    summary:
      "The leading cause of skin/soft tissue, bone, and cardiac valve infections. MRSA (methicillin-resistant) is one of the most dangerous antimicrobial-resistant pathogens globally.",
    clinicalSites: [
      "Skin & soft tissue",
      "Blood",
      "Endocarditis",
      "Bone & joint",
      "Lung",
    ],
    resistanceMechanisms: [
      {
        name: "MRSA (mecA gene)",
        desc: "Encodes PBP2a — resistance to ALL β-lactams except ceftaroline. Screen with oxacillin or cefoxitin disc.",
      },
      {
        name: "Vancomycin resistance (VRSA/VISA)",
        desc: "Rare but extremely dangerous. VISA (MIC 4–8 µg/mL) is difficult to treat.",
      },
      {
        name: "Inducible Clindamycin Resistance (iMLSB)",
        desc: "Requires D-zone test before prescribing clindamycin, even when susceptibility report says 'S'.",
      },
      {
        name: "CA-MRSA (community)",
        desc: "Often carries PVL toxin; causes skin abscesses and necrotising pneumonia in young healthy individuals.",
      },
    ],
    clsiNotes:
      "Use cefoxitin disc to screen for MRSA (more sensitive than oxacillin). If cefoxitin R → report oxacillin R and all β-lactams resistant.",
    refs: [
      { label: "CDC — MRSA", url: "https://www.cdc.gov/mrsa/index.html" },
      {
        label: "CLSI M100 — Staphylococcus",
        url: "https://clsi.org/standards/products/microbiology/documents/m100/",
      },
    ],
  },

  "Staphylococcus epidermidis": {
    commonName: "S. epidermidis",
    gramStain: "Gram-positive",
    shape: "Cluster coccus",
    family: "Staphylococcaceae",
    oxygen: "Facultative anaerobe",
    color: "#d97706",
    icon: "🔶",
    summary:
      "Coagulase-negative staphylococcus; major cause of prosthetic device and central-line infections. Intrinsically good at forming biofilm.",
    clinicalSites: [
      "Blood (CLABSI)",
      "Prosthetic devices",
      "CSF shunts",
      "Wound",
    ],
    resistanceMechanisms: [
      {
        name: "Oxacillin resistance (mecA)",
        desc: "Most hospital isolates are oxacillin-resistant. Treat as MRSA with vancomycin.",
      },
      {
        name: "Biofilm",
        desc: "Biofilm formation protects from antibiotics and immune clearance; device removal often required.",
      },
    ],
    clsiNotes:
      "Distinguish true infection from contaminant (multiple positive cultures, clinical context).",
    refs: [
      {
        label: "CDC — CoNS",
        url: "https://www.cdc.gov/hai/organisms/cons.html",
      },
    ],
  },

  "Staphylococcus haemolyticus": {
    commonName: "S. haemolyticus",
    gramStain: "Gram-positive",
    shape: "Cluster coccus",
    family: "Staphylococcaceae",
    oxygen: "Facultative anaerobe",
    color: "#b45309",
    icon: "🔶",
    summary:
      "Coagulase-negative staphylococcus with the highest intrinsic resistance among CoNS. Frequently multidrug-resistant including vancomycin tolerance.",
    clinicalSites: ["Blood", "Peritoneal dialysis", "Wound"],
    resistanceMechanisms: [
      {
        name: "Oxacillin + glycopeptide resistance",
        desc: "Can develop tolerance/resistance to vancomycin and teicoplanin — especially concerning in dialysis patients.",
      },
    ],
    clsiNotes:
      "Often pan-resistant to many common agents; linezolid usually retained.",
    refs: [],
  },

  "Pseudomonas aeruginosa": {
    commonName: "P. aeruginosa",
    gramStain: "Gram-negative",
    shape: "Rod",
    family: "Pseudomonadaceae",
    oxygen: "Obligate aerobe",
    color: "#10b981",
    icon: "🌿",
    summary:
      "Environmental opportunist; especially dangerous in ICU, cystic fibrosis, burns, and immunosuppressed patients. High intrinsic resistance and biofilm-forming capacity.",
    clinicalSites: [
      "Lung (ICU, cystic fibrosis)",
      "Blood",
      "Wound/burns",
      "Urinary tract",
      "External ear",
    ],
    resistanceMechanisms: [
      {
        name: "Broad intrinsic resistance",
        desc: "Naturally resistant to ampicillin, amoxicillin, cefazolin, cefuroxime, ertapenem, TMP-SMX. Outer membrane has low permeability.",
      },
      {
        name: "AmpC derepression",
        desc: "Derepression of chromosomal AmpC → resistance to cephalosporins emerging during therapy.",
      },
      {
        name: "Carbapenemase (VIM, IMP, NDM)",
        desc: "Metallo-β-lactamases conferring resistance to imipenem and meropenem.",
      },
      {
        name: "Efflux pump overexpression",
        desc: "MexAB-OprM and MexXY pumps simultaneously expel multiple antibiotic classes.",
      },
      {
        name: "OprD porin loss",
        desc: "Selective loss of OprD → imipenem resistance; meropenem may remain susceptible.",
      },
    ],
    clsiNotes:
      "Gentamicin has no CLSI breakpoint for P. aeruginosa since M100-S29. Ertapenem = intrinsic resistance — never test or report.",
    refs: [
      {
        label: "CDC — P. aeruginosa",
        url: "https://www.cdc.gov/hai/organisms/pseudomonas.html",
      },
      {
        label: "IDSA — Pseudomonas Guide",
        url: "https://www.idsociety.org/practice-guideline/gram-negative-pathogens/",
      },
    ],
  },

  "Acinetobacter baumannii": {
    commonName: "A. baumannii / CRAB",
    gramStain: "Gram-negative",
    shape: "Coccobacillus",
    family: "Moraxellaceae",
    oxygen: "Aerobe",
    color: "#ef4444",
    icon: "⚠️",
    summary:
      "WHO PRIORITY 1 CRITICAL pathogen. Common in ICU settings causing VAP and bacteraemia with high mortality. Survives for extended periods on hospital surfaces.",
    clinicalSites: ["Lung (VAP)", "Blood", "Surgical wound", "Urinary tract"],
    resistanceMechanisms: [
      {
        name: "OXA carbapenemase (OXA-23, OXA-51)",
        desc: "Dominant carbapenem-resistance mechanism in Asia. OXA-51 is a species identification marker.",
      },
      {
        name: "NDM-1 metallo-β-lactamase",
        desc: "Resistance to all β-lactams including carbapenems, often co-transferred with aminoglycoside and fluoroquinolone resistance.",
      },
      {
        name: "Efflux pumps + porin loss",
        desc: "Combination of mechanisms → MDR, XDR, or PDR phenotypes.",
      },
      {
        name: "Colistin resistance (pmrCAB)",
        desc: "Mutational colistin resistance eliminates the last treatment option.",
      },
    ],
    clsiNotes:
      "CRAB: usually only colistin/polymyxin B or tigecycline combinations remain active. Infectious disease consultation strongly recommended.",
    refs: [
      {
        label: "WHO Priority Pathogen List",
        url: "https://www.who.int/publications/i/item/WHO-EMP-IAU-2017.12",
      },
      {
        label: "CDC — Acinetobacter",
        url: "https://www.cdc.gov/hai/organisms/acinetobacter.html",
      },
    ],
  },

  "Enterococcus faecalis": {
    commonName: "E. faecalis",
    gramStain: "Gram-positive",
    shape: "Coccus (pairs/chains)",
    family: "Enterococcaceae",
    oxygen: "Facultative anaerobe",
    color: "#6366f1",
    icon: "🔵",
    summary:
      "Normal gut flora that causes UTI, endocarditis, and intra-abdominal infections. Has broad intrinsic resistance; synergistic bactericidal combinations required for endocarditis.",
    clinicalSites: [
      "Urinary tract",
      "Blood",
      "Heart valve",
      "Abdomen",
      "Wound",
    ],
    resistanceMechanisms: [
      {
        name: "Intrinsic resistance",
        desc: "Naturally resistant to cephalosporins, low-dose aminoglycosides, clindamycin, TMP-SMX. Do not report these agents.",
      },
      {
        name: "VRE (vanA/vanB)",
        desc: "Vancomycin-resistant Enterococcus — major nosocomial infection control concern.",
      },
      {
        name: "HLAR (High-Level Aminoglycoside Resistance)",
        desc: "Abolishes synergistic bactericidal effect of aminoglycoside + β-lactam combinations in endocarditis.",
      },
    ],
    clsiNotes:
      "For endocarditis, test HLAR (high-dose gentamicin and streptomycin) to assess combination therapy eligibility. Ampicillin is the drug of choice if susceptible.",
    refs: [
      {
        label: "CDC — VRE",
        url: "https://www.cdc.gov/hai/organisms/vre/vre.html",
      },
    ],
  },

  "Enterococcus faecium": {
    commonName: "E. faecium",
    gramStain: "Gram-positive",
    shape: "Coccus (pairs/chains)",
    family: "Enterococcaceae",
    oxygen: "Facultative anaerobe",
    color: "#4f46e5",
    icon: "🔵",
    summary:
      "More drug-resistant than E. faecalis. High rates of ampicillin resistance and VRE, particularly in haematology/oncology settings. Linezolid or daptomycin often required.",
    clinicalSites: ["Blood", "Urinary tract", "Abdomen"],
    resistanceMechanisms: [
      {
        name: "Ampicillin resistance",
        desc: "Most hospital E. faecium are ampicillin-resistant (>80%).",
      },
      {
        name: "VRE (vanA dominates)",
        desc: "vanA confers high-level resistance to both vancomycin and teicoplanin.",
      },
    ],
    clsiNotes:
      "Ampicillin intrinsically less active than for E. faecalis. Vancomycin-resistant strains require linezolid or daptomycin.",
    refs: [],
  },

  "Enterobacter cloacae": {
    commonName: "E. cloacae",
    gramStain: "Gram-negative",
    shape: "Rod",
    family: "Enterobacteriaceae",
    oxygen: "Facultative anaerobe",
    color: "#0ea5e9",
    icon: "🦠",
    summary:
      "Important nosocomial pathogen notable for emerging resistance during cephalosporin therapy due to inducible AmpC β-lactamase. A member of the ESKAPE group.",
    clinicalSites: ["Blood", "Urinary tract", "Lung", "Wound"],
    resistanceMechanisms: [
      {
        name: "Inducible AmpC",
        desc: "Chromosomal ampC can be de-repressed during cephalosporin therapy → clinical failure despite initial susceptibility.",
      },
      {
        name: "ESBL",
        desc: "Can acquire ESBL plasmids in addition to intrinsic AmpC.",
      },
      {
        name: "Carbapenemase (KPC, NDM)",
        desc: "Increasingly common in ICU settings; limits therapeutic options.",
      },
    ],
    clsiNotes:
      "CLSI cautions: 3rd-generation cephalosporins should be avoided for serious Enterobacter infections even if in-vitro susceptible, due to AmpC induction risk. Prefer cefepime or carbapenems.",
    refs: [
      {
        label: "CLSI M100 — AmpC warning",
        url: "https://clsi.org/standards/products/microbiology/documents/m100/",
      },
    ],
  },

  "Enterobacter aerogenes": {
    commonName: "E. aerogenes (Klebsiella aerogenes)",
    gramStain: "Gram-negative",
    shape: "Rod",
    family: "Enterobacteriaceae",
    oxygen: "Facultative anaerobe",
    color: "#0284c7",
    icon: "🦠",
    summary:
      "Reclassified as Klebsiella aerogenes. Similar resistance profile to E. cloacae with inducible AmpC; common in ICU bloodstream infections.",
    clinicalSites: ["Blood", "Urine", "Sputum"],
    resistanceMechanisms: [
      {
        name: "Inducible AmpC",
        desc: "Same concern as E. cloacae — avoid 3rd-gen cephalosporins for severe infections.",
      },
      {
        name: "ESBL & KPC",
        desc: "Emerging carbapenem resistance in endemic regions.",
      },
    ],
    clsiNotes:
      "Treat like E. cloacae. Prefer cefepime or carbapenem for serious infections.",
    refs: [],
  },

  "Streptococcus pneumoniae": {
    commonName: "Pneumococcus",
    gramStain: "Gram-positive",
    shape: "Lancet-shaped diplococcus (encapsulated)",
    family: "Streptococcaceae",
    oxygen: "Facultative anaerobe",
    color: "#f97316",
    icon: "🫁",
    summary:
      "Leading cause of community-acquired pneumonia, meningitis, and otitis media. PCV13/PCV15 vaccines are highly effective. Penicillin breakpoints differ by infection site.",
    clinicalSites: ["Lung", "CSF", "Blood", "Middle ear", "Sinuses"],
    resistanceMechanisms: [
      {
        name: "Penicillin resistance (PBP alteration)",
        desc: "Alteration of penicillin-binding proteins — primary mechanism. Breakpoints differ for meningeal vs non-meningeal sites.",
      },
      {
        name: "Macrolide resistance (ermB, mefA)",
        desc: "Erythromycin/azithromycin resistance >40% in Southeast Asia.",
      },
    ],
    clsiNotes:
      "Penicillin breakpoints: meningitis ≤0.06 µg/mL; non-meningitis ≤2 µg/mL (oral), ≤0.06 µg/mL (IV). Ceftriaxone remains active for most strains.",
    refs: [
      {
        label: "CDC — Pneumococcal Disease",
        url: "https://www.cdc.gov/pneumococcal/index.html",
      },
    ],
  },

  "Streptococcus pyogenes": {
    commonName: "Group A Streptococcus (GAS)",
    gramStain: "Gram-positive",
    shape: "Coccus (chains)",
    family: "Streptococcaceae",
    oxygen: "Facultative anaerobe",
    color: "#e11d48",
    icon: "🔴",
    summary:
      "Causes pharyngitis, impetigo, necrotising fasciitis, and toxic shock syndrome. Penicillin universally active — no confirmed clinical resistance.",
    clinicalSites: ["Throat", "Skin", "Blood", "Fascia"],
    resistanceMechanisms: [
      {
        name: "Macrolide resistance",
        desc: "Erythromycin/clindamycin resistance can reach 20–30%; use in penicillin-allergic patients.",
      },
    ],
    clsiNotes:
      "Penicillin remains the drug of choice. No β-lactam resistance documented.",
    refs: [
      { label: "CDC — GAS", url: "https://www.cdc.gov/groupastrep/index.html" },
    ],
  },

  "Streptococcus agalactiae": {
    commonName: "Group B Streptococcus (GBS)",
    gramStain: "Gram-positive",
    shape: "Coccus (chains)",
    family: "Streptococcaceae",
    oxygen: "Facultative anaerobe",
    color: "#db2777",
    icon: "🔴",
    summary:
      "Leading cause of neonatal sepsis and meningitis; also causes invasive disease in pregnant women and elderly adults. Routine intrapartum prophylaxis is recommended.",
    clinicalSites: ["Blood (neonates)", "CSF (neonates)", "Urine", "Placenta"],
    resistanceMechanisms: [
      {
        name: "Macrolide resistance",
        desc: "Clindamycin/erythromycin resistance ~20%; D-zone test required.",
      },
    ],
    clsiNotes:
      "Ampicillin/penicillin remain first-line. Inducible clindamycin resistance — perform D-zone test.",
    refs: [],
  },

  "Proteus mirabilis": {
    commonName: "P. mirabilis",
    gramStain: "Gram-negative",
    shape: "Highly motile rod (swarming)",
    family: "Enterobacteriaceae",
    oxygen: "Facultative anaerobe",
    color: "#84cc16",
    icon: "🦠",
    summary:
      "Common UTI pathogen especially in catheterised patients. Urease enzyme alkalinises urine → struvite kidney stones. Often susceptible to ampicillin if ESBL-negative.",
    clinicalSites: ["Urinary tract", "Wound", "Blood"],
    resistanceMechanisms: [
      {
        name: "ESBL",
        desc: "Increasingly prevalent, especially in recurrent UTI.",
      },
      {
        name: "AmpC",
        desc: "Plasmid-borne AmpC increases cephalosporin resistance.",
      },
    ],
    clsiNotes:
      "Naturally resistant to tetracycline, colistin, polymyxin B — do not test or report. Ampicillin still effective if ESBL-negative.",
    refs: [
      {
        label: "CLSI M100 — Proteus",
        url: "https://clsi.org/standards/products/microbiology/documents/m100/",
      },
    ],
  },

  "Serratia marcescens": {
    commonName: "S. marcescens",
    gramStain: "Gram-negative",
    shape: "Rod",
    family: "Enterobacteriaceae",
    oxygen: "Facultative anaerobe",
    color: "#dc2626",
    icon: "🦠",
    summary:
      "Nosocomial pathogen with intrinsic resistance to colistin and narrow-spectrum β-lactams. Red pigmentation (prodigiosin) in some strains. Associated with outbreaks in ICU and NICU.",
    clinicalSites: ["Blood", "Lung", "Urinary tract"],
    resistanceMechanisms: [
      {
        name: "Inducible AmpC",
        desc: "Similar to Enterobacter — avoid 3rd-gen cephalosporins.",
      },
      {
        name: "Intrinsic colistin resistance",
        desc: "Colistin should never be used against Serratia.",
      },
    ],
    clsiNotes:
      "Intrinsically resistant to colistin, polymyxin B, ampicillin, and amoxicillin-clavulanate.",
    refs: [],
  },

  "Morganella morganii": {
    commonName: "M. morganii",
    gramStain: "Gram-negative",
    shape: "Rod",
    family: "Enterobacteriaceae",
    oxygen: "Facultative anaerobe",
    color: "#0f766e",
    icon: "🦠",
    summary:
      "Intrinsically resistant to many β-lactams and colistin. Causes UTI, wound infections, and occasional bacteraemia. Inducible AmpC is a clinical concern.",
    clinicalSites: ["Urinary tract", "Wound", "Blood"],
    resistanceMechanisms: [
      {
        name: "Intrinsic AmpC + broad β-lactam resistance",
        desc: "Resistant to ampicillin, amoxicillin-clavulanate, cefazolin, colistin by nature.",
      },
      {
        name: "ESBL acquisition",
        desc: "ESBL plasmids further expand resistance spectrum.",
      },
    ],
    clsiNotes:
      "Intrinsically resistant to ampicillin, amoxicillin-clavulanate, cefazolin, and colistin.",
    refs: [],
  },

  "Citrobacter freundii": {
    commonName: "C. freundii",
    gramStain: "Gram-negative",
    shape: "Rod",
    family: "Enterobacteriaceae",
    oxygen: "Facultative anaerobe",
    color: "#0891b2",
    icon: "🦠",
    summary:
      "Opportunistic pathogen with strong inducible AmpC expression — similar to Enterobacter. Increasing nosocomial significance.",
    clinicalSites: ["Urinary tract", "Blood", "Wound"],
    resistanceMechanisms: [
      {
        name: "Inducible AmpC",
        desc: "Strong AmpC derepression; avoid cephalosporins for serious infections.",
      },
      {
        name: "ESBL & KPC",
        desc: "Plasmid-mediated resistance increasingly reported.",
      },
    ],
    clsiNotes:
      "Treat like Enterobacter — prefer cefepime or carbapenem for serious infections.",
    refs: [],
  },

  "Citrobacter koseri": {
    commonName: "C. koseri",
    gramStain: "Gram-negative",
    shape: "Rod",
    family: "Enterobacteriaceae",
    oxygen: "Facultative anaerobe",
    color: "#06b6d4",
    icon: "🦠",
    summary:
      "Associated with neonatal meningitis and brain abscess. Less AmpC activity than C. freundii. Cause of UTI and wound infections.",
    clinicalSites: ["CSF (neonates)", "Blood", "Urinary tract"],
    resistanceMechanisms: [
      {
        name: "ESBL",
        desc: "Occasional ESBL; less inducible AmpC than C. freundii.",
      },
    ],
    clsiNotes:
      "Less AmpC concern than C. freundii; follow standard Enterobacterales guidelines.",
    refs: [],
  },

  "Stenotrophomonas maltophilia": {
    commonName: "S. maltophilia",
    gramStain: "Gram-negative",
    shape: "Rod",
    family: "Xanthomonadaceae",
    oxygen: "Obligate aerobe",
    color: "#6d28d9",
    icon: "🌿",
    summary:
      "Environmental pathogen with intrinsic resistance to carbapenems (metallo-β-lactamase L1). TMP-SMX is the drug of choice. Increasing in immunocompromised patients.",
    clinicalSites: [
      "Lung (cystic fibrosis, ventilated)",
      "Blood",
      "Urinary tract",
    ],
    resistanceMechanisms: [
      {
        name: "L1 metallo-β-lactamase",
        desc: "Intrinsic carbapenem resistance — imipenem and meropenem NOT effective.",
      },
      {
        name: "L2 cephalosporinase",
        desc: "Resistance to most cephalosporins.",
      },
      {
        name: "Efflux pumps",
        desc: "SmeABC and SmeDEF pumps mediate broad multidrug resistance.",
      },
    ],
    clsiNotes:
      "TMP-SMX is the drug of choice. Levofloxacin is an alternative. Carbapenems are ineffective — never use.",
    refs: [
      {
        label: "CDC — Stenotrophomonas",
        url: "https://www.cdc.gov/hai/organisms/smal.html",
      },
    ],
  },

  "Haemophilus influenzae": {
    commonName: "H. influenzae",
    gramStain: "Gram-negative",
    shape: "Coccobacillus (pleomorphic)",
    family: "Pasteurellaceae",
    oxygen: "Facultative anaerobe",
    color: "#7c3aed",
    icon: "🦠",
    summary:
      "Type b (Hib) causes invasive disease (meningitis, epiglottitis) — largely prevented by Hib vaccine. Non-typeable strains cause otitis media, sinusitis, COPD exacerbations.",
    clinicalSites: ["Respiratory tract", "Blood", "CSF", "Middle ear"],
    resistanceMechanisms: [
      {
        name: "β-lactamase (TEM-1)",
        desc: "Ampicillin resistance ~35% via TEM-1 β-lactamase production.",
      },
      {
        name: "BLNAR",
        desc: "β-lactamase negative ampicillin resistant (PBP3 mutations) — less common.",
      },
    ],
    clsiNotes:
      "Test for β-lactamase production. Amoxicillin-clavulanate or 2nd/3rd-gen cephalosporins if resistant.",
    refs: [
      { label: "CDC — Hib", url: "https://www.cdc.gov/hi-disease/index.html" },
    ],
  },

  "Providencia stuartii": {
    commonName: "P. stuartii",
    gramStain: "Gram-negative",
    shape: "Rod",
    family: "Enterobacteriaceae",
    oxygen: "Facultative anaerobe",
    color: "#92400e",
    icon: "🦠",
    summary:
      "Common in long-term care facilities and catheter-associated UTI. Intrinsically resistant to colistin. Increasing multidrug resistance.",
    clinicalSites: ["Urinary tract", "Wound"],
    resistanceMechanisms: [
      {
        name: "Intrinsic colistin resistance",
        desc: "Colistin has no activity against Providencia spp.",
      },
      {
        name: "ESBL & carbapenemase",
        desc: "Increasingly reported; limits treatment options.",
      },
    ],
    clsiNotes:
      "Intrinsically resistant to colistin and polymyxin B. Carbapenem-resistant strains are extremely difficult to treat.",
    refs: [],
  },

  "Burkholderia cepacia": {
    commonName: "B. cepacia complex (Bcc)",
    gramStain: "Gram-negative",
    shape: "Rod",
    family: "Burkholderiaceae",
    oxygen: "Obligate aerobe",
    color: "#059669",
    icon: "🌿",
    summary:
      "Particularly dangerous in cystic fibrosis patients (cepacia syndrome — rapid fatal deterioration). Intrinsically resistant to colistin, aminoglycosides, and many β-lactams.",
    clinicalSites: ["Lung (CF patients)", "Blood"],
    resistanceMechanisms: [
      {
        name: "Broad intrinsic resistance",
        desc: "Naturally resistant to colistin, aminoglycosides, and many β-lactams. TMP-SMX and meropenem are among the few options.",
      },
    ],
    clsiNotes:
      "TMP-SMX is the drug of choice. Ceftazidime and meropenem are alternatives. Colistin is INEFFECTIVE.",
    refs: [],
  },

  "Elizabethkingia meningoseptica": {
    commonName: "E. meningoseptica",
    gramStain: "Gram-negative",
    shape: "Rod",
    family: "Flavobacteriaceae",
    oxygen: "Aerobe",
    color: "#7f1d1d",
    icon: "⚠️",
    summary:
      "Emerging nosocomial pathogen with resistance to most antibiotics active against Gram-negative bacteria. Paradoxically susceptible to vancomycin (unusual for Gram-negative). Causes meningitis in premature neonates.",
    clinicalSites: ["Blood", "CSF (neonates)"],
    resistanceMechanisms: [
      {
        name: "Metallo-β-lactamase (BlaB, GOB)",
        desc: "Intrinsic carbapenem resistance.",
      },
      {
        name: "Aminoglycoside & colistin resistance",
        desc: "Natural resistance makes treatment extremely challenging.",
      },
    ],
    clsiNotes:
      "Paradoxically susceptible to vancomycin despite being Gram-negative. TMP-SMX, levofloxacin, and rifampin are other options.",
    refs: [],
  },
};

// ════════════════════════════════════════════════════════════
// ANTIBIOTIC DATABASE
// ════════════════════════════════════════════════════════════
export const ANTIBIOTIC_INFO = {
  Ampicillin: {
    class: "Penicillin",
    subclass: "Aminopenicillin",
    generation: null,
    color: "#3b82f6",
    mechanism:
      "Inhibits bacterial cell wall synthesis by binding penicillin-binding proteins (PBP), blocking peptidoglycan cross-linking.",
    spectrum:
      "Narrow — Gram-positive (streptococci, enterococci) and selected Gram-negatives (susceptible E. coli, Proteus mirabilis, H. influenzae).",
    clinicalUse:
      "Mild UTI, Listeria meningitis, enterococcal infections, endocarditis (with gentamicin).",
    sideEffects:
      "Rash (especially with allopurinol or EBV), diarrhoea, anaphylaxis.",
    clsiTier: "Tier 1",
    keyPoints: [
      "Klebsiella spp. = intrinsic resistance",
      "E. coli resistance >50% in Vietnam — verify before use",
      "Test for ESBL if ampicillin-resistant",
    ],
  },
  "Amoxicillin-Clavulanate": {
    class: "Penicillin",
    subclass: "BL/BLI combo",
    generation: null,
    color: "#6366f1",
    mechanism:
      "Amoxicillin binds PBP; clavulanate irreversibly inhibits class-A β-lactamases.",
    spectrum:
      "Expanded vs amoxicillin — covers β-lactamase-producing Gram-negatives, anaerobes.",
    clinicalUse: "UTI, mild-moderate CAP, skin/soft tissue, animal bites.",
    sideEffects:
      "GI upset, nausea (clavulanate-related), rare cholestatic hepatitis.",
    clsiTier: "Tier 2",
    keyPoints: [
      "Not effective against ESBL-producing organisms",
      "Klebsiella and Pseudomonas = intrinsic resistance",
      "Take with food to reduce GI effects",
    ],
  },
  "Ampicillin-Sulbactam": {
    class: "Penicillin",
    subclass: "BL/BLI combo",
    generation: null,
    color: "#4f46e5",
    mechanism:
      "Ampicillin + sulbactam (β-lactamase inhibitor). Sulbactam also has direct activity against Acinetobacter.",
    spectrum:
      "Similar to amoxicillin-clavulanate; sulbactam has intrinsic anti-Acinetobacter activity.",
    clinicalUse:
      "A. baumannii infections (sulbactam component), intra-abdominal infections, pelvic inflammatory disease.",
    sideEffects: "Rash, GI upset, elevated LFTs.",
    clsiTier: "Tier 1",
    keyPoints: [
      "Sulbactam component is key for Acinetobacter treatment",
      "High-dose sulbactam (9g/day) being studied for CRAB",
      "Often combined with other agents for MDR Acinetobacter",
    ],
  },
  Cefazolin: {
    class: "Cephalosporin",
    subclass: null,
    generation: "1st generation",
    color: "#0ea5e9",
    mechanism:
      "Binds PBP, inhibits transpeptidase → blocks peptidoglycan cross-linking → cell wall lysis.",
    spectrum:
      "Good Gram-positive (MSSA, streptococci); limited Gram-negative (susceptible E. coli, Klebsiella, Proteus).",
    clinicalUse:
      "Surgical prophylaxis (gold standard), MSSA UTI, skin infections.",
    sideEffects: "Penicillin cross-allergy <2% with true penicillin allergy.",
    clsiTier: "Tier 1",
    keyPoints: [
      "Does NOT cover MRSA",
      "Can substitute ampicillin for surgical prophylaxis in mild penicillin allergy",
      "Represents oral cephalosporins for Klebsiella reporting",
    ],
  },
  Cefoxitin: {
    class: "Cephalosporin",
    subclass: "Cephamycin",
    generation: "2nd generation",
    color: "#0284c7",
    mechanism:
      "Binds PBP; more resistant to staphylococcal β-lactamase than cefazolin.",
    spectrum:
      "MSSA, some Gram-negatives, anaerobes (Bacteroides). Used as MRSA screening surrogate.",
    clinicalUse:
      "MRSA surrogate marker (disc diffusion), intra-abdominal infections (anaerobes).",
    sideEffects: "Similar to other cephalosporins.",
    clsiTier: "Tier 1",
    keyPoints: [
      "CLSI-recommended MRSA surrogate — cefoxitin R means MRSA",
      "More sensitive than oxacillin disc for MRSA detection",
      "Not used therapeutically for MRSA — vancomycin required",
    ],
  },
  Ceftazidime: {
    class: "Cephalosporin",
    subclass: null,
    generation: "3rd generation (anti-Pseudomonal)",
    color: "#f59e0b",
    mechanism:
      "High-affinity PBP3 binding — potent cell wall synthesis inhibitor.",
    spectrum:
      "Strong Gram-negative including Pseudomonas; weak Gram-positive (not for MRSA/Strep).",
    clinicalUse:
      "Pseudomonas infections, hospital-acquired Gram-negative infections, cystic fibrosis.",
    sideEffects: "Generally well tolerated; rare rash.",
    clsiTier: "Tier 1",
    keyPoints: [
      "Preferred agent for P. aeruginosa",
      "Ceftazidime-avibactam: active against ESBL and KPC producers",
      "Do not use as monotherapy for severe bacteraemia — combine with aminoglycoside",
    ],
  },
  Ceftriaxone: {
    class: "Cephalosporin",
    subclass: null,
    generation: "3rd generation",
    color: "#10b981",
    mechanism: "Binds PBP; long half-life (~8h) allows once-daily dosing.",
    spectrum:
      "Broad Gram-negative (susceptible Enterobacterales); Gram-positive (S. pneumoniae, MSSA); excellent CNS penetration.",
    clinicalUse:
      "Meningitis, pneumonia, bacteraemia, gonorrhoea, typhoid fever.",
    sideEffects:
      "Biliary sludge/pseudolithiasis — caution in neonates and TPN patients.",
    clsiTier: "Tier 2",
    keyPoints: [
      "Not active against MRSA, Enterococcus, or Pseudomonas",
      "ESBL → ceftriaxone fails despite low MIC (inoculum effect)",
      "1g/day standard; 2g/day for meningitis",
    ],
  },
  Cefepime: {
    class: "Cephalosporin",
    subclass: null,
    generation: "4th generation",
    color: "#8b5cf6",
    mechanism:
      "Binds PBP; more resistant to β-lactamases than 3rd-gen; better outer-membrane penetration.",
    spectrum:
      "Expanded vs ceftriaxone — covers Pseudomonas, Enterobacter (AmpC-stable); moderate Gram-positive.",
    clinicalUse:
      "Febrile neutropaenia, HAP, Pseudomonas, Enterobacter (carbapenem-sparing).",
    sideEffects:
      "Encephalopathy in renal failure (dose not adjusted) — clinically important.",
    clsiTier: "Tier 2",
    keyPoints: [
      "Preferred over 3rd-gen cephalosporins for Enterobacter (AmpC-stable)",
      "Not reliable for strong ESBL or carbapenemase producers",
      "Dose-adjust when GFR <30 mL/min",
    ],
  },
  Imipenem: {
    class: "Carbapenem",
    subclass: null,
    generation: null,
    color: "#dc2626",
    mechanism:
      "Broadest β-lactam spectrum; stable to most β-lactamases except carbapenemases. Binds multiple PBPs.",
    spectrum:
      "Ultra-broad — Gram-negative (including Pseudomonas, Acinetobacter), Gram-positive, anaerobes.",
    clinicalUse:
      "MDR infections (reserve antibiotic), severe ICU bacteraemia, febrile neutropaenia refractory.",
    sideEffects:
      "Seizures (especially at high doses, renal impairment, CNS injury). Less than with older β-lactams.",
    clsiTier: "Tier 3",
    keyPoints: [
      "RESERVE antibiotic — only when truly necessary",
      "Pseudomonas naturally resistant to ertapenem; imipenem/meropenem may remain active",
      "Widespread use selects for carbapenemase-producing organisms",
    ],
  },
  Meropenem: {
    class: "Carbapenem",
    subclass: null,
    generation: null,
    color: "#dc2626",
    mechanism:
      "Similar to imipenem; more stable to renal dehydropeptidase-I — cilastatin not required.",
    spectrum:
      "Similar to imipenem. Slightly better Pseudomonas and Acinetobacter activity.",
    clinicalUse:
      "Gram-negative meningitis (safer than imipenem), severe MDR infections, KPC protocol backbone.",
    sideEffects:
      "Lower seizure risk than imipenem. Reduces valproate levels significantly.",
    clsiTier: "Tier 3",
    keyPoints: [
      "Preferred for Gram-negative meningitis",
      "Extended infusion (3–4h) optimises PK/PD against high-MIC organisms",
      "Combine with colistin for CRAB/CRKP",
    ],
  },
  Ertapenem: {
    class: "Carbapenem",
    subclass: null,
    generation: null,
    color: "#b91c1c",
    mechanism:
      "Similar to other carbapenems; long half-life (4h) — once-daily dosing.",
    spectrum:
      "Broad but does NOT cover Pseudomonas or Acinetobacter — key distinction.",
    clinicalUse:
      "Complicated intra-abdominal and UTI, severe ESBL CAP, step-down from imipenem/meropenem.",
    sideEffects: "Diarrhoea, headache; lower seizure risk than imipenem.",
    clsiTier: "Tier 3",
    keyPoints: [
      "NEVER use if Pseudomonas or Acinetobacter is suspected",
      "Ideal for early discharge (once-daily IM dosing)",
      "Ertapenem resistance = useful ESBL marker in Enterobacterales",
    ],
  },
  Gentamicin: {
    class: "Aminoglycoside",
    subclass: null,
    generation: null,
    color: "#0891b2",
    mechanism:
      "Binds 30S ribosome → mistranslation → abnormal proteins → membrane disruption. Concentration-dependent killing.",
    spectrum:
      "Aerobic Gram-negatives (Enterobacterales, Pseudomonas); synergy with β-lactams for Enterococcus/Staphylococcus.",
    clinicalUse:
      "Endocarditis combination therapy, severe Gram-negative infections.",
    sideEffects:
      "Nephrotoxicity (monitor creatinine), ototoxicity (irreversible hearing loss).",
    clsiTier: "Tier 1",
    keyPoints: [
      "Extended-interval dosing (once daily) reduces nephrotoxicity",
      "No CLSI breakpoint for Pseudomonas (removed in M100-S29)",
      "Monitor trough levels if used beyond 3 days",
    ],
  },
  Tobramycin: {
    class: "Aminoglycoside",
    subclass: null,
    generation: null,
    color: "#0369a1",
    mechanism:
      "Same 30S ribosome mechanism as gentamicin. Slightly better Pseudomonas activity.",
    spectrum:
      "Gram-negative aerobes; particularly useful for Pseudomonas. Inhaled form for cystic fibrosis.",
    clinicalUse:
      "Pseudomonas infections, cystic fibrosis (inhaled), combination therapy.",
    sideEffects: "Nephrotoxicity and ototoxicity similar to gentamicin.",
    clsiTier: "Tier 2",
    keyPoints: [
      "Preferred aminoglycoside for Pseudomonas over gentamicin",
      "Inhaled tobramycin for CF — systemic absorption minimal",
      "Monitor TDM for IV dosing",
    ],
  },
  Amikacin: {
    class: "Aminoglycoside",
    subclass: null,
    generation: null,
    color: "#0369a1",
    mechanism:
      "Same as gentamicin; resistant to more aminoglycoside-modifying enzymes (AME) — retained when gentamicin-resistant.",
    spectrum:
      "Broader Gram-negative coverage than gentamicin; includes many MDR strains.",
    clinicalUse:
      "MDR Gram-negative infections, TB (group 2 aminoglycoside), carbapenem-resistant combination.",
    sideEffects:
      "Nephrotoxicity and ototoxicity similar to other aminoglycosides.",
    clsiTier: "Tier 2",
    keyPoints: [
      "16S rRNA methylase (RmtB) confers pan-aminoglycoside resistance",
      "CLSI: urine-only reporting for Pseudomonas UTI",
    ],
  },
  Ciprofloxacin: {
    class: "Fluoroquinolone",
    subclass: null,
    generation: "2nd generation",
    color: "#7c3aed",
    mechanism:
      "Inhibits DNA gyrase (topo II) and topo IV → blocks DNA unwinding and replication. Bactericidal.",
    spectrum:
      "Broad Gram-negative (E. coli, Klebsiella, Pseudomonas), moderate Gram-positive; intracellular pathogens.",
    clinicalUse:
      "UTI, travellers' diarrhoea, bone/joint infections, oral Pseudomonas therapy.",
    sideEffects:
      "QTc prolongation, tendon rupture (Achilles), hypoglycaemia, CNS effects. FDA black box.",
    clsiTier: "Tier 1",
    keyPoints: [
      "E. coli resistance >50% in Vietnam — always verify",
      "Avoid in children and pregnancy unless no alternative",
      "High cross-resistance within fluoroquinolone class",
    ],
  },
  Levofloxacin: {
    class: "Fluoroquinolone",
    subclass: null,
    generation: "3rd gen (respiratory quinolone)",
    color: "#6d28d9",
    mechanism:
      "L-isomer of ofloxacin; stronger topo IV inhibition → better Gram-positive activity than ciprofloxacin.",
    spectrum:
      "Excellent S. pneumoniae, Gram-negative (Enterobacterales, moderate Pseudomonas), atypicals.",
    clinicalUse:
      "CAP (respiratory quinolone), UTI, TB (group C drug per WHO 2022).",
    sideEffects: "Similar to ciprofloxacin; greater QTc prolongation.",
    clsiTier: "Tier 1",
    keyPoints: [
      "Preferred over ciprofloxacin for pneumonia due to better Gram-positive coverage",
      "~90% cross-resistance with ciprofloxacin",
      "WHO group C for drug-resistant TB",
    ],
  },
  "Trimethoprim-Sulfamethoxazole": {
    class: "Sulfonamide + Diaminopyrimidine",
    subclass: null,
    generation: null,
    color: "#0d9488",
    mechanism:
      "Sequential blockade of folate synthesis: SMX inhibits dihydropteroate synthase; TMP inhibits DHFR. Synergistic bactericidal effect.",
    spectrum:
      "Gram-positive (MSSA, Listeria, Stenotrophomonas), Gram-negative (Enterobacterales, H. influenzae), Pneumocystis jirovecii.",
    clinicalUse:
      "UTI, PCP prophylaxis/treatment, CA-MRSA skin infections, Stenotrophomonas.",
    sideEffects:
      "Rash (Stevens-Johnson), bone marrow suppression, hyperkalaemia (ENaC inhibition), nephrotoxicity.",
    clsiTier: "Tier 1",
    keyPoints: [
      "E. coli resistance >50% in Vietnam",
      "Drug of choice for CA-MRSA skin/soft tissue if susceptible",
      "Avoid in 3rd trimester (kernicterus risk)",
    ],
  },
  "Piperacillin-Tazobactam": {
    class: "Penicillin",
    subclass: "Ureidopenicillin + BLI",
    generation: null,
    color: "#059669",
    mechanism:
      "Piperacillin (broadest penicillin); tazobactam inhibits class A and C β-lactamases.",
    spectrum:
      "Very broad — Gram-positive, Gram-negative (including Pseudomonas), anaerobes. Not MRSA or amp-R Enterococcus.",
    clinicalUse:
      "Intra-abdominal infections (± metronidazole), HAP, febrile neutropaenia, ICU bacteraemia.",
    sideEffects: "Hypokalaemia (high dose), mild nephrotoxicity, rash.",
    clsiTier: "Tier 2",
    keyPoints: [
      "Pip/tazo + vancomycin combination increases nephrotoxicity risk",
      "Inoculum effect reduces efficacy against high-burden ESBL infections",
      "Extended infusion (4h) optimises PK/PD",
    ],
  },
  Vancomycin: {
    class: "Glycopeptide",
    subclass: null,
    generation: null,
    color: "#b45309",
    mechanism:
      "Binds D-Ala-D-Ala on peptidoglycan precursors → blocks polymerisation and transpeptidation of Gram-positive cell wall.",
    spectrum:
      "Gram-positive ONLY — MRSA, VRE (oral C. difficile). No activity against Gram-negatives.",
    clinicalUse:
      "MRSA (first-line), Gram-positive endocarditis, oral C. difficile (severe), surgical prophylaxis in β-lactam allergy.",
    sideEffects:
      "Red man syndrome (rapid infusion), nephrotoxicity (especially + pip/tazo), ototoxicity.",
    clsiTier: "Tier 2",
    keyPoints: [
      "Monitor AUC/MIC 400–600 (ASHP/IDSA 2020 guidelines — not trough alone)",
      "Clinical pharmacist consultation recommended for dosing optimisation",
      "VRE → linezolid or daptomycin required",
    ],
  },
  Linezolid: {
    class: "Oxazolidinone",
    subclass: null,
    generation: null,
    color: "#9f1239",
    mechanism:
      "Binds 50S ribosome at a unique site → inhibits initiation of protein synthesis. Unique mechanism — no cross-resistance with other classes.",
    spectrum: "Gram-positive — MRSA, VRE, Streptococcus, VISA/VRSA.",
    clinicalUse:
      "VRE, MRSA (vancomycin-resistant or intolerant), HAP, drug-resistant TB (group C).",
    sideEffects:
      "Myelosuppression (especially >2 weeks), peripheral neuropathy, optic neuritis, serotonin syndrome (with SSRIs/MAOIs).",
    clsiTier: "Tier 3",
    keyPoints: [
      "RESERVE antibiotic — avoid routine use when alternatives exist",
      "Oral bioavailability ~100% — IV → PO switch when clinically stable",
      "Monitor CBC weekly if used >2 weeks",
    ],
  },
  Colistin: {
    class: "Polymyxin",
    subclass: "Polymyxin E",
    generation: null,
    color: "#7f1d1d",
    mechanism:
      "Binds LPS on Gram-negative outer membrane → disrupts membrane integrity → cell contents leak → rapid bactericidal effect.",
    spectrum:
      "MDR Gram-negative only — CRAB, CRKP, XDR Pseudomonas. NO activity against Gram-positives, Burkholderia, Proteus, Serratia.",
    clinicalUse:
      "Last-resort therapy for carbapenem-resistant Acinetobacter and Klebsiella. Always use in combination.",
    sideEffects:
      "Severe nephrotoxicity (30–60%), neurotoxicity (paraesthesia, ataxia).",
    clsiTier: "Tier 3",
    keyPoints: [
      "Loading dose mandatory to achieve target concentrations rapidly",
      "Monitor creatinine daily",
      "Combination therapy (not monotherapy) to prevent selection of resistance",
      "Proteus, Serratia, Burkholderia = intrinsically resistant",
    ],
  },
  Nitrofurantoin: {
    class: "Nitrofuran",
    subclass: null,
    generation: null,
    color: "#92400e",
    mechanism:
      "Reduced by bacterial enzymes to reactive intermediates that damage DNA, RNA, proteins, and cell wall simultaneously. Low resistance development.",
    spectrum:
      "E. coli, Enterococcus, Staphylococcus — URINARY TRACT SPECIFIC. Does not achieve therapeutic tissue concentrations elsewhere.",
    clinicalUse:
      "Uncomplicated lower UTI (cystitis). NOT for pyelonephritis or bacteraemia.",
    sideEffects:
      "Nausea (take with food), pulmonary hypersensitivity, hepatitis, pulmonary fibrosis (long-term).",
    clsiTier: "Urine only",
    keyPoints: [
      "Urinary antibiotic only — do not use for systemic infections",
      "Ineffective when GFR <30 mL/min (inadequate urinary levels)",
      "Lower E. coli resistance than fluoroquinolones — good empirical UTI option",
    ],
  },
  Oxacillin: {
    class: "Penicillin",
    subclass: "Penicillinase-resistant penicillin",
    generation: null,
    color: "#ca8a04",
    mechanism:
      "Penicillinase-resistant penicillin; binds PBP2. Not hydrolysed by staphylococcal penicillinase.",
    spectrum:
      "MSSA-specific. Not active against MRSA (PBP2a has low affinity for oxacillin).",
    clinicalUse:
      "MSSA — best agent for MSSA (superior to vancomycin outcomes), MSSA endocarditis, osteomyelitis.",
    sideEffects: "Hepatotoxicity (elevated LFTs), rash.",
    clsiTier: "Tier 1",
    keyPoints: [
      "Oxacillin/cefoxitin disc used to distinguish MSSA vs MRSA",
      "Oxacillin R → MRSA → all β-lactams resistant (except ceftaroline)",
      "Clinically equivalent to nafcillin (used outside Vietnam)",
    ],
  },
  Fosfomycin: {
    class: "Phosphonic acid",
    subclass: null,
    generation: null,
    color: "#0f766e",
    mechanism:
      "Inhibits MurA — the first enzyme in cell wall synthesis (UDP-N-acetylglucosamine → UDP-N-acetylmuramic acid). Unique mechanism — minimal cross-resistance.",
    spectrum:
      "E. coli (excellent), E. faecalis (oral), Staphylococcus; limited Klebsiella and Pseudomonas.",
    clinicalUse:
      "Uncomplicated lower UTI (3g single oral dose), ESBL UTI, MDR combination partner.",
    sideEffects: "Diarrhoea, nausea. Single 3g sachet well tolerated.",
    clsiTier: "Urine only",
    keyPoints: [
      "Single-dose 3g sachet — excellent adherence",
      "Do not use as monotherapy for systemic infections",
      "Higher resistance rates in Klebsiella and Pseudomonas vs E. coli",
    ],
  },
  Tigecycline: {
    class: "Glycylcycline",
    subclass: "3rd-generation tetracycline",
    generation: null,
    color: "#6b21a8",
    mechanism:
      "Binds 30S ribosome, inhibits protein synthesis. Overcomes many tetracycline resistance mechanisms (efflux, ribosome protection).",
    spectrum:
      "Very broad — Gram-positive (MRSA, VRE), Gram-negative (ESBL, CRAB), anaerobes. NOT Pseudomonas.",
    clinicalUse:
      "Complicated intra-abdominal and skin/soft tissue infections. Use with caution — higher mortality in some RCTs.",
    sideEffects:
      "Severe nausea/vomiting. FDA black box: increased all-cause mortality in clinical trials.",
    clsiTier: "Tier 3",
    keyPoints: [
      "Low serum levels — NEVER use as monotherapy for bacteraemia",
      "Increasing Acinetobacter resistance to tigecycline",
      "Must combine with carbapenem or colistin for severe MDR infections",
    ],
  },
  Doxycycline: {
    class: "Tetracycline",
    subclass: "2nd-generation tetracycline",
    generation: null,
    color: "#d97706",
    mechanism:
      "Binds 30S ribosome → blocks aminoacyl-tRNA binding → inhibits protein synthesis. Bacteriostatic.",
    spectrum:
      "Gram-positive (MSSA, streptococci), atypicals (Mycoplasma, Chlamydia, Rickettsia, Borrelia), some Gram-negatives.",
    clinicalUse:
      "CAP (atypical coverage), MRSA skin/soft tissue, STIs (chlamydia), rickettsial diseases, malaria prophylaxis.",
    sideEffects:
      "Photosensitivity, GI upset (take with food), oesophageal ulcers, teeth staining in children <8 years.",
    clsiTier: "Tier 1",
    keyPoints: [
      "Excellent oral bioavailability — IV→PO switch easy",
      "Avoid in pregnancy and children <8 years (teeth/bone)",
      "Good option for CA-MRSA soft tissue infections",
    ],
  },
  Rifampin: {
    class: "Rifamycin",
    subclass: null,
    generation: null,
    color: "#c2410c",
    mechanism:
      "Binds RNA polymerase β-subunit → inhibits DNA-directed RNA synthesis. Bactericidal; excellent biofilm penetration.",
    spectrum:
      "Gram-positive (MRSA biofilm); Mycobacterium tuberculosis; Neisseria meningitidis.",
    clinicalUse:
      "TB (group A), meningococcal prophylaxis, MRSA device/biofilm infections (combination only), Staphylococcus endocarditis.",
    sideEffects:
      "Orange-red body fluids, potent CYP3A4 inducer → extensive drug interactions, hepatotoxicity.",
    clsiTier: "Tier 3",
    keyPoints: [
      "NEVER use as monotherapy — resistance develops within days",
      "CYP3A4 induction reduces warfarin, ARVs, tacrolimus, oral contraceptives…",
      "Warn patients: urine, sweat, tears will turn orange-red",
    ],
  },
  Chloramphenicol: {
    class: "Phenicol",
    subclass: null,
    generation: null,
    color: "#6b7280",
    mechanism:
      "Binds 50S ribosome (23S rRNA) → inhibits peptidyl transferase → blocks peptide elongation. Bacteriostatic (bactericidal for some organisms).",
    spectrum:
      "Broad — Gram-positive, Gram-negative, anaerobes, Rickettsia, spirochaetes. Excellent CNS penetration.",
    clinicalUse:
      "Resource-limited meningitis (alternative), rickettsial disease, typhoid fever (historical), Stenotrophomonas.",
    sideEffects:
      "Aplastic anaemia (rare, idiosyncratic), grey baby syndrome (neonates), dose-dependent bone marrow suppression.",
    clsiTier: "Tier 2",
    keyPoints: [
      "Risk of rare but fatal aplastic anaemia limits use in high-resource settings",
      "Excellent CNS penetration — used for meningitis when alternatives unavailable",
      "Grey baby syndrome: avoid in neonates (inadequate glucuronidation)",
    ],
  },
  Erythromycin: {
    class: "Macrolide",
    subclass: null,
    generation: "1st generation",
    color: "#e11d48",
    mechanism:
      "Binds 50S ribosome (23S rRNA) → blocks transpeptidation and translocation → inhibits protein synthesis.",
    spectrum:
      "Gram-positive (Streptococcus, MSSA); atypicals (Mycoplasma, Chlamydophila, Legionella, Bordetella).",
    clinicalUse:
      "Mild CAP, whooping cough, penicillin allergy, rheumatic fever prophylaxis, gastric prokinetic.",
    sideEffects:
      "Severe GI pain (motilin receptor agonist), QTc prolongation, cholestatic hepatitis.",
    clsiTier: "Tier 1",
    keyPoints: [
      "Macrolide resistance >50% for Streptococcus and Staphylococcus in Vietnam",
      "Azithromycin and clarithromycin better tolerated than erythromycin",
      "Do not use for Enterobacterales (intrinsically resistant)",
    ],
  },
  Clindamycin: {
    class: "Lincosamide",
    subclass: null,
    generation: null,
    color: "#be185d",
    mechanism:
      "Binds 50S ribosome (adjacent to macrolide site) → inhibits protein synthesis. Bacteriostatic.",
    spectrum:
      "Gram-positive (Streptococcus, MSSA, susceptible CA-MRSA); anaerobes (Bacteroides, Clostridium — not C. diff).",
    clinicalUse:
      "CA-MRSA skin/soft tissue, aspiration pneumonia (anaerobes), Toxoplasma (+ pyrimethamine), severe malaria.",
    sideEffects:
      "C. difficile colitis risk (lower than ampicillin/fluoroquinolones). Rash.",
    clsiTier: "Tier 1",
    keyPoints: [
      "D-zone test required to detect inducible MLS_B resistance",
      "Enterococcus naturally resistant — do not report",
      "No activity against Gram-negative organisms",
    ],
  },
};

// ════════════════════════════════════════════════════════════
// LOOKUP HELPERS
// ════════════════════════════════════════════════════════════
export function lookupBacteria(name) {
  if (!name) return null;
  if (BACTERIA_INFO[name]) return BACTERIA_INFO[name];
  const n = name.toLowerCase().trim();
  for (const [k, v] of Object.entries(BACTERIA_INFO)) {
    if (k.toLowerCase().includes(n) || n.includes(k.toLowerCase())) return v;
  }
  return null;
}

export function lookupAntibiotic(name) {
  if (!name) return null;
  if (ANTIBIOTIC_INFO[name]) return ANTIBIOTIC_INFO[name];
  const n = name.toLowerCase().trim();
  for (const [k, v] of Object.entries(ANTIBIOTIC_INFO)) {
    if (
      k.toLowerCase() === n ||
      k.toLowerCase().includes(n) ||
      n.includes(k.toLowerCase())
    )
      return v;
  }
  return null;
}

export const TIER_COLORS = {
  "Tier 1": { bg: "#dbeafe", text: "#1e40af", label: "Tier 1 — First-line" },
  "Tier 2": { bg: "#fef3c7", text: "#92400e", label: "Tier 2 — Second-line" },
  "Tier 3": {
    bg: "#fee2e2",
    text: "#991b1b",
    label: "Tier 3 — Reserve / MDRO",
  },
  "Urine only": { bg: "#d1fae5", text: "#065f46", label: "Urine only" },
};
