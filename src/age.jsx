// ============================================================
// age.js
// MDR / XDR / PDR Analysis by Age Group
// Uses ECDC/CDC 2012 definitions from calculate.js.
// Shows: summary cards, age-gradient bar chart,
//        MDR rate across age groups (line), per-organism heatmap.
// ============================================================

import { useState, useMemo } from "react";
import {
  buildMDRStats,
  MDR_COLORS,
  AGE_ORDER,
  abbrevBact,
} from "./calculate.jsx";
import { S } from "./simulated.jsx";

// ────────────────────────────────────────────────────────────
// COLOR MAP — age groups (cool → warm = young → old)
// ────────────────────────────────────────────────────────────
export const AGE_COLORS = {
  "Under 18": "#10b981",
  "18–29": "#3b82f6",
  "30–44": "#8b5cf6",
  "45–59": "#f59e0b",
  "60–74": "#ef4444",
  "75+": "#dc2626",
};
const getAgeColor = (g) => AGE_COLORS[g] || "#6b7280";

const MDR_ORDER = ["PDR", "XDR", "MDR", "Non-MDR"];

// ────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────
export function AgeTab({ data }) {
  const groups = data.ageGroups; // already in AGE_ORDER

  const mdrStats = useMemo(
    () => buildMDRStats(data.rawTests, "ageGroup", groups),
    [data, groups]
  );

  if (!groups.length) {
    return (
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>
          MDR/XDR/PDR by Age Group
        </div>
        <div style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>
          No age data found in the dataset.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader />
      <DefinitionBanner />
      <SummaryCards groups={groups} mdrStats={mdrStats} />
      <AgeGradientChart groups={groups} mdrStats={mdrStats} />
      <MDRLineChart groups={groups} mdrStats={mdrStats} />
      <OrganismHeatmap data={data} groups={groups} mdrStats={mdrStats} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ────────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>
      MDR / XDR / PDR Analysis by Age Group
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
      = resistant to ALL tested categories &nbsp;·&nbsp;
      <span style={{ color: MDR_COLORS.XDR.border, fontWeight: 700 }}>
        XDR
      </span>{" "}
      = susceptible to ≤2 categories &nbsp;·&nbsp;
      <span style={{ color: MDR_COLORS.MDR.border, fontWeight: 700 }}>
        MDR
      </span>{" "}
      = non-susceptible in ≥3 antibiotic categories &nbsp;·&nbsp;
      <span style={{ color: MDR_COLORS["Non-MDR"].border, fontWeight: 700 }}>
        Non-MDR
      </span>{" "}
      = does not meet above criteria.
      <span style={{ color: "#9ca3af", marginLeft: 6 }}>
        Per-isolate classification using organism-specific category lists.
      </span>
    </div>
  );
}

function SummaryCards({ groups, mdrStats }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
        gap: 10,
        marginBottom: 20,
      }}
    >
      {groups.map((g) => {
        const s = mdrStats[g];
        if (!s) return null;
        const c = getAgeColor(g);
        const mdrPlus = s.pdrPct + s.xdrPct + s.mdrPct;

        return (
          <div
            key={g}
            style={{
              ...S.card,
              border: `2px solid ${c}22`,
              borderTop: `4px solid ${c}`,
              padding: 14,
              marginBottom: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: c, fontSize: 14 }}>
                  {g}
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                  {s.total.toLocaleString()} isolates
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 22,
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
                <div style={{ fontSize: 9, color: "#9ca3af" }}>MDR+</div>
              </div>
            </div>

            {/* Stacked mini bar */}
            <div
              style={{
                height: 12,
                borderRadius: 6,
                overflow: "hidden",
                display: "flex",
                background: "#f3f4f6",
              }}
            >
              {[
                { cat: "PDR", pct: s.pdrPct },
                { cat: "XDR", pct: s.xdrPct },
                { cat: "MDR", pct: s.mdrPct },
                { cat: "Non-MDR", pct: s.nonMdrPct },
              ].map((d) =>
                d.pct > 0 ? (
                  <div
                    key={d.cat}
                    title={`${d.cat}: ${d.pct}%`}
                    style={{
                      width: `${d.pct}%`,
                      background: MDR_COLORS[d.cat].border,
                    }}
                  />
                ) : null
              )}
            </div>

            {/* 3 main stats row */}
            <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
              {[
                { l: "PDR", v: s.pdrPct, bg: "#fef2f2", tc: "#991b1b" },
                { l: "XDR", v: s.xdrPct, bg: "#fff7ed", tc: "#9a3412" },
                { l: "MDR", v: s.mdrPct, bg: "#fefce8", tc: "#713f12" },
              ].map((d) => (
                <div
                  key={d.l}
                  style={{
                    flex: 1,
                    background: d.bg,
                    borderRadius: 5,
                    padding: "4px 0",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 9, color: "#9ca3af" }}>{d.l}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: d.tc }}>
                    {d.v}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Horizontal stacked bar chart — one bar per age group */
function AgeGradientChart({ groups, mdrStats }) {
  const maxN = Math.max(...groups.map((g) => mdrStats[g]?.total || 0), 1);

  return (
    <div style={{ ...S.card, marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
        MDR Classification Distribution by Age Group
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {groups.map((g) => {
          const s = mdrStats[g];
          if (!s) return null;
          const c = getAgeColor(g);
          const mdrPlus = s.pdrPct + s.xdrPct + s.mdrPct;

          return (
            <div
              key={g}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              {/* Age label */}
              <div
                style={{
                  width: 72,
                  textAlign: "right",
                  fontSize: 12,
                  fontWeight: 600,
                  color: c,
                  flexShrink: 0,
                }}
              >
                {g}
              </div>
              {/* Full-width stacked bar (relative to group's own 100%) */}
              <div
                style={{
                  flex: 1,
                  height: 22,
                  borderRadius: 4,
                  overflow: "hidden",
                  display: "flex",
                  background: "#f3f4f6",
                }}
              >
                {MDR_ORDER.map((cat) => {
                  const pct =
                    cat === "Non-MDR"
                      ? s.nonMdrPct
                      : Math.round(((s[cat] || 0) / (s.total || 1)) * 100);
                  return pct > 0 ? (
                    <div
                      key={cat}
                      title={`${cat}: ${pct}%`}
                      style={{
                        width: `${pct}%`,
                        background: MDR_COLORS[cat].border,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {pct >= 10 && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            color: "#fff",
                          }}
                        >
                          {pct}%
                        </span>
                      )}
                    </div>
                  ) : null;
                })}
              </div>
              {/* MDR+ badge */}
              <div
                style={{
                  width: 52,
                  textAlign: "right",
                  fontSize: 12,
                  fontWeight: 800,
                  color:
                    mdrPlus >= 60
                      ? "#dc2626"
                      : mdrPlus >= 30
                      ? "#f59e0b"
                      : "#16a34a",
                  flexShrink: 0,
                }}
              >
                {mdrPlus}%
              </div>
              {/* Sample size */}
              <div
                style={{
                  width: 52,
                  textAlign: "right",
                  fontSize: 10,
                  color: "#9ca3af",
                  flexShrink: 0,
                }}
              >
                n={s.total.toLocaleString()}
              </div>
            </div>
          );
        })}
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
        <span style={{ marginLeft: "auto", color: "#9ca3af" }}>
          Right column = % MDR+
        </span>
      </div>
    </div>
  );
}

/** SVG line chart — MDR+ rate across age groups */
function MDRLineChart({ groups, mdrStats }) {
  const pts = groups.map((g, i) => {
    const s = mdrStats[g];
    const mdrPlus = s ? s.pdrPct + s.xdrPct + s.mdrPct : 0;
    return { x: i, y: mdrPlus, g };
  });

  const W = 560,
    H = 180,
    PL = 40,
    PR = 20,
    PT = 20,
    PB = 36;
  const IW2 = W - PL - PR,
    IH2 = H - PT - PB;
  const maxY = Math.min(100, Math.max(...pts.map((p) => p.y)) + 12);
  const minY = Math.max(0, Math.min(...pts.map((p) => p.y)) - 8);
  const xS = (i) => PL + (i / Math.max(groups.length - 1, 1)) * IW2;
  const yS = (v) => PT + IH2 - ((v - minY) / Math.max(maxY - minY, 1)) * IH2;

  const linePath = pts
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${xS(i).toFixed(1)},${yS(p.y).toFixed(1)}`
    )
    .join(" ");
  const areaPath = `M${xS(0)},${yS(minY)} ${pts
    .map((p, i) => `L${xS(i)},${yS(p.y)}`)
    .join(" ")} L${xS(pts.length - 1)},${yS(minY)} Z`;

  // Y ticks
  const step = Math.max(5, Math.ceil((maxY - minY) / 4 / 5) * 5);
  const yTicks = [];
  for (let v = Math.ceil(minY / step) * step; v <= maxY; v += step)
    yTicks.push(v);

  return (
    <div style={{ ...S.card, marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
        MDR+ Rate Across Age Groups
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", maxWidth: W, display: "block" }}
      >
        <defs>
          <linearGradient id="ageAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={PL}
              y1={yS(v)}
              x2={W - PR}
              y2={yS(v)}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
            <text
              x={PL - 6}
              y={yS(v) + 4}
              textAnchor="end"
              fontSize="10"
              fill="#9ca3af"
            >
              {v}%
            </text>
          </g>
        ))}
        <path d={areaPath} fill="url(#ageAreaGrad)" stroke="none" />
        <path
          d={linePath}
          stroke="#8b5cf6"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <g key={i}>
            <circle
              cx={xS(i)}
              cy={yS(p.y)}
              r="5.5"
              fill="white"
              stroke={getAgeColor(p.g)}
              strokeWidth="2.5"
            />
            <circle cx={xS(i)} cy={yS(p.y)} r="2.5" fill={getAgeColor(p.g)} />
            <text
              x={xS(i)}
              y={yS(p.y) - 10}
              textAnchor="middle"
              fontSize="10"
              fontWeight="800"
              fill={getAgeColor(p.g)}
            >
              {p.y}%
            </text>
            <text
              x={xS(i)}
              y={H - PB + 14}
              textAnchor="middle"
              fontSize="10"
              fill={getAgeColor(p.g)}
              fontWeight="600"
            >
              {p.g}
            </text>
          </g>
        ))}
        <line
          x1={PL}
          y1={PT}
          x2={PL}
          y2={PT + IH2}
          stroke="#e5e7eb"
          strokeWidth="1.5"
        />
        <line
          x1={PL}
          y1={PT + IH2}
          x2={W - PR}
          y2={PT + IH2}
          stroke="#e5e7eb"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

/** Per-organism × age-group MDR heatmap table */
function OrganismHeatmap({ data, groups, mdrStats }) {
  const [showAll, setShowAll] = useState(false);
  const topOrganisms = showAll ? data.bacteria : data.bacteria.slice(0, 12);

  return (
    <div style={S.card}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
        MDR+ (%) by Organism × Age Group
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
                }}
              >
                Organism
              </th>
              {groups.map((g) => (
                <th
                  key={g}
                  style={{
                    padding: "7px 8px",
                    textAlign: "center",
                    borderBottom: "2px solid #e5e7eb",
                    fontWeight: 700,
                    color: getAgeColor(g),
                    whiteSpace: "nowrap",
                  }}
                >
                  {g}
                </th>
              ))}
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
                {groups.map((g) => {
                  const bd = mdrStats[g]?.byBact[b];
                  if (!bd || bd.total === 0) {
                    return (
                      <td
                        key={g}
                        style={{
                          padding: "7px 8px",
                          textAlign: "center",
                          borderBottom: "1px solid #f3f4f6",
                          color: "#e5e7eb",
                        }}
                      >
                        —
                      </td>
                    );
                  }
                  const mdrPlus = Math.round(
                    ((bd.MDR + bd.XDR + bd.PDR) / bd.total) * 100
                  );
                  const c = getAgeColor(g);
                  // Cell color — blend age color saturation with MDR severity
                  const bg =
                    mdrPlus >= 70
                      ? "#fef2f2"
                      : mdrPlus >= 40
                      ? "#fefce8"
                      : "#f0fdf4";
                  const tc =
                    mdrPlus >= 70
                      ? "#dc2626"
                      : mdrPlus >= 40
                      ? "#92400e"
                      : "#15803d";
                  return (
                    <td
                      key={g}
                      style={{
                        padding: "7px 8px",
                        textAlign: "center",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      <div
                        style={{
                          background: bg,
                          color: tc,
                          borderRadius: 6,
                          padding: "3px 6px",
                          fontWeight: 700,
                          display: "inline-block",
                          minWidth: 38,
                        }}
                      >
                        {mdrPlus}%
                      </div>
                      <div
                        style={{ fontSize: 9, color: "#9ca3af", marginTop: 1 }}
                      >
                        n={bd.total}
                      </div>
                    </td>
                  );
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
      <div style={{ marginTop: 10, fontSize: 11, color: "#9ca3af" }}>
        Cell value = % MDR+ (MDR + XDR + PDR combined). Hover rows to compare
        across age groups.
      </div>
    </div>
  );
}
