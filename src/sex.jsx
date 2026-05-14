// ============================================================
// sex.js
// MDR/XDR/PDR Analysis by Gender (Sex)
// Uses ECDC/CDC 2012 definitions from calculate.js.
// Shows: summary cards, stacked-bar overview,
//        comparison bar chart, per-organism breakdown table.
// ============================================================

import { useState, useMemo } from "react";
import { buildMDRStats, MDR_COLORS, abbrevBact } from "./calculate.jsx";
import { S } from "./simulated.jsx";

// ────────────────────────────────────────────────────────────
// COLOR MAP — gender
// ────────────────────────────────────────────────────────────
export const GENDER_COLORS = {
  Male: "#3b82f6",
  Female: "#ec4899",
};
const getGenderColor = (g) => GENDER_COLORS[g] || "#6b7280";

const MDR_ORDER = ["PDR", "XDR", "MDR", "Non-MDR"];

// ────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────
export function SexTab({ data }) {
  const groups = data.genders;

  const mdrStats = useMemo(
    () => buildMDRStats(data.rawTests, "gender", groups),
    [data, groups]
  );

  if (!groups.length) {
    return (
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>
          MDR/XDR/PDR by Gender
        </div>
        <div style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>
          No gender data found in the dataset.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader />
      <DefinitionBanner />
      <SummaryCards
        groups={groups}
        mdrStats={mdrStats}
        getColor={getGenderColor}
      />
      <ComparisonChart
        groups={groups}
        mdrStats={mdrStats}
        getColor={getGenderColor}
      />
      <OrganismTable
        data={data}
        groups={groups}
        mdrStats={mdrStats}
        getColor={getGenderColor}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ────────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>
      MDR / XDR / PDR Analysis by Gender
    </div>
  );
}

function DefinitionBanner() {
  return (
    <div
      style={{
        fontSize: 12,
        color: "#6b7280",
        marginBottom: 16,
        lineHeight: 1.65,
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "10px 14px",
      }}
    >
      <strong>
        Definitions — ECDC/CDC 2012 (Magiorakos et al., Clin Microbiol Infect
        18:3):
      </strong>
      &nbsp;
      <span style={{ color: MDR_COLORS.PDR.border, fontWeight: 700 }}>
        PDR
      </span>{" "}
      = resistant to ALL antibiotic categories tested &nbsp;·&nbsp;
      <span style={{ color: MDR_COLORS.XDR.border, fontWeight: 700 }}>
        XDR
      </span>{" "}
      = susceptible to ≤2 categories (all others resistant) &nbsp;·&nbsp;
      <span style={{ color: MDR_COLORS.MDR.border, fontWeight: 700 }}>
        MDR
      </span>{" "}
      = non-susceptible in ≥1 agent from ≥3 antibiotic categories &nbsp;·&nbsp;
      <span style={{ color: MDR_COLORS["Non-MDR"].border, fontWeight: 700 }}>
        Non-MDR
      </span>{" "}
      = does not meet above criteria.
    </div>
  );
}

function SummaryCards({ groups, mdrStats, getColor }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
        gap: 12,
        marginBottom: 20,
      }}
    >
      {groups.map((g) => {
        const s = mdrStats[g];
        if (!s) return null;
        const c = getColor(g);
        const mdrPlus = s.pdrPct + s.xdrPct + s.mdrPct;
        const mdrData = MDR_ORDER.map((cat) => ({
          label: cat,
          n: s[cat] || 0,
          pct:
            cat === "Non-MDR"
              ? s.nonMdrPct
              : s[`${cat.toLowerCase()}Pct`] ||
                Math.round(((s[cat] || 0) / (s.total || 1)) * 100),
          color: MDR_COLORS[cat].border,
        }));

        return (
          <div
            key={g}
            style={{
              ...S.card,
              border: `2px solid ${c}`,
              padding: 18,
              marginBottom: 0,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: `${c}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={c}
                  strokeWidth="2"
                >
                  {g === "Male" ? (
                    <>
                      <circle cx="10" cy="7" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7" />
                      <line x1="16" y1="3" x2="21" y2="3" />
                      <line x1="21" y1="3" x2="21" y2="8" />
                      <line x1="15" y1="9" x2="21" y2="3" />
                    </>
                  ) : (
                    <>
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </>
                  )}
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: c, fontSize: 16 }}>
                  {g}
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                  {s.total.toLocaleString()} isolates
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color:
                      mdrPlus >= 60
                        ? "#dc2626"
                        : mdrPlus >= 30
                        ? "#f59e0b"
                        : "#16a34a",
                    lineHeight: 1,
                  }}
                >
                  {mdrPlus}%
                </div>
                <div style={{ fontSize: 10, color: "#6b7280" }}>MDR+</div>
              </div>
            </div>

            {/* Stacked bar */}
            <div
              style={{
                height: 20,
                borderRadius: 10,
                overflow: "hidden",
                display: "flex",
                marginBottom: 12,
                background: "#f3f4f6",
              }}
            >
              {mdrData.map((d) =>
                d.pct > 0 ? (
                  <div
                    key={d.label}
                    title={`${d.label}: ${d.pct}% (n=${d.n})`}
                    style={{
                      width: `${d.pct}%`,
                      background: d.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "width .4s",
                    }}
                  >
                    {d.pct >= 8 && (
                      <span
                        style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}
                      >
                        {d.pct}%
                      </span>
                    )}
                  </div>
                ) : null
              )}
            </div>

            {/* Legend grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "5px 12px",
              }}
            >
              {mdrData.map((d) => (
                <div
                  key={d.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: d.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: "#374151" }}>{d.label}</span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontWeight: 700,
                      color: d.color,
                    }}
                  >
                    {d.n}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ComparisonChart({ groups, mdrStats, getColor }) {
  const maxTotal = Math.max(
    ...groups.map(
      (g) =>
        (mdrStats[g]?.pdrPct || 0) +
        (mdrStats[g]?.xdrPct || 0) +
        (mdrStats[g]?.mdrPct || 0)
    ),
    1
  );

  return (
    <div style={{ ...S.card, marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
        MDR+ Rate Comparison (PDR + XDR + MDR)
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 32,
          height: 200,
          padding: "0 16px",
        }}
      >
        {groups.map((g) => {
          const s = mdrStats[g];
          if (!s) return null;
          const c = getColor(g);
          const total = s.pdrPct + s.xdrPct + s.mdrPct;
          const h = Math.max(4, Math.round((total / maxTotal) * 170));
          const pdrH = Math.round((s.pdrPct / (total || 1)) * h);
          const xdrH = Math.round((s.xdrPct / (total || 1)) * h);
          const mdrH = h - pdrH - xdrH;

          return (
            <div
              key={g}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 800, color: c }}>
                {total}%
              </div>
              <div
                style={{
                  width: "55%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "6px 6px 0 0",
                  overflow: "hidden",
                  minWidth: 40,
                }}
              >
                {pdrH > 0 && (
                  <div
                    style={{ height: pdrH, background: MDR_COLORS.PDR.border }}
                    title={`PDR: ${s.pdrPct}%`}
                  />
                )}
                {xdrH > 0 && (
                  <div
                    style={{ height: xdrH, background: MDR_COLORS.XDR.border }}
                    title={`XDR: ${s.xdrPct}%`}
                  />
                )}
                {mdrH > 0 && (
                  <div
                    style={{ height: mdrH, background: MDR_COLORS.MDR.border }}
                    title={`MDR: ${s.mdrPct}%`}
                  />
                )}
              </div>
              <div
                style={{
                  height: 3,
                  width: "60%",
                  background: c,
                  borderRadius: 2,
                }}
              />
              <div style={{ fontSize: 13, fontWeight: 700, color: c }}>{g}</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>
                {s.total.toLocaleString()} iso.
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini breakdown bars per category */}
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}
      >
        {MDR_ORDER.map((cat) => (
          <div
            key={cat}
            style={{
              flex: "1 1 160px",
              background: "#f8fafc",
              borderRadius: 8,
              padding: "8px 12px",
              border: "1px solid #f3f4f6",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: MDR_COLORS[cat].border,
                marginBottom: 6,
              }}
            >
              {cat}
            </div>
            {groups.map((g) => {
              const s = mdrStats[g];
              const pct =
                cat === "Non-MDR"
                  ? s?.nonMdrPct
                  : Math.round(((s?.[cat] || 0) / (s?.total || 1)) * 100);
              return (
                <div key={g} style={{ marginBottom: 4 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      marginBottom: 2,
                    }}
                  >
                    <span style={{ color: getColor(g) }}>{g}</span>
                    <span style={{ fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div
                    style={{
                      height: 5,
                      background: "#e5e7eb",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: MDR_COLORS[cat].border,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 12,
          fontSize: 11,
          flexWrap: "wrap",
        }}
      >
        {MDR_ORDER.map((cat) => (
          <span
            key={cat}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: MDR_COLORS[cat].border,
              }}
            />
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}

function OrganismTable({ data, groups, mdrStats, getColor }) {
  const [showAll, setShowAll] = useState(false);
  const topOrganisms = showAll ? data.bacteria : data.bacteria.slice(0, 12);

  return (
    <div style={S.card}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
        MDR Classification by Organism × Gender
      </div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th
                style={{
                  padding: "7px 10px",
                  textAlign: "left",
                  borderBottom: "2px solid #e5e7eb",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                Organism
              </th>
              {groups.map((g) => (
                <th
                  key={g}
                  colSpan={4}
                  style={{
                    padding: "7px 10px",
                    textAlign: "center",
                    borderBottom: "2px solid #e5e7eb",
                    fontWeight: 700,
                    color: getColor(g),
                  }}
                >
                  {g}
                </th>
              ))}
            </tr>
            <tr style={{ background: "#f9fafb" }}>
              <th
                style={{
                  padding: "4px 10px",
                  borderBottom: "1px solid #e5e7eb",
                }}
              />
              {groups.flatMap((g) =>
                MDR_ORDER.map((cat) => (
                  <th
                    key={g + cat}
                    style={{
                      padding: "4px 5px",
                      textAlign: "center",
                      borderBottom: "1px solid #e5e7eb",
                      fontSize: 10,
                      color: MDR_COLORS[cat].border,
                      fontWeight: 700,
                    }}
                  >
                    {cat === "Non-MDR" ? "Non" : cat}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {topOrganisms.map((b, i) => (
              <tr key={b} style={{ background: i % 2 ? "#f9fafb" : "#fff" }}>
                <td
                  style={{
                    padding: "7px 10px",
                    borderBottom: "1px solid #f3f4f6",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {abbrevBact(b)}
                </td>
                {groups.flatMap((g) => {
                  const bd = mdrStats[g]?.byBact[b];
                  return MDR_ORDER.map((cat) => {
                    const n = bd?.[cat] || 0;
                    const tot = bd?.total || 0;
                    const pct = tot > 0 ? Math.round((n / tot) * 100) : 0;
                    return (
                      <td
                        key={g + cat}
                        style={{
                          padding: "6px 5px",
                          textAlign: "center",
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        {tot > 0 && n > 0 ? (
                          <span
                            style={{
                              background: MDR_COLORS[cat].bg,
                              color: MDR_COLORS[cat].text,
                              padding: "2px 6px",
                              borderRadius: 8,
                              fontWeight: 700,
                              fontSize: 11,
                            }}
                          >
                            {pct}%
                          </span>
                        ) : (
                          <span style={{ color: "#e5e7eb" }}>—</span>
                        )}
                      </td>
                    );
                  });
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.bacteria.length > 12 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          style={{
            ...S.btn("#f3f4f6", "#374151"),
            marginTop: 10,
            fontSize: 12,
          }}
        >
          {showAll
            ? "▲ Show less"
            : `▼ Show all ${data.bacteria.length} organisms`}
        </button>
      )}
    </div>
  );
}
