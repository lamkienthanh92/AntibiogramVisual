// ============================================================
// App.js  —  Antibiogram Analyzer · Main Shell
// ============================================================
// Responsibilities:
//   • Top-level state (data, filters, activeTab, tier)
//   • Excel file parsing (SheetJS)
//   • UploadScreen routing
//   • Header, tab bar, flag panel
//   • FilterPanel (specimen, department, antibiotic, organism, CLSI tier)
//   • HeatmapTab (resistance matrix — inline, no separate file needed)
//   • Wires in TimeTrendTab, SexTab, AgeTab from their modules
// ============================================================

import { useState, useMemo, useCallback, useRef } from "react";
import * as XLSX from "xlsx";

// ── Computation & data models ─────────────────────────────
import {
  processRawData,
  calcHeatmap,
  findCLSI,
  shouldShowAB,
  resistColor,
  resistText,
  calcWilsonCI,
  abbrevBact,
} from "./calculate.jsx";

// ── Demo data + shared UI tokens ─────────────────────────
import {
  buildSampleData,
  downloadTemplate,
  UploadScreen,
  S,
} from "./simulated.jsx";

// ── Feature tabs ──────────────────────────────────────────
import { TimeTrendTab } from "./trend.jsx";
import { SexTab } from "./sex.jsx";
import { AgeTab } from "./age.jsx";

// ── Educational reference data ───────────────────────────
import {
  lookupBacteria,
  lookupAntibiotic,
  TIER_COLORS,
} from "./microbeInfo.jsx";

// ════════════════════════════════════════════════════════════
// EXCEL PARSER
// ════════════════════════════════════════════════════════════
async function parseExcel(file) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: null,
    raw: false,
  });
  if (raw.length < 2) throw new Error("File has no data");
  const headers = raw[0].map((c) => (c != null ? String(c).trim() : null));
  const rows = raw
    .slice(1)
    .filter((r) => r.some((c) => c != null && String(c).trim() !== ""));
  return { headers, rows };
}

// ════════════════════════════════════════════════════════════
// COMPONENT: FLAG PANEL
// ════════════════════════════════════════════════════════════
function FlagPanel({ flags, dedup }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);

  if (!flags || flags.length === 0) return null;

  const errors = flags.filter((f) => f.level === "error");
  const warns = flags.filter((f) => f.level === "warn");
  const accentColor = errors.length ? "#dc2626" : "#ca8a04";
  const bgColor = errors.length ? "#fef2f2" : "#fefce8";
  const borderColor = errors.length ? "#fecaca" : "#fde68a";

  return (
    <div
      style={{
        ...S.card,
        border: `1px solid ${borderColor}`,
        background: bgColor,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: errors.length ? "#991b1b" : "#78350f",
            }}
          >
            Data Quality Alerts
          </span>
          <span style={S.badge(errors.length ? "#dc2626" : "#f59e0b", "#fff")}>
            {errors.length} errors
          </span>
          <span style={S.badge("#fde68a", "#78350f")}>
            {warns.length} warnings
          </span>
          {dedup > 0 && (
            <span style={S.badge("#dbeafe", "#1e40af")}>
              {dedup} duplicates removed
            </span>
          )}
        </div>
        <span style={{ fontSize: 12, color: "#6b7280" }}>
          {open ? "▲ Hide" : "▼ Details"}
        </span>
      </button>

      {open && (
        <div style={{ borderTop: "1px solid #e5e7eb", padding: "12px 16px" }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>
            Click each item for details and remediation advice.
          </div>
          {[...errors, ...warns].map((f, i) => (
            <div
              key={i}
              style={{
                marginBottom: 6,
                border: `1px solid ${
                  f.level === "error" ? "#fecaca" : "#fde68a"
                }`,
                borderRadius: 7,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                style={{
                  width: "100%",
                  background: f.level === "error" ? "#fef2f2" : "#fefce8",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: f.level === "error" ? "#dc2626" : "#f59e0b",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: f.level === "error" ? "#991b1b" : "#78350f",
                    flex: 1,
                  }}
                >
                  [{f.code}] {f.bacteria}
                  {f.antibiotic ? ` / ${f.antibiotic}` : ""} — {f.message}
                </span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  {expanded === i ? "▲" : "▼"}
                </span>
              </button>
              {expanded === i && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "#fff",
                    fontSize: 12,
                    color: "#374151",
                    lineHeight: 1.7,
                    borderTop: "1px solid #f3f4f6",
                  }}
                >
                  {f.detail}
                  {f.code === "LOW_N" && (
                    <div
                      style={{
                        marginTop: 6,
                        padding: "6px 10px",
                        background: "#eff6ff",
                        borderRadius: 5,
                        color: "#1e40af",
                      }}
                    >
                      <strong>Recommendation:</strong> Collect additional
                      isolates in the next reporting period. Results are shown
                      with 95% Wilson CI so readers can gauge uncertainty.
                    </div>
                  )}
                  {f.code === "LOW_COVERAGE" && (
                    <div
                      style={{
                        marginTop: 6,
                        padding: "6px 10px",
                        background: "#eff6ff",
                        borderRadius: 5,
                        color: "#1e40af",
                      }}
                    >
                      <strong>Recommendation:</strong> Review testing protocols
                      — this antibiotic may not be routinely tested for this
                      specimen type or department.
                    </div>
                  )}
                  {f.code === "INTRINSIC_MISMATCH" && (
                    <div
                      style={{
                        marginTop: 6,
                        padding: "6px 10px",
                        background: "#fef3c7",
                        borderRadius: 5,
                        color: "#78350f",
                      }}
                    >
                      <strong>Recommendation:</strong> Verify isolate
                      identification and susceptibility data. CLSI lists this as
                      intrinsic resistance — S/I results are unexpected.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// COMPONENT: FILTER PANEL
// ════════════════════════════════════════════════════════════
function FilterPanel({ data, filters, onChange, tier, setTier }) {
  const [open, setOpen] = useState({
    st: true,
    dept: true,
    ab: false,
    bact: false,
  });
  const [sAB, setSAB] = useState("");
  const [sBact, setSBact] = useState("");
  const tog = (k) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  const Sec = ({ id, label, items, field, search, setSearch }) => (
    <div>
      <div
        onClick={() => tog(id)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          cursor: "pointer",
          paddingBottom: 6,
          borderBottom: "1px solid #f3f4f6",
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {label} ({items.length})
        </span>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>
          {open[id] ? "▲" : "▼"}
        </span>
      </div>
      {open[id] && (
        <>
          {setSearch && (
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              style={{
                ...S.inp,
                marginBottom: 5,
                fontSize: 12,
                padding: "5px 8px",
              }}
            />
          )}
          <div
            style={{
              maxHeight: 160,
              overflowY: "auto",
              border: "1px solid #f3f4f6",
              borderRadius: 6,
              padding: "3px 6px",
              marginBottom: 5,
            }}
          >
            {(search
              ? items.filter((x) =>
                  x.toLowerCase().includes(search.toLowerCase())
                )
              : items
            ).map((x) => (
              <label
                key={x}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 12,
                  padding: "3px 0",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={filters[field]?.includes(x) || false}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      [field]: e.target.checked
                        ? [...(filters[field] || []), x]
                        : (filters[field] || []).filter((v) => v !== x),
                    })
                  }
                />
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={x}
                >
                  {x}
                </span>
              </label>
            ))}
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            <button
              style={{
                ...S.btn("#10b981"),
                flex: 1,
                padding: "4px",
                fontSize: 11,
                justifyContent: "center",
              }}
              onClick={() => onChange({ ...filters, [field]: items })}
            >
              ✓ All
            </button>
            <button
              style={{
                ...S.btn("#ef4444"),
                flex: 1,
                padding: "4px",
                fontSize: 11,
                justifyContent: "center",
              }}
              onClick={() => onChange({ ...filters, [field]: [] })}
            >
              ✕ None
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div style={{ ...S.card, padding: 16 }}>
      <div
        style={{
          fontWeight: 700,
          marginBottom: 12,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        🔍 Filters
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))",
          gap: 12,
        }}
      >
        <Sec
          id="st"
          label="🧫 Specimen"
          items={data.sampleTypes}
          field="sampleTypes"
        />
        {data.departments.length > 0 && (
          <Sec
            id="dept"
            label="🏥 Department"
            items={data.departments}
            field="departments"
          />
        )}
        <Sec
          id="ab"
          label="💊 Antibiotic"
          items={data.antibiotics}
          field="antibiotics"
          search={sAB}
          setSearch={setSAB}
        />
        <Sec
          id="bact"
          label="🦠 Organism"
          items={data.bacteria}
          field="bacteria"
          search={sBact}
          setSearch={setSBact}
        />
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            CLSI Tier
          </div>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            style={S.inp}
          >
            <option value="all">All Antibiotics</option>
            <option value="tier1">Tier 1 — First-line</option>
            <option value="tier2">Tier 2 — Second-line</option>
            <option value="tier3">Tier 3 — Reserve</option>
          </select>
        </div>
      </div>
      <div
        style={{
          marginTop: 10,
          padding: "6px 10px",
          background: "#f8fafc",
          borderRadius: 6,
          fontSize: 11,
          color: "#6b7280",
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <span>
          🧫 {filters.sampleTypes?.length || 0}/{data.sampleTypes.length}
        </span>
        {data.departments.length > 0 && (
          <span>
            🏥 {filters.departments?.length || 0}/{data.departments.length}
          </span>
        )}
        <span>
          💊 {filters.antibiotics?.length || 0}/{data.antibiotics.length}
        </span>
        <span>
          🦠 {filters.bacteria?.length || 0}/{data.bacteria.length}
        </span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// COMPONENT: INFO SHEET (bottom drawer — organism & antibiotic
//            educational reference from microbeInfo.jsx)
// ════════════════════════════════════════════════════════════
function InfoSheet({ bactInfo, abInfo, bact, ab, onClose }) {
  const [tab, setTab] = useState(abInfo ? "ab" : "bact");
  const hasAb = !!abInfo,
    hasBact = !!bactInfo;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10001,
        background: "rgba(0,0,0,.55)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 640,
          background: "#fff",
          borderRadius: "18px 18px 0 0",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -6px 40px rgba(0,0,0,.22)",
        }}
      >
        {/* Handle bar */}
        <div style={{ textAlign: "center", padding: "10px 0 0" }}>
          <div
            style={{
              width: 36,
              height: 4,
              background: "#d1d5db",
              borderRadius: 2,
              display: "inline-block",
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            padding: "12px 18px 0",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>
              Reference Information
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "#1f2937",
                wordBreak: "break-word",
                lineHeight: 1.3,
              }}
            >
              {bact}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#3b82f6",
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              {ab}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: "50%",
              width: 34,
              height: 34,
              cursor: "pointer",
              fontSize: 16,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        {hasAb && hasBact && (
          <div
            style={{
              display: "flex",
              gap: 0,
              margin: "12px 18px 0",
              background: "#f3f4f6",
              borderRadius: 10,
              padding: 4,
            }}
          >
            {[
              ["ab", "💊 Antibiotic"],
              ["bact", "🦠 Organism"],
            ].map(([t, l]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: "7px 10px",
                  border: "none",
                  borderRadius: 7,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  background: tab === t ? "#fff" : "transparent",
                  color: tab === t ? "#1f2937" : "#9ca3af",
                  boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,.1)" : "none",
                  transition: "all .15s",
                }}
              >
                {l}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 18px 28px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* ── ANTIBIOTIC TAB ── */}
          {tab === "ab" && abInfo && (
            <div>
              {/* Class badges */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    background: "#eff6ff",
                    color: "#1e40af",
                    borderRadius: 6,
                    padding: "3px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {abInfo.class}
                </span>
                {abInfo.generation && (
                  <span
                    style={{
                      background: "#f3f4f6",
                      color: "#374151",
                      borderRadius: 6,
                      padding: "3px 10px",
                      fontSize: 12,
                    }}
                  >
                    {abInfo.generation}
                  </span>
                )}
                {abInfo.clsiTier && TIER_COLORS[abInfo.clsiTier] && (
                  <span
                    style={{
                      background: TIER_COLORS[abInfo.clsiTier].bg,
                      color: TIER_COLORS[abInfo.clsiTier].text,
                      borderRadius: 6,
                      padding: "3px 10px",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {TIER_COLORS[abInfo.clsiTier].label}
                  </span>
                )}
              </div>

              {/* Info sections */}
              {[
                ["⚙️ Mechanism of Action", abInfo.mechanism],
                ["🎯 Antimicrobial Spectrum", abInfo.spectrum],
                ["🏥 Clinical Uses", abInfo.clinicalUse],
                ["⚠️ Side Effects & Cautions", abInfo.sideEffects],
              ].map(([title, text]) => (
                <div key={title} style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#374151",
                      marginBottom: 5,
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#4b5563",
                      lineHeight: 1.65,
                      background: "#f8fafc",
                      borderRadius: 8,
                      padding: "10px 12px",
                    }}
                  >
                    {text}
                  </div>
                </div>
              ))}

              {/* Key points */}
              {abInfo.keyPoints?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    💡 Key Clinical Points
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {abInfo.keyPoints.map((p, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                          fontSize: 13,
                          color: "#374151",
                          lineHeight: 1.55,
                          background: "#eff6ff",
                          borderRadius: 8,
                          padding: "8px 12px",
                        }}
                      >
                        <span
                          style={{
                            color: "#2563eb",
                            flexShrink: 0,
                            fontWeight: 800,
                            fontSize: 15,
                          }}
                        >
                          →
                        </span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── BACTERIA TAB ── */}
          {tab === "bact" && bactInfo && (
            <div>
              {/* Meta badges */}
              <div
                style={{
                  display: "flex",
                  gap: 5,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                {[
                  bactInfo.gramStain,
                  bactInfo.shape,
                  bactInfo.oxygen,
                  bactInfo.family,
                ]
                  .filter(Boolean)
                  .map((t) => (
                    <span
                      key={t}
                      style={{
                        background: "#f3f4f6",
                        color: "#374151",
                        borderRadius: 6,
                        padding: "3px 10px",
                        fontSize: 12,
                      }}
                    >
                      {t}
                    </span>
                  ))}
              </div>

              {/* Summary */}
              <div
                style={{
                  fontSize: 13,
                  color: "#374151",
                  lineHeight: 1.65,
                  marginBottom: 16,
                  background: "#f0f9ff",
                  borderRadius: 10,
                  padding: "12px 14px",
                  borderLeft: "4px solid #3b82f6",
                }}
              >
                {bactInfo.summary}
              </div>

              {/* Clinical sites */}
              {bactInfo.clinicalSites?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#374151",
                      marginBottom: 7,
                    }}
                  >
                    📍 Common Infection Sites
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {bactInfo.clinicalSites.map((s) => (
                      <span
                        key={s}
                        style={{
                          background: "#ecfdf5",
                          color: "#065f46",
                          border: "1px solid #a7f3d0",
                          borderRadius: 6,
                          padding: "3px 10px",
                          fontSize: 12,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resistance mechanisms */}
              {bactInfo.resistanceMechanisms?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    🔬 Key Resistance Mechanisms
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {bactInfo.resistanceMechanisms.map((m) => (
                      <div
                        key={m.name}
                        style={{
                          background: "#fef2f2",
                          borderRadius: 9,
                          padding: "10px 12px",
                          border: "1px solid #fecaca",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#991b1b",
                            marginBottom: 4,
                          }}
                        >
                          {m.name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            lineHeight: 1.6,
                          }}
                        >
                          {m.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CLSI notes */}
              {bactInfo.clsiNotes && (
                <div
                  style={{
                    marginBottom: 14,
                    background: "#fefce8",
                    borderRadius: 9,
                    padding: "10px 12px",
                    border: "1px solid #fde68a",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#78350f",
                      marginBottom: 4,
                    }}
                  >
                    📋 CLSI Reporting Notes
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#78350f", lineHeight: 1.65 }}
                  >
                    {bactInfo.clsiNotes}
                  </div>
                </div>
              )}

              {/* References */}
              {bactInfo.refs?.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#9ca3af",
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    References
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 5 }}
                  >
                    {bactInfo.refs.map((r) => (
                      <a
                        key={r.url}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 13,
                          color: "#2563eb",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "7px 10px",
                          background: "#eff6ff",
                          borderRadius: 8,
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        {r.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No data state */}
          {((tab === "ab" && !abInfo) || (tab === "bact" && !bactInfo)) && (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                color: "#9ca3af",
                fontSize: 13,
              }}
            >
              No reference data available for this entry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// COMPONENT: CELL POPUP (heatmap click → stats + Learn More)
// ════════════════════════════════════════════════════════════
function CellPopup({ cell, onClose }) {
  const [showInfo, setShowInfo] = useState(false);
  if (!cell) return null;
  const { bact, ab, d, ci, x, y } = cell;
  const total = d.total;
  const bactInfo = lookupBacteria(bact);
  const abInfo = lookupAntibiotic(ab);

  if (showInfo) {
    return (
      <InfoSheet
        bactInfo={bactInfo}
        abInfo={abInfo}
        bact={bact}
        ab={ab}
        onClose={onClose}
      />
    );
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,.3)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          left: Math.min(x, window.innerWidth - 256),
          top: Math.min(y + 8, window.innerHeight - 310),
          background: "#1f2937",
          color: "#fff",
          borderRadius: 14,
          padding: "13px 14px",
          width: 248,
          boxShadow: "0 10px 32px rgba(0,0,0,.45)",
          fontSize: 13,
          zIndex: 10000,
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "none",
            border: "none",
            color: "#9ca3af",
            cursor: "pointer",
            fontSize: 15,
            lineHeight: 1,
            padding: 2,
          }}
        >
          ✕
        </button>

        {/* Organism */}
        <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 1 }}>
          Organism
        </div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 12,
            marginBottom: 6,
            paddingRight: 20,
            lineHeight: 1.4,
            color: "#f9fafb",
          }}
        >
          {bact}
        </div>

        {/* Antibiotic */}
        <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 1 }}>
          Antibiotic
        </div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            marginBottom: 10,
            color: "#60a5fa",
          }}
        >
          {ab}
        </div>

        {/* Resistance badge */}
        <div
          style={{
            background: resistColor(d.resistance),
            color: resistText(d.resistance),
            borderRadius: 10,
            padding: "9px 10px",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>
            {d.resistance}%
          </div>
          <div style={{ fontSize: 10, opacity: 0.88, marginTop: 2 }}>
            resistance rate (R)
          </div>
          {ci && (
            <div style={{ fontSize: 9, opacity: 0.72, marginTop: 1 }}>
              95% CI: {ci.lower}–{ci.upper}%
            </div>
          )}
        </div>

        {/* R / I / S bars */}
        {[
          {
            lbl: "Resistant (R)",
            n: d.R,
            pct: Math.round((d.R / total) * 100),
            color: "#ef4444",
          },
          {
            lbl: "Intermediate (I)",
            n: d.I,
            pct: Math.round((d.I / total) * 100),
            color: "#f59e0b",
          },
          {
            lbl: "Susceptible (S)",
            n: d.S,
            pct: Math.round((d.S / total) * 100),
            color: "#22c55e",
          },
        ].map((row) => (
          <div key={row.lbl} style={{ marginBottom: 6 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                marginBottom: 2,
              }}
            >
              <span style={{ color: "#d1d5db" }}>{row.lbl}</span>
              <span style={{ fontWeight: 600, color: "#f9fafb" }}>
                {row.n}{" "}
                <span style={{ color: "#9ca3af", fontWeight: 400 }}>
                  ({row.pct}%)
                </span>
              </span>
            </div>
            <div
              style={{
                height: 5,
                background: "#374151",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${row.pct}%`,
                  background: row.color,
                  borderRadius: 3,
                }}
              />
            </div>
          </div>
        ))}

        <div
          style={{
            fontSize: 10,
            color: "#6b7280",
            borderTop: "1px solid #374151",
            paddingTop: 7,
            marginTop: 7,
            marginBottom: 10,
          }}
        >
          Total tests: <strong style={{ color: "#d1d5db" }}>{total}</strong>
        </div>

        {/* Learn More button — only when reference data exists */}
        {(bactInfo || abInfo) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowInfo(true);
            }}
            style={{
              width: "100%",
              padding: "9px",
              background: "linear-gradient(135deg,#2563eb,#4f46e5)",
              border: "none",
              borderRadius: 9,
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Learn More
            <span style={{ marginLeft: 2, opacity: 0.75, fontSize: 11 }}>
              {bactInfo && abInfo
                ? "(organism & antibiotic)"
                : bactInfo
                ? "(organism)"
                : "(antibiotic)"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// COMPONENT: HEATMAP MATRIX (single table)
// ════════════════════════════════════════════════════════════
function HeatmapMatrix({
  title,
  heatmap,
  filters,
  tier,
  allTests,
  heatmapKey,
}) {
  const [activeBact, setActiveBact] = useState(null);
  const [cellPopup, setCellPopup] = useState(null);

  if (!heatmap || heatmap.totalTests === 0) return null;

  const filteredBact = (heatmap.bacteria || []).filter(
    (b) => !filters.bacteria?.length || filters.bacteria.includes(b)
  );
  if (!filteredBact.length) return null;

  let filteredAB = (heatmap.antibiotics || []).filter(
    (ab) => !filters.antibiotics?.length || filters.antibiotics.includes(ab)
  );

  if (tier !== "all") {
    if (filteredBact.length === 1) {
      const cd = findCLSI(filteredBact[0]);
      if (cd)
        filteredAB = filteredAB.filter((ab) => shouldShowAB(cd.data, ab, tier));
    } else {
      filteredAB = filteredAB.filter((ab) =>
        filteredBact.every((b) => {
          const cd = findCLSI(b);
          return !cd || shouldShowAB(cd.data, ab, tier);
        })
      );
    }
  }
  if (!filteredAB.length) return null;

  // Isolate counts for frequency bar
  const isolateCounts = {};
  filteredBact.forEach((b) => {
    const s = new Set();
    (allTests || []).forEach((t) => {
      if (t.bacteria !== b) return;
      if (
        filters.sampleTypes?.length &&
        !filters.sampleTypes.includes(t.sampleType)
      )
        return;
      if (
        filters.departments?.length &&
        !filters.departments.includes(t.department)
      )
        return;
      if (heatmapKey) {
        if (
          heatmapKey.startsWith("dept_") &&
          t.department !== heatmapKey.slice(5)
        )
          return;
        if (
          heatmapKey.startsWith("gender_") &&
          t.gender !== heatmapKey.slice(7)
        )
          return;
        if (heatmapKey.startsWith("age_") && t.ageGroup !== heatmapKey.slice(4))
          return;
        if (heatmapKey.includes("||")) {
          const [st, d] = heatmapKey.split("||");
          if (t.sampleType !== st || t.department !== d) return;
        } else if (
          !heatmapKey.includes("_") &&
          !heatmapKey.includes("||") &&
          t.sampleType !== heatmapKey
        )
          return;
      }
      s.add(`${t.patientName}__${t.bacteria}`);
    });
    isolateCounts[b] = s.size;
  });

  const totalIso = Object.values(isolateCounts).reduce((a, b) => a + b, 0);
  const sorted = [...filteredBact].sort(
    (a, b) => (isolateCounts[b] || 0) - (isolateCounts[a] || 0)
  );

  return (
    <div style={{ marginBottom: 26 }}>
      <style>{`
        .bact-col{width:33vw;min-width:100px;max-width:200px}
        @media(min-width:640px){.bact-col{width:200px;min-width:200px}}
        .ab-cell{min-width:46px;width:46px}
        @media(min-width:640px){.ab-cell{min-width:54px;width:54px}}
        .bact-tip{position:absolute;left:0;top:100%;z-index:99;background:#1f2937;color:#fff;font-size:11px;padding:5px 9px;border-radius:6px;white-space:nowrap;pointer-events:none;box-shadow:0 2px 8px rgba(0,0,0,.25);margin-top:3px}
      `}</style>

      {/* Section title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700 }}>{title}</span>
        <span style={{ fontSize: 11, color: "#9ca3af" }}>
          ({heatmap.totalTests.toLocaleString()} tests ·{" "}
          {heatmap.totalIsolates.toLocaleString()} isolates)
        </span>
        {tier !== "all" && (
          <span style={{ ...S.badge("#dbeafe", "#1e40af"), fontSize: 10 }}>
            {tier === "tier1"
              ? "First-line"
              : tier === "tier2"
              ? "Second-line"
              : "Reserve"}
          </span>
        )}
      </div>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          overflow: "auto",
          maxHeight: 580,
          WebkitOverflowScrolling: "touch",
        }}
      >
        <table
          style={{
            borderCollapse: "separate",
            borderSpacing: 0,
            tableLayout: "fixed",
          }}
        >
          <colgroup>
            <col className="bact-col" />
            {filteredAB.map((ab) => (
              <col key={ab} className="ab-cell" />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th
                className="bact-col"
                style={{
                  position: "sticky",
                  left: 0,
                  top: 0,
                  zIndex: 20,
                  padding: "8px 6px",
                  background: "#1e293b",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 600,
                  textAlign: "left",
                  borderRight: "2px solid #334155",
                }}
              >
                Organism
              </th>
              {filteredAB.map((ab) => (
                <th
                  key={ab}
                  className="ab-cell"
                  title={ab}
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    padding: "8px 2px",
                    background: "#1e293b",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 600,
                    textAlign: "center",
                    borderRight: "1px solid #334155",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ab.length > 6 ? ab.slice(0, 5) + "…" : ab}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((bact) => {
              const iso = isolateCounts[bact] || 0;
              const pct = totalIso > 0 ? Math.round((iso / totalIso) * 100) : 0;
              const lowN = iso < 30;
              const short = abbrevBact(bact);
              const isAct = activeBact === bact;

              return (
                <tr key={bact}>
                  {/* Bacteria name cell with frequency bar */}
                  <td
                    className="bact-col"
                    style={{
                      position: "sticky",
                      left: 0,
                      zIndex: 10,
                      padding: 0,
                      background: "#f3f4f6",
                      borderRight: "2px solid #d1d5db",
                      borderBottom: "1px solid #e5e7eb",
                      overflow: "visible",
                    }}
                  >
                    <div style={{ position: "relative", minHeight: 50 }}>
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: `${pct}%`,
                          background:
                            "linear-gradient(90deg,#3b82f640,#2563eb30)",
                          zIndex: 1,
                        }}
                      />
                      <div
                        style={{
                          position: "relative",
                          zIndex: 2,
                          padding: "6px 8px",
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                        onClick={() => setActiveBact(isAct ? null : bact)}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: "#1f2937",
                              flex: 1,
                            }}
                          >
                            {short}
                          </span>
                          {lowN && (
                            <span
                              style={{
                                fontSize: 8,
                                background: "#fef3c7",
                                color: "#92400e",
                                border: "1px solid #fcd34d",
                                borderRadius: 3,
                                padding: "1px 3px",
                                flexShrink: 0,
                              }}
                            >
                              n&lt;30
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: 2,
                          }}
                        >
                          <span style={{ fontSize: 10, color: "#6b7280" }}>
                            {iso} iso.
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              background: "#e5e7eb",
                              borderRadius: 8,
                              padding: "0 5px",
                            }}
                          >
                            {pct}%
                          </span>
                        </div>
                        {isAct && (
                          <div className="bact-tip">
                            {bact}
                            <br />
                            <span style={{ color: "#9ca3af", fontSize: 10 }}>
                              {iso} isolates · {pct}% of panel
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Resistance cells */}
                  {filteredAB.map((ab) => {
                    const k = `${bact}|${ab}`,
                      d = heatmap.matrix[k];
                    if (!d)
                      return (
                        <td
                          key={ab}
                          className="ab-cell"
                          style={{
                            background: "#f9fafb",
                            borderRight: "1px solid #f3f4f6",
                            borderBottom: "1px solid #e5e7eb",
                          }}
                        />
                      );
                    const ci = calcWilsonCI(d.R, d.total);
                    return (
                      <td
                        key={ab}
                        className="ab-cell"
                        style={{
                          padding: "4px 1px",
                          textAlign: "center",
                          fontWeight: 700,
                          fontSize: 12,
                          background: resistColor(d.resistance),
                          color: resistText(d.resistance),
                          borderRight: "1px solid rgba(255,255,255,.12)",
                          borderBottom: "1px solid #e5e7eb",
                          cursor: "pointer",
                          WebkitTapHighlightColor: "transparent",
                        }}
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setCellPopup({
                            bact,
                            ab,
                            d,
                            ci,
                            x: rect.left,
                            y: rect.bottom,
                          });
                        }}
                      >
                        {d.resistance}
                        {ci && (
                          <div
                            style={{
                              fontSize: 8,
                              opacity: 0.85,
                              lineHeight: 1.1,
                            }}
                          >
                            ({ci.lower}–{ci.upper})
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Colour legend */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 6,
          fontSize: 11,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span style={{ color: "#6b7280" }}>% Resistance:</span>
        {[
          ["#15803d", "0"],
          ["#22c55e", "1–20"],
          ["#a3e635", "21–40"],
          ["#facc15", "41–60"],
          ["#fb923c", "61–80"],
          ["#dc2626", "81–100"],
        ].map(([c, l]) => (
          <span
            key={l}
            style={{ display: "flex", alignItems: "center", gap: 3 }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                background: c,
                borderRadius: 2,
                border: "1px solid #d1d5db",
              }}
            />
            {l}
          </span>
        ))}
        <span style={{ color: "#9ca3af" }}>· Click cell for details</span>
      </div>

      <CellPopup cell={cellPopup} onClose={() => setCellPopup(null)} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TAB: HEATMAP  (orchestrates multiple HeatmapMatrix renders)
// ════════════════════════════════════════════════════════════
function HeatmapTab({ data, filters, tier }) {
  const allHM = useMemo(() => {
    const ft = data.rawTests.filter((t) => {
      if (
        filters.sampleTypes?.length &&
        !filters.sampleTypes.includes(t.sampleType)
      )
        return false;
      if (
        filters.departments?.length &&
        !filters.departments.includes(t.department)
      )
        return false;
      if (filters.bacteria?.length && !filters.bacteria.includes(t.bacteria))
        return false;
      return true;
    });
    return calcHeatmap(ft);
  }, [data, filters]);

  const showST = filters.sampleTypes?.length > 0;
  const showD = filters.departments?.length > 0;

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>
        Resistance Matrix
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#059669",
          marginBottom: 8,
        }}
      >
        📊 Overall Summary
      </div>
      <HeatmapMatrix
        title="All Specimens"
        heatmap={allHM}
        filters={filters}
        tier={tier}
        allTests={data.rawTests}
        heatmapKey={null}
      />

      {showST && !showD && (
        <>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#2563eb",
              margin: "14px 0 8px",
            }}
          >
            📋 By Specimen Type
          </div>
          {filters.sampleTypes.map((st) => (
            <HeatmapMatrix
              key={st}
              title={st}
              heatmap={data.heatmaps[st]}
              filters={filters}
              tier={tier}
              allTests={data.rawTests}
              heatmapKey={st}
            />
          ))}
        </>
      )}

      {!showST && showD && (
        <>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#7c3aed",
              margin: "14px 0 8px",
            }}
          >
            🏥 By Department
          </div>
          {filters.departments.map((d) => (
            <HeatmapMatrix
              key={d}
              title={d}
              heatmap={data.heatmaps[`dept_${d}`]}
              filters={filters}
              tier={tier}
              allTests={data.rawTests}
              heatmapKey={`dept_${d}`}
            />
          ))}
        </>
      )}

      {showST && showD && (
        <>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#4f46e5",
              margin: "14px 0 8px",
            }}
          >
            🔬 Specimen × Department
          </div>
          {filters.sampleTypes.map((st) => (
            <div key={st} style={{ marginBottom: 10 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#2563eb",
                  marginBottom: 6,
                  paddingLeft: 6,
                  borderLeft: "3px solid #2563eb",
                }}
              >
                📋 {st}
              </div>
              {filters.departments.map((d) => (
                <div key={d} style={{ marginLeft: 16 }}>
                  <HeatmapMatrix
                    title={d}
                    heatmap={data.heatmaps[`${st}||${d}`]}
                    filters={filters}
                    tier={tier}
                    allTests={data.rawTests}
                    heatmapKey={`${st}||${d}`}
                  />
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════════════════════
export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [activeTab, setActiveTab] = useState("heatmap");
  const [tier, setTier] = useState("all");
  const [filters, setFilters] = useState(null);

  const initFilters = (d) =>
    setFilters({
      sampleTypes: d.sampleTypes,
      departments: d.departments,
      antibiotics: d.antibiotics,
      bacteria: d.bacteria,
    });

  // ── Load demo data ────────────────────────────────────────
  const loadSample = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    setTimeout(() => {
      try {
        const raw = buildSampleData(20000, 2023, 24);
        const p = processRawData(raw);
        setData(p);
        setIsDemo(true);
        initFilters(p);
      } catch (e) {
        setLoadError(e.message);
      } finally {
        setLoading(false);
      }
    }, 80);
  }, []);

  // ── Load uploaded file ────────────────────────────────────
  const loadFile = useCallback(async (file) => {
    setLoading(true);
    setLoadError(null);
    try {
      const raw = await parseExcel(file);
      const p = processRawData(raw);
      setData(p);
      setIsDemo(false);
      initFilters(p);
    } catch (e) {
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = () => {
    setData(null);
    setLoadError(null);
    setIsDemo(false);
    setFilters(null);
    setActiveTab("heatmap");
  };

  // ── Upload screen ─────────────────────────────────────────
  if (!data)
    return (
      <UploadScreen
        onLoadSample={loadSample}
        onLoadFile={loadFile}
        loading={loading}
        loadError={loadError}
      />
    );

  // ── Tab config ────────────────────────────────────────────
  const TABS = [
    { id: "heatmap", label: "Resistance Matrix" },
    ...(Object.keys(data.timeSeries).length > 0
      ? [{ id: "time", label: "Temporal Trends" }]
      : []),
    ...(data.genders.length > 0
      ? [{ id: "gender", label: "MDR by Gender" }]
      : []),
    ...(data.ageGroups.length > 0
      ? [{ id: "age", label: "MDR by Age Group" }]
      : []),
  ];

  const dedup = (data.originalCount || 0) - (data.uniqueCount || 0);

  // ── App shell ─────────────────────────────────────────────
  return (
    <div style={S.page}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        body{margin:0;overflow-x:hidden}
        ::-webkit-scrollbar{height:4px;width:4px}
        ::-webkit-scrollbar-track{background:#f1f5f9}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:2px}
      `}</style>
      <div style={S.wrap}>
        {/* ── Header bar ── */}
        <div
          style={{
            ...S.card,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            padding: "12px 18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                background: "#2563eb",
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="20"
                height="20"
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
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  flexWrap: "wrap",
                }}
              >
                Antibiogram Analyzer
                {isDemo && (
                  <span
                    style={{ ...S.badge("#fef3c7", "#92400e"), fontSize: 10 }}
                  >
                    Demo
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>
                {data.uniqueCount?.toLocaleString()} isolates ·{" "}
                {data.bacteria.length} organisms · {data.antibiotics.length}{" "}
                antibiotics
                {dedup > 0 && (
                  <span style={{ color: "#0369a1", marginLeft: 6 }}>
                    · {dedup} duplicates removed
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={S.btnOut} onClick={downloadTemplate}>
              ⬇ Template
            </button>
            <button style={S.btnOut} onClick={reset}>
              ← Change File
            </button>
          </div>
        </div>

        {/* ── Quality flags ── */}
        {data.flags && <FlagPanel flags={data.flags} dedup={dedup} />}

        {/* ── Tab bar ── */}
        <div
          style={{
            ...S.card,
            padding: 8,
            display: "flex",
            gap: 6,
            flexWrap: "nowrap",
            overflowX: "auto",
            marginBottom: 0,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              style={S.tab(activeTab === t.id)}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Filters (heatmap only) ── */}
        {activeTab === "heatmap" && filters && (
          <FilterPanel
            data={data}
            filters={filters}
            onChange={setFilters}
            tier={tier}
            setTier={setTier}
          />
        )}

        {/* ── Tab content ── */}
        <div style={S.card}>
          {activeTab === "heatmap" && filters && (
            <HeatmapTab data={data} filters={filters} tier={tier} />
          )}
          {activeTab === "time" && <TimeTrendTab data={data} />}
          {activeTab === "gender" && <SexTab data={data} />}
          {activeTab === "age" && <AgeTab data={data} />}
        </div>
      </div>
    </div>
  );
}
