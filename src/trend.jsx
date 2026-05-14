// ============================================================
// trend.jsx  —  Temporal Resistance Trends
// ============================================================
// Features:
//   • Single-select mode: one organism × one antibiotic
//   • Compare mode: up to 4 organisms for the same antibiotic
//   • SVG line chart — ONE consistent index system throughout
//     (all coordinates derived from the same xOf/yOf functions)
//   • OLS regression line drawn on same index → aligned correctly
//   • 95% CI band (standard error at each x position)
//   • Monthly data table with R/I/S breakdown
//   • Trend badge: slope, R², direction
// ============================================================

import { useState, useMemo } from "react";
import { linearRegression, resistColor } from "./calculate.jsx";
import { S } from "./simulated.jsx";

// ────────────────────────────────────────────────────────────
// CHART CONSTANTS
// ────────────────────────────────────────────────────────────
const W = 860;
const H = 320;
const PADL = 48;
const PADR = 16;
const PADT = 24;
const PADB = 56;
const IW = W - PADL - PADR;
const IH = H - PADT - PADB;

const SERIES_COLORS = ["#2563eb", "#dc2626", "#16a34a", "#d97706"];

// ────────────────────────────────────────────────────────────
// COORDINATE HELPERS  (single source of truth)
// ────────────────────────────────────────────────────────────

/** Data index i (0..total-1) → SVG x pixel */
const xOf = (i, total) => PADL + (i / Math.max(total - 1, 1)) * IW;

/** Resistance value v → SVG y pixel given axis [lo, hi] */
const yOf = (v, lo, hi) => PADT + IH - ((v - lo) / Math.max(hi - lo, 1)) * IH;

const clamp = (v) => Math.max(0, Math.min(100, v));

// ────────────────────────────────────────────────────────────
// PATH BUILDERS
// ────────────────────────────────────────────────────────────

/** Catmull-Rom smooth polyline through {x,y} points */
function smoothPath(pts) {
  if (pts.length < 2)
    return pts.length === 1
      ? `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
      : "";
  const T = 0.35;
  const d = [`M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) * T;
    const cp1y = p1.y + (p2.y - p0.y) * T;
    const cp2x = p2.x - (p3.x - p1.x) * T;
    const cp2y = p2.y - (p3.y - p1.y) * T;
    d.push(
      `C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ` +
        `${cp2x.toFixed(1)},${cp2y.toFixed(1)} ` +
        `${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
    );
  }
  return d.join(" ");
}

/** Area fill from pts down to baseY */
function buildAreaPath(pts, baseY) {
  if (pts.length < 2) return "";
  return (
    `M${pts[0].x.toFixed(1)},${baseY.toFixed(1)} ` +
    pts.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") +
    ` L${pts[pts.length - 1].x.toFixed(1)},${baseY.toFixed(1)} Z`
  );
}

/**
 * Build regression line + CI band SVG paths.
 * IMPORTANT: regression was fitted on index 0..n-1 where n = pts.length.
 * We map those indices back to x coordinates using xOf(i, total)
 * where total is the length of pts (= same n used in regression).
 */
function buildRegPaths(reg, pts, lo, hi) {
  if (!reg || pts.length < 3) return { regPath: "", ciPath: "" };
  const { slope, intercept, se, sxx, n: rn } = reg;
  const meanX = (rn - 1) / 2;
  const total = pts.length; // same as rn

  // Regression endpoints on the actual x positions of pts
  const ry0 = clamp(intercept);
  const ry1 = clamp(slope * (total - 1) + intercept);
  const regPath =
    `M${pts[0].x.toFixed(1)},${yOf(ry0, lo, hi).toFixed(1)} ` +
    `L${pts[total - 1].x.toFixed(1)},${yOf(ry1, lo, hi).toFixed(1)}`;

  // CI band sampled at each pt's x coordinate
  const top = [],
    bot = [];
  for (let i = 0; i < total; i++) {
    const pred = slope * i + intercept;
    const seI =
      se * Math.sqrt(1 / rn + (i - meanX) ** 2 / Math.max(sxx, 1e-10));
    const margin = 1.96 * seI;
    top.push({ x: pts[i].x, y: yOf(clamp(pred + margin), lo, hi) });
    bot.push({ x: pts[i].x, y: yOf(clamp(pred - margin), lo, hi) });
  }
  const ciPath =
    `M${top[0].x.toFixed(1)},${top[0].y.toFixed(1)} ` +
    top
      .slice(1)
      .map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ") +
    " " +
    [...bot]
      .reverse()
      .map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ") +
    " Z";

  return { regPath, ciPath };
}

// ────────────────────────────────────────────────────────────
// DATA HELPER
// ────────────────────────────────────────────────────────────

function buildSeries(timeSeries, bact, ab) {
  return Object.keys(timeSeries)
    .sort()
    .map((m) => {
      const d = timeSeries[m][`${bact}|${ab}`];
      return {
        month: m,
        rate: d && d.total > 0 ? Math.round((d.R / d.total) * 100) : null,
        Rn: d?.R || 0,
        In: d?.I || 0,
        Sn: d?.S || 0,
        n: d?.total || 0,
      };
    })
    .filter((d) => d.n > 0);
}

// ────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────
export function TimeTrendTab({ data }) {
  const [mode, setMode] = useState("single");
  const [bact, setBact] = useState(data.bacteria[0] || "");
  const [ab, setAb] = useState(data.antibiotics[0] || "");
  const [cmpAb, setCmpAb] = useState(data.antibiotics[0] || "");
  const [cmpBacts, setCmpBacts] = useState(data.bacteria.slice(0, 3));
  const [showReg, setShowReg] = useState(true);

  // Single series
  const singleSeries = useMemo(
    () => buildSeries(data.timeSeries, bact, ab),
    [data.timeSeries, bact, ab]
  );
  const singleReg = useMemo(() => {
    const pts = singleSeries
      .filter((d) => d.rate !== null)
      .map((d, i) => ({ x: i, y: d.rate }));
    return linearRegression(pts);
  }, [singleSeries]);

  // Compare series
  const compareSeries = useMemo(
    () =>
      cmpBacts.map((b, si) => ({
        label: b,
        color: SERIES_COLORS[si % SERIES_COLORS.length],
        points: buildSeries(data.timeSeries, b, cmpAb),
      })),
    [data.timeSeries, cmpBacts, cmpAb]
  );

  // Shared axis bounds
  const activePoints =
    mode === "single" ? singleSeries : compareSeries.flatMap((s) => s.points);
  const allRates = activePoints
    .filter((d) => d.rate !== null)
    .map((d) => d.rate);
  const yLo = Math.max(0, allRates.length ? Math.min(...allRates) - 8 : 0);
  const yHi = Math.min(100, allRates.length ? Math.max(...allRates) + 12 : 80);

  const tickStep = Math.max(5, Math.ceil((yHi - yLo) / 5 / 5) * 5);
  const yTicks = [];
  for (let v = Math.ceil(yLo / tickStep) * tickStep; v <= yHi; v += tickStep)
    yTicks.push(v);

  const allMonths = useMemo(() => {
    const s = new Set(
      compareSeries.flatMap((s) => s.points.map((p) => p.month))
    );
    return [...s].sort();
  }, [compareSeries]);

  const hasData =
    mode === "single"
      ? singleSeries.length > 0
      : compareSeries.some((s) => s.points.length > 0);

  const trendLabel = (reg) =>
    !reg
      ? ""
      : reg.slope > 0.8
      ? "↑ Increasing resistance"
      : reg.slope < -0.8
      ? "↓ Decreasing resistance"
      : "→ Stable trend";
  const trendColor = (reg) =>
    !reg
      ? "#6b7280"
      : reg.slope > 0.8
      ? "#dc2626"
      : reg.slope < -0.8
      ? "#16a34a"
      : "#6b7280";

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>
        Temporal Trends
      </div>

      {/* Controls */}
      <div style={{ ...S.card, padding: "14px 16px", marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          {[
            ["single", "Single Series"],
            ["compare", "Compare Organisms"],
          ].map(([m, l]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                ...S.tab(mode === m),
                border: `1px solid ${mode === m ? "#2563eb" : "#d1d5db"}`,
              }}
            >
              {l}
            </button>
          ))}
          <label
            style={{
              marginLeft: "auto",
              fontSize: 12,
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              gap: 5,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={showReg}
              onChange={(e) => setShowReg(e.target.checked)}
            />
            Show regression
          </label>
        </div>

        {mode === "single" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              maxWidth: 560,
            }}
          >
            <div>
              <label style={S.lbl}>Organism</label>
              <select
                value={bact}
                onChange={(e) => setBact(e.target.value)}
                style={S.inp}
              >
                {data.bacteria.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={S.lbl}>Antibiotic</label>
              <select
                value={ab}
                onChange={(e) => setAb(e.target.value)}
                style={S.inp}
              >
                {data.antibiotics.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {mode === "compare" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: 16,
              alignItems: "start",
            }}
          >
            <div>
              <label style={S.lbl}>Antibiotic (fixed)</label>
              <select
                value={cmpAb}
                onChange={(e) => setCmpAb(e.target.value)}
                style={S.inp}
              >
                {data.antibiotics.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>
                Compares resistance to this antibiotic across selected
                organisms.
              </div>
            </div>
            <div>
              <label style={S.lbl}>Organisms to compare (max 4)</label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 5,
                  padding: "8px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: 7,
                  background: "#fff",
                  maxHeight: 110,
                  overflowY: "auto",
                }}
              >
                {data.bacteria.map((b) => {
                  const idx = cmpBacts.indexOf(b);
                  const checked = idx !== -1;
                  const col = checked ? SERIES_COLORS[idx] : "#d1d5db";
                  return (
                    <label
                      key={b}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        cursor: "pointer",
                        padding: "3px 8px",
                        borderRadius: 5,
                        background: checked ? col + "18" : "transparent",
                        border: `1px solid ${checked ? col : "transparent"}`,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (cmpBacts.length < 4)
                              setCmpBacts([...cmpBacts, b]);
                          } else {
                            setCmpBacts(cmpBacts.filter((x) => x !== b));
                          }
                        }}
                      />
                      <span
                        style={{
                          color: checked ? col : "#374151",
                          fontWeight: checked ? 600 : 400,
                        }}
                      >
                        {b
                          .split(" ")
                          .map((w, i) => (i === 0 ? w[0] + "." : w))
                          .join(" ")}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* No data */}
      {!hasData && (
        <div
          style={{
            ...S.card,
            textAlign: "center",
            padding: 48,
            color: "#9ca3af",
            fontSize: 13,
          }}
        >
          No data available for this combination.
        </div>
      )}

      {/* Single chart */}
      {hasData && mode === "single" && (
        <SingleChart
          series={singleSeries}
          reg={singleReg}
          showReg={showReg}
          yLo={yLo}
          yHi={yHi}
          yTicks={yTicks}
          title={`${bact} — ${ab}`}
          color={SERIES_COLORS[0]}
          trendLabel={trendLabel(singleReg)}
          trendColor={trendColor(singleReg)}
        />
      )}

      {/* Compare chart */}
      {hasData && mode === "compare" && (
        <CompareChart
          series={compareSeries}
          allMonths={allMonths}
          showReg={showReg}
          yLo={yLo}
          yHi={yHi}
          yTicks={yTicks}
          ab={cmpAb}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SINGLE CHART
// ────────────────────────────────────────────────────────────
function SingleChart({
  series,
  reg,
  showReg,
  yLo,
  yHi,
  yTicks,
  title,
  color,
  trendLabel,
  trendColor,
}) {
  const n = series.length;
  if (n === 0) return null;

  // Derive SVG coordinates — single index system 0..n-1
  const pts = series
    .filter((d) => d.rate !== null)
    .map((d, i) => ({
      // x must use the filtered index so regression (also 0..n-1) aligns
      x: xOf(i, series.filter((d) => d.rate !== null).length),
      y: yOf(d.rate, yLo, yHi),
      rate: d.rate,
    }));

  // For x-axis labels we use the full series (including any gaps)
  const labelPts = series.map((d, i) => ({
    x: xOf(i, n),
    month: d.month,
  }));

  const baseY = yOf(yLo, yLo, yHi);
  const lineSVG = smoothPath(pts);
  const areaSVG = buildAreaPath(pts, baseY);
  const { regPath, ciPath } =
    showReg && reg
      ? buildRegPaths(reg, pts, yLo, yHi)
      : { regPath: "", ciPath: "" };

  return (
    <div style={S.card}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 10,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>
            {title}
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
            Monthly resistance rate (%R) · {pts.length} data points
          </div>
        </div>
        {reg && showReg && (
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: trendColor }}>
              {trendLabel}
            </span>
            <span style={S.badge("#eff6ff", "#1e40af")}>
              R²&nbsp;=&nbsp;{reg.r2.toFixed(3)}
            </span>
            <span
              style={S.badge(
                reg.slope > 0 ? "#fef2f2" : "#f0fdf4",
                reg.slope > 0 ? "#991b1b" : "#166534"
              )}
            >
              {reg.slope > 0 ? "+" : ""}
              {reg.slope.toFixed(2)}&nbsp;%/month
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 10,
          fontSize: 12,
          flexWrap: "wrap",
        }}
      >
        <LegendLine color={color} label="Resistance rate" />
        {showReg && reg && (
          <LegendDash color="#dc2626" label="Regression line" />
        )}
        {showReg && reg && <LegendBand color="#dc262628" label="95% CI" />}
      </div>

      {/* SVG chart */}
      <ChartSVG
        yTicks={yTicks}
        yLo={yLo}
        yHi={yHi}
        labelPts={labelPts}
        total={n}
      >
        {/* Draw order: CI → area → regression → line → dots */}
        {ciPath && <path d={ciPath} fill="#dc262620" stroke="none" />}
        {areaSVG && <path d={areaSVG} fill={`${color}16`} stroke="none" />}
        {regPath && (
          <path
            d={regPath}
            stroke="#dc2626"
            strokeWidth="2"
            strokeDasharray="7,5"
            fill="none"
            opacity="0.9"
          />
        )}
        {lineSVG && (
          <path
            d={lineSVG}
            stroke={color}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {pts.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="5.5"
              fill="#fff"
              stroke={color}
              strokeWidth="2.5"
            />
            <circle cx={p.x} cy={p.y} r="2.5" fill={resistColor(p.rate)} />
            {/* Value labels — sparse when crowded */}
            {(pts.length <= 14 || i % 2 === 0) && pts.length <= 24 && (
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                fontSize="9.5"
                fontWeight="700"
                fill={resistColor(p.rate)}
              >
                {p.rate}%
              </text>
            )}
          </g>
        ))}
      </ChartSVG>

      {/* Monthly table */}
      <MonthlyTable series={series} />

      {/* Regression summary */}
      {showReg && reg && <RegressionSummary reg={reg} />}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// COMPARE CHART
// ────────────────────────────────────────────────────────────
function CompareChart({ series, allMonths, showReg, yLo, yHi, yTicks, ab }) {
  const total = allMonths.length;
  if (total === 0) return null;

  const monthIdx = Object.fromEntries(allMonths.map((m, i) => [m, i]));

  // Build SVG for each series
  const seriesSVG = series
    .map((s) => {
      const filtered = s.points.filter((d) => d.rate !== null);
      if (filtered.length === 0) return null;

      // pts use the *shared* x axis (monthIdx), so lines are time-aligned
      const pts = filtered.map((d) => ({
        x: xOf(monthIdx[d.month], total),
        y: yOf(d.rate, yLo, yHi),
        rate: d.rate,
      }));

      // Regression is fitted on 0..pts.length-1 (local index),
      // but x positions already match their month slots on the shared axis
      const reg =
        showReg && filtered.length >= 3
          ? linearRegression(filtered.map((d, i) => ({ x: i, y: d.rate })))
          : null;

      // For regression path, we need the first and last x of pts (shared axis)
      let regPath = "";
      if (reg) {
        const ry0 = clamp(reg.intercept);
        const ry1 = clamp(reg.slope * (pts.length - 1) + reg.intercept);
        regPath =
          `M${pts[0].x.toFixed(1)},${yOf(ry0, yLo, yHi).toFixed(1)} ` +
          `L${pts[pts.length - 1].x.toFixed(1)},${yOf(ry1, yLo, yHi).toFixed(
            1
          )}`;
      }

      return { ...s, pts, reg, regPath };
    })
    .filter(Boolean);

  const labelPts = allMonths.map((m, i) => ({ x: xOf(i, total), month: m }));

  return (
    <div style={S.card}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
        {ab} — Resistance Rate Comparison
      </div>
      <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 10 }}>
        Multiple organisms · shared monthly axis · {total} months
      </div>

      {/* Legend */}
      <div
        style={{ display: "flex", gap: 14, marginBottom: 12, flexWrap: "wrap" }}
      >
        {seriesSVG.map((s) => (
          <LegendLine
            key={s.label}
            color={s.color}
            label={s.label
              .split(" ")
              .map((w, i) => (i === 0 ? w[0] + "." : w))
              .join(" ")}
          />
        ))}
        {showReg && (
          <LegendDash color="#9ca3af" label="Regression (per series)" />
        )}
      </div>

      <ChartSVG
        yTicks={yTicks}
        yLo={yLo}
        yHi={yHi}
        labelPts={labelPts}
        total={total}
      >
        {seriesSVG.map((s, si) => (
          <g key={si}>
            {s.regPath && showReg && (
              <path
                d={s.regPath}
                stroke={s.color}
                strokeWidth="1.5"
                strokeDasharray="6,4"
                fill="none"
                opacity="0.6"
              />
            )}
            <path
              d={smoothPath(s.pts)}
              stroke={s.color}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {s.pts.map((p, pi) => (
              <circle
                key={pi}
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#fff"
                stroke={s.color}
                strokeWidth="2.5"
              />
            ))}
          </g>
        ))}
      </ChartSVG>

      {/* Per-series summary cards */}
      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: 10,
        }}
      >
        {seriesSVG.map((s, si) => {
          const rates = s.pts.map((p) => p.rate);
          const mean = rates.length
            ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
            : null;
          const reg = s.reg;
          return (
            <div
              key={si}
              style={{
                background: "#f8fafc",
                borderRadius: 10,
                padding: "10px 12px",
                border: `1px solid #e5e7eb`,
                borderLeft: `4px solid ${s.color}`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: s.color,
                  marginBottom: 7,
                }}
              >
                {s.label
                  .split(" ")
                  .map((w, i) => (i === 0 ? w[0] + "." : w))
                  .join(" ")}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 4,
                }}
              >
                {[
                  ["Mean", mean !== null ? `${mean}%` : "—"],
                  ["Min", rates.length ? `${Math.min(...rates)}%` : "—"],
                  ["Max", rates.length ? `${Math.max(...rates)}%` : "—"],
                  ["Points", s.pts.length],
                  [
                    "Trend",
                    reg
                      ? reg.slope > 0.8
                        ? "↑"
                        : reg.slope < -0.8
                        ? "↓"
                        : "→"
                      : "—",
                  ],
                  [
                    "Slope",
                    reg
                      ? `${reg.slope > 0 ? "+" : ""}${reg.slope.toFixed(1)}%`
                      : "—",
                  ],
                ].map(([k, v]) => (
                  <div key={k} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 9,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                      }}
                    >
                      {k}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#1f2937",
                      }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SHARED SVG WRAPPER
// Renders axes, grid, x-labels; children go inside clipPath
// ────────────────────────────────────────────────────────────
function ChartSVG({ yTicks, yLo, yHi, labelPts, total, children }) {
  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{
          width: "100%",
          minWidth: Math.max(360, total * 30),
          display: "block",
        }}
      >
        <defs>
          <clipPath id="chartClip">
            <rect x={PADL} y={PADT} width={IW} height={IH} />
          </clipPath>
        </defs>

        {/* Y grid + labels */}
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={PADL}
              y1={yOf(v, yLo, yHi)}
              x2={W - PADR}
              y2={yOf(v, yLo, yHi)}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
            <text
              x={PADL - 6}
              y={yOf(v, yLo, yHi) + 4}
              textAnchor="end"
              fontSize="10"
              fill="#9ca3af"
            >
              {v}%
            </text>
          </g>
        ))}

        {/* Clipped chart content */}
        <g clipPath="url(#chartClip)">{children}</g>

        {/* X axis month labels */}
        {labelPts.map((lp, i) => {
          if (total > 24 && i % 3 !== 0) return null;
          if (total > 12 && i % 2 !== 0) return null;
          const label = lp.month.slice(5) + "/" + lp.month.slice(2, 4);
          return (
            <text
              key={i}
              x={lp.x}
              y={H - PADB + 14}
              textAnchor="middle"
              fontSize="9.5"
              fill="#6b7280"
              transform={`rotate(-40,${lp.x},${H - PADB + 14})`}
            >
              {label}
            </text>
          );
        })}

        {/* Axes */}
        <line
          x1={PADL}
          y1={PADT}
          x2={PADL}
          y2={PADT + IH}
          stroke="#e5e7eb"
          strokeWidth="1.5"
        />
        <line
          x1={PADL}
          y1={PADT + IH}
          x2={W - PADR}
          y2={PADT + IH}
          stroke="#e5e7eb"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// MONTHLY TABLE
// ────────────────────────────────────────────────────────────
function MonthlyTable({ series }) {
  return (
    <div
      style={{
        marginTop: 16,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(82px,1fr))",
        gap: 5,
      }}
    >
      {series.map((d) => (
        <div
          key={d.month}
          style={{
            background: "#f8fafc",
            borderRadius: 8,
            padding: "7px 5px",
            textAlign: "center",
            border: "1px solid #f3f4f6",
          }}
        >
          <div style={{ fontSize: 9.5, color: "#9ca3af", marginBottom: 1 }}>
            {d.month.slice(0, 7)}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              lineHeight: 1.15,
              color: d.rate !== null ? resistColor(d.rate) : "#d1d5db",
            }}
          >
            {d.rate !== null ? `${d.rate}%` : "—"}
          </div>
          <div style={{ fontSize: 9.5, color: "#9ca3af" }}>n={d.n}</div>
          {d.n > 0 && (
            <div
              style={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                marginTop: 3,
              }}
            >
              {[
                ["R", "#ef4444", d.Rn],
                ["I", "#f59e0b", d.In],
                ["S", "#22c55e", d.Sn],
              ].map(([l, c, v]) => (
                <span
                  key={l}
                  style={{
                    fontSize: 8.5,
                    background: c + "22",
                    color: c,
                    borderRadius: 3,
                    padding: "0 3px",
                    fontWeight: 700,
                  }}
                >
                  {l}
                  {v}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// REGRESSION SUMMARY
// ────────────────────────────────────────────────────────────
function RegressionSummary({ reg }) {
  const proj3 = clamp(reg.slope * (reg.n + 2) + reg.intercept);
  return (
    <div
      style={{
        marginTop: 14,
        padding: "10px 14px",
        background: "#f8fafc",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 8,
          color: "#374151",
        }}
      >
        📈 Regression Summary
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))",
          gap: 6,
        }}
      >
        {[
          [
            "Slope",
            `${reg.slope > 0 ? "+" : ""}${reg.slope.toFixed(3)} %/month`,
          ],
          ["Intercept", `${reg.intercept.toFixed(1)}%`],
          ["R² (goodness fit)", reg.r2.toFixed(4)],
          ["Std. Error", `±${reg.se.toFixed(2)}`],
          ["Data points", reg.n],
          ["3-month projection", `${proj3.toFixed(1)}%`],
        ].map(([k, v]) => (
          <div
            key={k}
            style={{
              background: "#fff",
              borderRadius: 6,
              padding: "6px 10px",
              border: "1px solid #f3f4f6",
              fontSize: 12,
            }}
          >
            <div style={{ fontSize: 10, color: "#9ca3af" }}>{k}</div>
            <div style={{ fontWeight: 700, color: "#1f2937" }}>{v}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 11,
          color: "#9ca3af",
          lineHeight: 1.6,
        }}
      >
        OLS linear regression · 95% CI = standard error at each x
        (t-distribution approx) · 3-month projection is illustrative only — not
        a clinical forecast.
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// LEGEND ITEMS
// ────────────────────────────────────────────────────────────
function LegendLine({ color, label }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <svg width="24" height="10">
        <line
          x1="0"
          y1="5"
          x2="24"
          y2="5"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle
          cx="12"
          cy="5"
          r="3"
          fill="#fff"
          stroke={color}
          strokeWidth="2"
        />
      </svg>
      <span style={{ fontSize: 11, color: "#374151" }}>{label}</span>
    </span>
  );
}
function LegendDash({ color, label }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <svg width="24" height="10">
        <line
          x1="0"
          y1="5"
          x2="24"
          y2="5"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="5,3"
        />
      </svg>
      <span style={{ fontSize: 11, color: "#374151" }}>{label}</span>
    </span>
  );
}
function LegendBand({ color, label }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <svg width="24" height="10">
        <rect x="0" y="1" width="24" height="8" fill={color} rx="2" />
      </svg>
      <span style={{ fontSize: 11, color: "#374151" }}>{label}</span>
    </span>
  );
}
