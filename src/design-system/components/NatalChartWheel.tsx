import React from 'react';
import Svg, {
  Circle,
  Line,
  Path,
  Text as SvgText,
  G,
  Defs,
  RadialGradient,
  Stop,
  Polygon,
} from 'react-native-svg';
import { BirthData, NatalChart, PlanetPosition } from '@/types';
import { ZODIAC_SIGNS } from '@/utils/astroUtils';

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function eclipticToSvgAngle(eclipticLon: number, ascLon: number): number {
  const rotated = eclipticLon - ascLon + 180;
  return ((-(rotated) % 360) + 360) % 360;
}

/** Polar → Cartesian. angleDeg: 0 = top, clockwise. */
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

const f = (n: number) => n.toFixed(3);

function arcPath(
  cx: number, cy: number,
  innerR: number, outerR: number,
  startDeg: number, endDeg: number,
): string {
  const i1 = polar(cx, cy, innerR, startDeg);
  const i2 = polar(cx, cy, innerR, endDeg);
  const o1 = polar(cx, cy, outerR, startDeg);
  const o2 = polar(cx, cy, outerR, endDeg);
  const large = ((endDeg - startDeg + 360) % 360) > 180 ? 1 : 0;
  return [
    `M ${f(i1.x)} ${f(i1.y)}`,
    `L ${f(o1.x)} ${f(o1.y)}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${f(o2.x)} ${f(o2.y)}`,
    `L ${f(i2.x)} ${f(i2.y)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${f(i1.x)} ${f(i1.y)}`,
    'Z',
  ].join(' ');
}

/** Degrees + minutes within sign from raw ecliptic longitude */
function degMin(eclipticLon: number): { deg: number; min: number } {
  const norm = ((eclipticLon % 360) + 360) % 360;
  const raw  = norm % 30;
  return {
    deg: Math.floor(raw),
    min: Math.floor((raw - Math.floor(raw)) * 60),
  };
}

// ─── Traditional zodiac sign colors ──────────────────────────────────────────

const SIGN_COLORS: Record<string, string> = {
  Aries:       '#E05050',
  Taurus:      '#9E8060',
  Gemini:      '#D4A820',
  Cancer:      '#6BAED1',
  Leo:         '#E88C3A',
  Virgo:       '#72A870',
  Libra:       '#E090A8',
  Scorpio:     '#B03848',
  Sagittarius: '#D85A3A',
  Capricorn:   '#9090A0',
  Aquarius:    '#4EC4CF',
  Pisces:      '#8878CC',
};

// ─── Aspect line colors ───────────────────────────────────────────────────────

const ASPECT_LINE_COLOR: Record<string, string> = {
  conjunction: '#F4C54268',
  sextile:     '#6EE7B768',
  square:      '#FC818168',
  trine:       '#93C5FD68',
  opposition:  '#FDA4AF68',
};

// ─── Roman house numerals ─────────────────────────────────────────────────────

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

// ─── Planet spread (avoid overlap) ───────────────────────────────────────────

function spreadPlanets(
  planets: PlanetPosition[],
  ascLon: number,
  baseR: number,
  stepR: number,
): { p: PlanetPosition; svgAngle: number; r: number }[] {
  const sorted = [...planets].sort((a, b) => a.eclipticLon - b.eclipticLon);
  const result: { p: PlanetPosition; svgAngle: number; r: number }[] = [];
  for (const p of sorted) {
    const svgAngle = eclipticToSvgAngle(p.eclipticLon, ascLon);
    const close = result.filter(r => {
      const diff = Math.abs(r.svgAngle - svgAngle);
      return Math.min(diff, 360 - diff) < 14;
    }).length;
    result.push({ p, svgAngle, r: baseR - close * stepR });
  }
  return result;
}

// ─── Arrow helper ─────────────────────────────────────────────────────────────

/** Returns polygon points for a small arrowhead at the tip of a radial line. */
function arrowPoints(
  cx: number, cy: number,
  r: number, angleDeg: number,
  size: number,
): string {
  const tip  = polar(cx, cy, r, angleDeg);
  const left = polar(cx, cy, r - size, angleDeg - 4);
  const right= polar(cx, cy, r - size, angleDeg + 4);
  return `${f(tip.x)},${f(tip.y)} ${f(left.x)},${f(left.y)} ${f(right.x)},${f(right.y)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  birthData?:  Partial<BirthData>;
  natalChart: NatalChart | null | undefined;
  size?:      number;
}

export const NatalChartWheel: React.FC<Props> = ({ natalChart, size = 300 }) => {
  const cx = size / 2;
  const cy = size / 2;

  const outerR     = size * 0.490;
  const signInnerR = size * 0.380;
  const houseR     = size * 0.315;
  const planetR    = size * 0.255;
  const hubR       = size * 0.068;
  const labelR     = outerR + size * 0.038; // outside the ring, for ASC/MC labels

  const ascLon = natalChart?.ascendantLon ?? 0;
  const mcLon  = natalChart?.mcLon        ?? 270;
  const e2s    = (lon: number) => eclipticToSvgAngle(lon, ascLon);

  // ASC / MC degree strings
  const ascDM = degMin(ascLon);
  const mcDM  = degMin(mcLon);
  const ascLabel = `${ascDM.deg}°${String(ascDM.min).padStart(2,'0')}'`;
  const mcLabel  = `MC ${mcDM.deg}°${String(mcDM.min).padStart(2,'0')}'`;

  const ascSvgAngle = e2s(ascLon);   // always 180 in this coord system
  const mcSvgAngle  = e2s(mcLon);

  // Aspect angle map
  const planetAngles: Record<string, number> = {};
  if (natalChart?.planets) {
    for (const p of natalChart.planets) {
      planetAngles[p.name] = e2s(p.eclipticLon);
    }
  }

  const planetData = natalChart?.planets
    ? spreadPlanets(natalChart.planets, ascLon, planetR, size * 0.048)
    : [];

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#161620" stopOpacity={1} />
          <Stop offset="100%" stopColor="#080810" stopOpacity={1} />
        </RadialGradient>
        <RadialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#242430" stopOpacity={1} />
          <Stop offset="100%" stopColor="#0E0E18" stopOpacity={1} />
        </RadialGradient>
      </Defs>

      {/* Background */}
      <Circle cx={cx} cy={cy} r={outerR} fill="url(#bgGrad)" />

      {/* Zodiac ring — no fill, only hairline separator between segments */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const startDeg = e2s(i * 30);
        const endDeg   = e2s((i + 1) * 30);
        return (
          <Path
            key={`seg-${i}`}
            d={arcPath(cx, cy, signInnerR, outerR, startDeg, endDeg)}
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity={0.08}
            strokeWidth={0.4}
          />
        );
      })}

      {/* Ring borders */}
      <Circle cx={cx} cy={cy} r={outerR}     fill="none" stroke="#FFFFFF" strokeOpacity={0.15} strokeWidth={0.8} />
      <Circle cx={cx} cy={cy} r={signInnerR} fill="none" stroke="#FFFFFF" strokeOpacity={0.12} strokeWidth={0.5} />
      <Circle cx={cx} cy={cy} r={houseR}     fill="none" stroke="#FFFFFF" strokeOpacity={0.08} strokeWidth={0.4} />

      {/* House cusp lines — from center to sign ring */}
      {(natalChart?.houseCusps ?? Array.from({ length: 12 }, (_, i) => i * 30)).map((cusp, i) => {
        const angle   = e2s(cusp);
        const inner   = polar(cx, cy, hubR + 2, angle);
        const outer   = polar(cx, cy, signInnerR, angle);
        const isAngle = i === 0 || i === 3 || i === 6 || i === 9;
        return (
          <Line
            key={`hcusp-${i}`}
            x1={f(inner.x)} y1={f(inner.y)}
            x2={f(outer.x)} y2={f(outer.y)}
            stroke="#FFFFFF"
            strokeOpacity={isAngle ? 0.30 : 0.12}
            strokeWidth={isAngle ? 0.8 : 0.4}
          />
        );
      })}

      {/* House numbers — Roman numerals */}
      {(natalChart?.houseCusps ?? []).map((cusp, i) => {
        const cusps   = natalChart!.houseCusps!;
        const next    = cusps[(i + 1) % 12];
        let mid = cusp + (next >= cusp ? (next - cusp) / 2 : (next + 360 - cusp) / 2);
        mid = ((mid % 360) + 360) % 360;
        const pos = polar(cx, cy, (houseR + signInnerR) / 2 - size * 0.012, e2s(mid));
        return (
          <SvgText key={`hnum-${i}`}
            x={f(pos.x)} y={f(pos.y)}
            textAnchor="middle" alignmentBaseline="central"
            fontSize={size * 0.026} fill="#FFFFFF" fillOpacity={0.35}>
            {ROMAN[i]}
          </SvgText>
        );
      })}

      {/* Zodiac sign symbols — traditional colors.
          ︎ forces text-presentation (no emoji badge) so fill color is visible. */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const pos   = polar(cx, cy, (signInnerR + outerR) / 2, e2s(i * 30 + 15));
        const color = SIGN_COLORS[sign.name] ?? '#FFFFFF';
        return (
          <SvgText key={`zsym-${i}`}
            x={f(pos.x)} y={f(pos.y)}
            textAnchor="middle" alignmentBaseline="central"
            fontFamily="Georgia"
            fontSize={size * 0.082} fill={color} fillOpacity={0.95}>
            {sign.symbol + '︎'}
          </SvgText>
        );
      })}

      {/* Aspect lines */}
      {natalChart?.chartAspects?.map((asp, i) => {
        const a1 = planetAngles[asp.planet1];
        const a2 = planetAngles[asp.planet2];
        if (a1 === undefined || a2 === undefined) return null;
        const p1 = polar(cx, cy, planetR * 0.86, a1);
        const p2 = polar(cx, cy, planetR * 0.86, a2);
        return (
          <Line key={`asp-${i}`}
            x1={f(p1.x)} y1={f(p1.y)} x2={f(p2.x)} y2={f(p2.y)}
            stroke={ASPECT_LINE_COLOR[asp.type] ?? '#FFFFFF18'}
            strokeWidth={0.8}
          />
        );
      })}

      {/* ASC axis — arrow + label */}
      {natalChart && (() => {
        const dscAngle = e2s(ascLon + 180);
        const ascTip   = polar(cx, cy, outerR + size * 0.022, ascSvgAngle);
        const ascLine1 = polar(cx, cy, signInnerR, ascSvgAngle);
        const ascLine2 = polar(cx, cy, outerR,     ascSvgAngle);
        const dscLine1 = polar(cx, cy, signInnerR, dscAngle);
        const dscLine2 = polar(cx, cy, outerR,     dscAngle);
        const lblPos   = polar(cx, cy, labelR + size * 0.018, ascSvgAngle);
        return (
          <G>
            {/* DSC side — no label, no arrow */}
            <Line x1={f(dscLine1.x)} y1={f(dscLine1.y)} x2={f(dscLine2.x)} y2={f(dscLine2.y)}
              stroke="#FFFFFF" strokeOpacity={0.40} strokeWidth={0.8} />
            {/* ASC side — line + arrow + label */}
            <Line x1={f(ascLine1.x)} y1={f(ascLine1.y)} x2={f(ascLine2.x)} y2={f(ascLine2.y)}
              stroke="#FFFFFF" strokeOpacity={0.50} strokeWidth={0.8} />
            <Polygon
              points={arrowPoints(cx, cy, outerR + size * 0.018, ascSvgAngle, size * 0.022)}
              fill="#FFFFFF" fillOpacity={0.70} />
            <SvgText x={f(lblPos.x)} y={f(lblPos.y)}
              textAnchor="middle" alignmentBaseline="central"
              fontSize={size * 0.028} fill="#FFFFFF" fillOpacity={0.70}>
              {ascLabel}
            </SvgText>
          </G>
        );
      })()}

      {/* MC axis — arrow + label */}
      {natalChart && (() => {
        const icAngle  = e2s(mcLon + 180);
        const mcLine1  = polar(cx, cy, signInnerR, mcSvgAngle);
        const mcLine2  = polar(cx, cy, outerR,     mcSvgAngle);
        const icLine1  = polar(cx, cy, signInnerR, icAngle);
        const icLine2  = polar(cx, cy, outerR,     icAngle);
        const lblPos   = polar(cx, cy, labelR + size * 0.022, mcSvgAngle);
        return (
          <G>
            {/* IC side */}
            <Line x1={f(icLine1.x)} y1={f(icLine1.y)} x2={f(icLine2.x)} y2={f(icLine2.y)}
              stroke="#FFFFFF" strokeOpacity={0.40} strokeWidth={0.8} />
            {/* MC side — arrow + label */}
            <Line x1={f(mcLine1.x)} y1={f(mcLine1.y)} x2={f(mcLine2.x)} y2={f(mcLine2.y)}
              stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={0.9} />
            <Polygon
              points={arrowPoints(cx, cy, outerR + size * 0.018, mcSvgAngle, size * 0.022)}
              fill="#FFFFFF" fillOpacity={0.75} />
            <SvgText x={f(lblPos.x)} y={f(lblPos.y)}
              textAnchor="middle" alignmentBaseline="central"
              fontSize={size * 0.028} fill="#FFFFFF" fillOpacity={0.75}>
              {mcLabel}
            </SvgText>
          </G>
        );
      })()}

      {/* Planet markers */}
      {planetData.map(({ p, svgAngle, r }) => {
        const pos  = polar(cx, cy, r, svgAngle);
        // Small tick line from sign ring inward to planet position
        const tick = polar(cx, cy, signInnerR - size * 0.008, svgAngle);
        return (
          <G key={`pl-${p.name}`}>
            {/* Tick line */}
            <Line x1={f(tick.x)} y1={f(tick.y)} x2={f(pos.x)} y2={f(pos.y)}
              stroke={p.color} strokeWidth={0.4} strokeOpacity={0.25} />
            {/* Planet symbol */}
            <SvgText x={f(pos.x)} y={f(pos.y)}
              textAnchor="middle" alignmentBaseline="central"
              fontSize={size * 0.040} fill={p.color} fillOpacity={0.95}>
              {p.symbol}
            </SvgText>
            {/* Degree label */}
            <SvgText x={f(pos.x)} y={f(pos.y + size * 0.048)}
              textAnchor="middle" alignmentBaseline="central"
              fontSize={size * 0.021} fill={p.color} fillOpacity={0.60}>
              {p.degreesInSign}°
            </SvgText>
          </G>
        );
      })}

      {/* Center hub */}
      <Circle cx={cx} cy={cy} r={hubR + 2} fill="none" stroke="#FFFFFF" strokeOpacity={0.10} strokeWidth={0.5} />
      <Circle cx={cx} cy={cy} r={hubR} fill="url(#hubGrad)" />
      <SvgText x={f(cx)} y={f(cy + 1)} textAnchor="middle" alignmentBaseline="central"
        fontSize={size * 0.048} fill="#FFFFFF" fillOpacity={0.20}>◎</SvgText>
    </Svg>
  );
};
