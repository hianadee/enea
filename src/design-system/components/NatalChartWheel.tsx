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
} from 'react-native-svg';
import { BirthData, NatalChart, PlanetPosition } from '@/types';
import { ZODIAC_SIGNS } from '@/utils/astroUtils';

// ─── Geometry helpers ─────────────────────────────────────────────────────────

/**
 * Convert an ecliptic longitude to an SVG angle (degrees, 0=top, clockwise).
 * The Ascendant is placed at the 9-o'clock (left/180°) position per convention.
 * The ecliptic increases counter-clockwise, so we negate after rotation.
 */
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

// ─── Element colors ───────────────────────────────────────────────────────────

const ELEMENT_OF: Record<string, string> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};
const ELEMENT_FILL:   Record<string, string> = { fire: '#FF6B4414', earth: '#4CAF5014', air: '#87CEEB12', water: '#7B68EE14' };
const ELEMENT_STROKE: Record<string, string> = { fire: '#FF6B4430', earth: '#4CAF5030', air: '#87CEEB28', water: '#7B68EE30' };

// ─── Aspect line colors (semi-transparent) ────────────────────────────────────

const ASPECT_LINE_COLOR: Record<string, string> = {
  conjunction: '#F4C54240',
  sextile:     '#6EE7B740',
  square:      '#FC818140',
  trine:       '#93C5FD40',
  opposition:  '#FDA4AF40',
};

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

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  birthData:  Partial<BirthData>;
  natalChart: NatalChart | null | undefined;
  size?:      number;
}

export const NatalChartWheel: React.FC<Props> = ({ natalChart, size = 300 }) => {
  const cx = size / 2;
  const cy = size / 2;

  const outerR     = size * 0.490;
  const signInnerR = size * 0.372;
  const houseR     = size * 0.310;
  const planetR    = size * 0.250;
  const hubR       = size * 0.068;

  const ascLon = natalChart?.ascendantLon ?? 0;
  const mcLon  = natalChart?.mcLon        ?? 270;
  const e2s    = (lon: number) => eclipticToSvgAngle(lon, ascLon);

  // Build angle map for aspect lines
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
          <Stop offset="0%"   stopColor="#1C1C26" stopOpacity={1} />
          <Stop offset="100%" stopColor="#0A0A0F" stopOpacity={1} />
        </RadialGradient>
        <RadialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#2A2A3A" stopOpacity={1} />
          <Stop offset="100%" stopColor="#13131A" stopOpacity={1} />
        </RadialGradient>
      </Defs>

      {/* Background */}
      <Circle cx={cx} cy={cy} r={outerR} fill="url(#bgGrad)" stroke="#2A2A3A" strokeWidth={0.5} />

      {/* Zodiac ring segments */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const startDeg = e2s(i * 30);
        const endDeg   = e2s((i + 1) * 30);
        const el = ELEMENT_OF[sign.name] ?? 'air';
        return (
          <Path
            key={`seg-${i}`}
            d={arcPath(cx, cy, signInnerR, outerR, startDeg, endDeg)}
            fill={ELEMENT_FILL[el]}
            stroke={ELEMENT_STROKE[el]}
            strokeWidth={0.6}
          />
        );
      })}

      {/* Ring borders */}
      <Circle cx={cx} cy={cy} r={outerR}     fill="none" stroke="#2A2A3A" strokeWidth={0.7} />
      <Circle cx={cx} cy={cy} r={signInnerR} fill="none" stroke="#2A2A3A" strokeWidth={0.5} />
      <Circle cx={cx} cy={cy} r={houseR}     fill="none" stroke="#1E1E2E" strokeWidth={0.4} />

      {/* Placidus house cusp lines */}
      {(natalChart?.houseCusps ?? Array.from({ length: 12 }, (_, i) => i * 30)).map((cusp, i) => {
        const angle = e2s(cusp);
        const inner = polar(cx, cy, 0, angle);
        const outer = polar(cx, cy, signInnerR, angle);
        const isAngular = i === 0 || i === 3 || i === 6 || i === 9;
        return (
          <Line
            key={`hcusp-${i}`}
            x1={f(inner.x)} y1={f(inner.y)}
            x2={f(outer.x)} y2={f(outer.y)}
            stroke={isAngular ? '#3A3A52' : '#232330'}
            strokeWidth={isAngular ? 0.9 : 0.4}
          />
        );
      })}

      {/* House numbers */}
      {(natalChart?.houseCusps ?? []).map((cusp, i) => {
        const cusps = natalChart!.houseCusps!;
        const nextCusp = cusps[(i + 1) % 12];
        let mid = cusp + (nextCusp >= cusp ? (nextCusp - cusp) / 2 : (nextCusp + 360 - cusp) / 2);
        mid = ((mid % 360) + 360) % 360;
        const pos = polar(cx, cy, (houseR + signInnerR) / 2 - size * 0.018, e2s(mid));
        return (
          <SvgText key={`hnum-${i}`}
            x={f(pos.x)} y={f(pos.y)}
            textAnchor="middle" alignmentBaseline="central"
            fontSize={size * 0.028} fill="#3A3A58">
            {i + 1}
          </SvgText>
        );
      })}

      {/* Zodiac sign symbols */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const pos = polar(cx, cy, (signInnerR + outerR) / 2, e2s(i * 30 + 15));
        return (
          <SvgText key={`zsym-${i}`}
            x={f(pos.x)} y={f(pos.y)}
            textAnchor="middle" alignmentBaseline="central"
            fontSize={size * 0.048} fill="#4A4A6A">
            {sign.symbol}
          </SvgText>
        );
      })}

      {/* Aspect lines */}
      {natalChart?.chartAspects?.map((asp, i) => {
        const a1 = planetAngles[asp.planet1];
        const a2 = planetAngles[asp.planet2];
        if (a1 === undefined || a2 === undefined) return null;
        const p1 = polar(cx, cy, planetR * 0.88, a1);
        const p2 = polar(cx, cy, planetR * 0.88, a2);
        return (
          <Line key={`asp-${i}`}
            x1={f(p1.x)} y1={f(p1.y)} x2={f(p2.x)} y2={f(p2.y)}
            stroke={ASPECT_LINE_COLOR[asp.type] ?? '#FFFFFF10'}
            strokeWidth={0.6}
          />
        );
      })}

      {/* ASC/DSC axis */}
      {natalChart && (() => {
        const ascAngle = e2s(ascLon);
        const dscAngle = e2s(ascLon + 180);
        const aP = polar(cx, cy, signInnerR + size * 0.020, ascAngle);
        const dP = polar(cx, cy, signInnerR + size * 0.020, dscAngle);
        return (
          <G>
            <Line x1={f(aP.x)} y1={f(aP.y)} x2={f(dP.x)} y2={f(dP.y)}
              stroke="#5A5A7A" strokeWidth={0.8} strokeDasharray="2,3" />
            <SvgText x={f(aP.x)} y={f(aP.y)} dy={-6}
              textAnchor="middle" fontSize={size * 0.026} fill="#7070A0">AC</SvgText>
          </G>
        );
      })()}

      {/* MC/IC axis */}
      {natalChart && (() => {
        const mcAngle = e2s(mcLon);
        const icAngle = e2s(mcLon + 180);
        const mP = polar(cx, cy, signInnerR + size * 0.020, mcAngle);
        const iP = polar(cx, cy, signInnerR + size * 0.020, icAngle);
        return (
          <G>
            <Line x1={f(mP.x)} y1={f(mP.y)} x2={f(iP.x)} y2={f(iP.y)}
              stroke="#5A5A7A" strokeWidth={0.8} strokeDasharray="2,3" />
            <SvgText x={f(mP.x)} y={f(mP.y)} dy={-6}
              textAnchor="middle" fontSize={size * 0.026} fill="#7070A0">MC</SvgText>
          </G>
        );
      })()}

      {/* Planet markers */}
      {planetData.map(({ p, svgAngle, r }) => {
        const pos  = polar(cx, cy, r, svgAngle);
        const line = polar(cx, cy, signInnerR - 2, svgAngle);
        return (
          <G key={`pl-${p.name}`}>
            <Line x1={f(line.x)} y1={f(line.y)} x2={f(pos.x)} y2={f(pos.y)}
              stroke={p.color} strokeWidth={0.5} strokeOpacity={0.30} />
            <Circle cx={f(pos.x)} cy={f(pos.y)} r={size * 0.044}
              fill={p.color} fillOpacity={0.10} />
            <Circle cx={f(pos.x)} cy={f(pos.y)} r={size * 0.018}
              fill={p.color} fillOpacity={0.9} />
            <SvgText x={f(pos.x)} y={f(pos.y + size * 0.003)}
              textAnchor="middle" alignmentBaseline="central"
              fontSize={size * 0.036} fill={p.color} fillOpacity={0.95}>
              {p.symbol}
            </SvgText>
            <SvgText x={f(pos.x)} y={f(pos.y + size * 0.055)}
              textAnchor="middle" alignmentBaseline="central"
              fontSize={size * 0.020} fill={p.color} fillOpacity={0.50}>
              {p.degreesInSign}°
            </SvgText>
          </G>
        );
      })}

      {/* Cardinal tick marks */}
      {[0, 90, 180, 270].map((svgAngle, i) => {
        const inner = polar(cx, cy, outerR - 1, svgAngle);
        const outer = polar(cx, cy, outerR + size * 0.015, svgAngle);
        return (
          <Line key={`card-${i}`}
            x1={f(inner.x)} y1={f(inner.y)} x2={f(outer.x)} y2={f(outer.y)}
            stroke="#3A3A54" strokeWidth={1} />
        );
      })}

      {/* Center hub */}
      <Circle cx={cx} cy={cy} r={hubR + 3} fill="none" stroke="#2A2A3A" strokeWidth={0.5} />
      <Circle cx={cx} cy={cy} r={hubR} fill="url(#hubGrad)" />
      <SvgText x={f(cx)} y={f(cy + 1)} textAnchor="middle" alignmentBaseline="central"
        fontSize={size * 0.056} fill="#3A3A5A">◎</SvgText>
    </Svg>
  );
};
