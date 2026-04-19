/**
 * Astrological calculations using astronomy-engine (pure JS, Expo-compatible).
 * Note: swisseph requires native C bindings and cannot run in Expo managed workflow;
 * astronomy-engine provides equivalent precision (sub-arcminute) in pure JavaScript.
 */
import * as Astronomy from 'astronomy-engine';
import { PlanetPosition, ChartAspect, NatalChart, DominantPlanet } from '@/types';
import { PLANET_PALETTES } from '@/constants/theme';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

const toRad = (d: number) => d * DEG;
const toDeg = (r: number) => r * RAD;
const norm360 = (d: number) => ((d % 360) + 360) % 360;

// ─── Zodiac ───────────────────────────────────────────────────────────────────

export const ZODIAC_SIGNS: { name: string; nameEs: string; symbol: string }[] = [
  { name: 'Aries',       nameEs: 'Aries',       symbol: '♈' },
  { name: 'Taurus',      nameEs: 'Tauro',        symbol: '♉' },
  { name: 'Gemini',      nameEs: 'Géminis',      symbol: '♊' },
  { name: 'Cancer',      nameEs: 'Cáncer',       symbol: '♋' },
  { name: 'Leo',         nameEs: 'Leo',          symbol: '♌' },
  { name: 'Virgo',       nameEs: 'Virgo',        symbol: '♍' },
  { name: 'Libra',       nameEs: 'Libra',        symbol: '♎' },
  { name: 'Scorpio',     nameEs: 'Escorpio',     symbol: '♏' },
  { name: 'Sagittarius', nameEs: 'Sagitario',    symbol: '♐' },
  { name: 'Capricorn',   nameEs: 'Capricornio',  symbol: '♑' },
  { name: 'Aquarius',    nameEs: 'Acuario',      symbol: '♒' },
  { name: 'Pisces',      nameEs: 'Piscis',       symbol: '♓' },
];

export const PLANET_SYMBOLS: Record<string, string> = {
  Sun:        '☉',
  Moon:       '☽',
  Mercury:    '☿',
  Venus:      '♀',
  Mars:       '♂',
  Jupiter:    '♃',
  Saturn:     '♄',
  Uranus:     '⛢',
  Neptune:    '♆',
  Pluto:      '♇',
  NorthNode:  '☊',
};

const PLANET_COLORS: Record<string, string> = {
  Sun:        PLANET_PALETTES.Sun.primary,
  Moon:       PLANET_PALETTES.Moon.primary,
  Mercury:    PLANET_PALETTES.Mercury.primary,
  Venus:      PLANET_PALETTES.Venus.primary,
  Mars:       PLANET_PALETTES.Mars.primary,
  Jupiter:    PLANET_PALETTES.Jupiter.primary,
  Saturn:     PLANET_PALETTES.Saturn.primary,
  Uranus:     PLANET_PALETTES.Uranus.primary,
  Neptune:    PLANET_PALETTES.Neptune.primary,
  Pluto:      PLANET_PALETTES.Pluto.primary,
  NorthNode:  '#A0C4FF',
};

// ─── Sign from ecliptic longitude ─────────────────────────────────────────────

export function signFromLon(lon: number): { sign: string; signEs: string; symbol: string; signIndex: number; degrees: number; minutes: number } {
  const idx = Math.floor(norm360(lon) / 30);
  const z = ZODIAC_SIGNS[idx];
  const raw = norm360(lon) - idx * 30;
  return {
    sign: z.name,
    signEs: z.nameEs,
    symbol: z.symbol,
    signIndex: idx,
    degrees: Math.floor(raw),
    minutes: Math.floor((raw - Math.floor(raw)) * 60),
  };
}

// ─── Geocentric ecliptic longitude (tropical, of date) ────────────────────────

/**
 * Returns the geocentric tropical ecliptic longitude of a body in degrees (0–360).
 * We take the J2000.0 geocentric vector from astronomy-engine, convert to ecliptic
 * using the obliquity of the date (not J2000.0), then add approximate precession
 * to get the tropical (vernal-equinox-of-date) longitude.
 */
function geocentricEclipticLon(body: Astronomy.Body, astroTime: Astronomy.AstroTime): number {
  const vec = Astronomy.GeoVector(body, astroTime, true);

  // Obliquity of ecliptic at the date (Laskar formula, truncated):
  const T = astroTime.tt / 36525;                  // centuries from J2000.0
  const obliq = toRad(23.439291111
    - 0.013004167  * T
    - 1.638889e-7  * T * T
    + 5.036111e-7  * T * T * T);

  // Rotate equatorial J2000 → ecliptic of date
  const x  =  vec.x;
  const y  =  vec.y * Math.cos(obliq) + vec.z * Math.sin(obliq);
  // const z = -vec.y * Math.sin(obliq) + vec.z * Math.cos(obliq); // ecliptic latitude (unused)

  const lon = norm360(toDeg(Math.atan2(y, x)));

  // Apply luni-solar precession in longitude (from J2000.0 to date):
  const precession = norm360(0.01397 * (astroTime.ut / 365.25));  // ≈ 50.29"/year

  return norm360(lon + precession);
}

// ─── Mean North Node (retrograde) ─────────────────────────────────────────────

function meanNorthNodeLon(astroTime: Astronomy.AstroTime): number {
  // Reference: Meeus, Astronomical Algorithms, Ch. 47
  // At J2000.0: Ω ≈ 125.0445479°, mean motion = −0.0529539° per day
  const d = astroTime.tt; // days from J2000.0
  return norm360(125.0445479 - 0.0529539 * d);
}

// ─── Sidereal time and house angles ───────────────────────────────────────────

/**
 * Local Mean Sidereal Time (LMST) in degrees.
 */
function lmst(astroTime: Astronomy.AstroTime, lngDeg: number): number {
  const gast = Astronomy.SiderealTime(astroTime) * 15; // GAST hours → degrees
  return norm360(gast + lngDeg);
}

/**
 * Ascendant ecliptic longitude (degrees).
 * Standard formula: Meeus "Astronomical Algorithms" Ch. 24.
 */
function ascendantLon(ramc: number, obliq: number, lat: number): number {
  const ramcRad = toRad(ramc);
  const eRad    = toRad(obliq);
  const phiRad  = toRad(lat);

  const y = Math.cos(ramcRad);
  const x = -(Math.sin(ramcRad) * Math.cos(eRad) + Math.tan(phiRad) * Math.sin(eRad));
  return norm360(toDeg(Math.atan2(y, x)));
}

/**
 * Midheaven (MC) ecliptic longitude (degrees).
 */
function midheavenLon(ramc: number, obliq: number): number {
  const ramcRad = toRad(ramc);
  const eRad    = toRad(obliq);
  const mc = toDeg(Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(eRad)));
  return norm360(mc);
}

/**
 * Ecliptic longitude from Right Ascension (same quadrant).
 * tan(λ) = tan(RA) / cos(ε)
 */
function lonFromRA(ra: number, obliq: number): number {
  const raRad = toRad(ra);
  const eRad  = toRad(obliq);
  return norm360(toDeg(Math.atan2(Math.sin(raRad), Math.cos(raRad) * Math.cos(eRad))));
}

/**
 * Placidus intermediate house cusp (ecliptic longitude in degrees).
 * fraction: 1/3 for house 11/3, 2/3 for house 12/2.
 * sign: +1 for upper houses (11, 12), -1 for lower houses (2, 3).
 */
function placidusIntermediate(
  ramc: number,
  obliq: number,
  lat: number,
  fraction: number,
  upper: boolean,
): number {
  const e   = obliq;
  const phi = lat;

  // Initial estimate: fraction of 90° from MC
  let lambda = norm360(ramc + (upper ? 1 : -1) * fraction * 90);

  for (let i = 0; i < 50; i++) {
    const lambdaRad = toRad(lambda);
    const delta     = Math.asin(Math.sin(toRad(e)) * Math.sin(lambdaRad));       // declination
    const cosHA     = -Math.tan(toRad(phi)) * Math.tan(delta);

    // Circumpolar guard
    const clampedCosHA = Math.max(-0.9999, Math.min(0.9999, cosHA));
    const semiArc = toDeg(Math.acos(clampedCosHA)); // diurnal semi-arc

    const targetRA = upper
      ? norm360(ramc + fraction * semiArc)
      : norm360(ramc + 180 - fraction * (180 - semiArc));

    const newLambda = lonFromRA(targetRA, e);
    if (Math.abs(norm360(newLambda - lambda + 180) - 180) < 0.0001) {
      return norm360(newLambda);
    }
    lambda = newLambda;
  }
  return norm360(lambda);
}

/**
 * Compute all 12 Placidus house cusps.
 * Returns array of 12 ecliptic longitudes [H1, H2, ..., H12].
 */
function placidusHouses(ramc: number, obliq: number, lat: number, asc: number, mc: number): number[] {
  const h11 = placidusIntermediate(ramc, obliq, lat, 1/3, true);
  const h12 = placidusIntermediate(ramc, obliq, lat, 2/3, true);
  const h2  = placidusIntermediate(ramc, obliq, lat, 2/3, false);
  const h3  = placidusIntermediate(ramc, obliq, lat, 1/3, false);

  return [
    asc,                    // H1
    h2,                     // H2
    h3,                     // H3
    norm360(mc + 180),      // H4 (IC)
    norm360(h11 + 180),     // H5
    norm360(h12 + 180),     // H6
    norm360(asc + 180),     // H7 (DSC)
    norm360(h2 + 180),      // H8
    norm360(h3 + 180),      // H9
    mc,                     // H10 (MC)
    h11,                    // H11
    h12,                    // H12
  ];
}

// ─── Aspect calculation ────────────────────────────────────────────────────────

const ASPECT_DEFS: { type: ChartAspect['type']; angle: number; orb: number; color: string }[] = [
  { type: 'conjunction',  angle:   0, orb: 8, color: '#F4C542' },
  { type: 'sextile',      angle:  60, orb: 5, color: '#6EE7B7' },
  { type: 'square',       angle:  90, orb: 7, color: '#FC8181' },
  { type: 'trine',        angle: 120, orb: 7, color: '#93C5FD' },
  { type: 'opposition',   angle: 180, orb: 8, color: '#FDA4AF' },
];

function angularDistance(a: number, b: number): number {
  const d = Math.abs(norm360(a - b));
  return d > 180 ? 360 - d : d;
}

function calculateAspects(planets: PlanetPosition[]): ChartAspect[] {
  const aspects: ChartAspect[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const sep = angularDistance(planets[i].eclipticLon, planets[j].eclipticLon);
      for (const def of ASPECT_DEFS) {
        const orb = Math.abs(sep - def.angle);
        if (orb <= def.orb) {
          aspects.push({
            planet1: planets[i].name,
            planet2: planets[j].name,
            type: def.type,
            orb,
            color: def.color,
          });
          break;
        }
      }
    }
  }
  return aspects;
}

// ─── Dominant planet heuristic ────────────────────────────────────────────────

const PLANET_DIGNITIES: Record<string, number> = {
  Sun: 0, Moon: 0, Mercury: 0, Venus: 0, Mars: 0,
  Jupiter: 0, Saturn: 0, Uranus: 0, Neptune: 0, Pluto: 0,
};

function calcDominantPlanet(planets: PlanetPosition[], asc: number, mc: number): DominantPlanet {
  // Simple heuristic: planet closest to ASC, MC, or a major angle wins
  const angles = [asc, norm360(asc + 180), mc, norm360(mc + 180)];
  let best = 'Sun';
  let bestDist = 360;

  for (const p of planets) {
    if (p.name === 'NorthNode') continue;
    for (const angle of angles) {
      const d = angularDistance(p.eclipticLon, angle);
      if (d < bestDist) {
        bestDist = d;
        best = p.name;
      }
    }
  }
  return best as DominantPlanet;
}

// ─── Main export: geocode via Nominatim ───────────────────────────────────────

export async function geocodeLocation(locationName: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const encoded = encodeURIComponent(locationName);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AstroEnea-App/1.0' },
    });
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Main export: calculateFullNatalChart ─────────────────────────────────────

export function calculateFullNatalChart(
  dateStr: string,   // YYYY-MM-DD
  timeStr: string,   // HH:MM (local birth time)
  lat: number,
  lng: number,
): NatalChart {
  // Parse date / time
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, min]        = timeStr.split(':').map(Number);

  // Convert local birth time to UTC using longitude-based LMT offset
  // (Local Mean Time: each 15° of longitude = 1 hour)
  const lmtOffsetHours = lng / 15;
  const utcHour        = hour - lmtOffsetHours;

  const utcDate = new Date(Date.UTC(year, month - 1, day,
    Math.floor(utcHour),
    Math.round((utcHour - Math.floor(utcHour)) * 60) + min));

  const astroTime = Astronomy.MakeTime(utcDate);

  // Obliquity at date (degrees)
  const T      = astroTime.tt / 36525;
  const obliq  = 23.439291111
    - 0.013004167 * T
    - 1.638889e-7 * T * T
    + 5.036111e-7 * T * T * T;

  // RAMC (Right Ascension of Midheaven Cusp = Local Apparent Sidereal Time)
  const ramc = lmst(astroTime, lng);

  // Angles
  const ascLon = ascendantLon(ramc, obliq, lat);
  const mcLon  = midheavenLon(ramc, obliq);

  // House cusps (Placidus)
  const houseCusps = placidusHouses(ramc, obliq, lat, ascLon, mcLon);

  // Planetary positions
  const bodyList: [string, Astronomy.Body][] = [
    ['Sun',     Astronomy.Body.Sun],
    ['Moon',    Astronomy.Body.Moon],
    ['Mercury', Astronomy.Body.Mercury],
    ['Venus',   Astronomy.Body.Venus],
    ['Mars',    Astronomy.Body.Mars],
    ['Jupiter', Astronomy.Body.Jupiter],
    ['Saturn',  Astronomy.Body.Saturn],
    ['Uranus',  Astronomy.Body.Uranus],
    ['Neptune', Astronomy.Body.Neptune],
    ['Pluto',   Astronomy.Body.Pluto],
  ];

  const planets: PlanetPosition[] = bodyList.map(([name, body]) => {
    const lon = geocentricEclipticLon(body, astroTime);
    const s   = signFromLon(lon);
    return {
      name,
      symbol:        PLANET_SYMBOLS[name] ?? '●',
      eclipticLon:   lon,
      sign:          s.sign,
      signSymbol:    s.symbol,
      signIndex:     s.signIndex,
      degreesInSign: s.degrees,
      minutesInSign: s.minutes,
      color:         PLANET_COLORS[name] ?? '#FFFFFF',
    };
  });

  // North Node
  const nnLon = meanNorthNodeLon(astroTime);
  const nnSign = signFromLon(nnLon);
  planets.push({
    name:          'NorthNode',
    symbol:        PLANET_SYMBOLS.NorthNode,
    eclipticLon:   nnLon,
    sign:          nnSign.sign,
    signSymbol:    nnSign.symbol,
    signIndex:     nnSign.signIndex,
    degreesInSign: nnSign.degrees,
    minutesInSign: nnSign.minutes,
    color:         PLANET_COLORS.NorthNode,
  });

  const chartAspects = calculateAspects(planets.filter(p => p.name !== 'NorthNode'));
  const dominant     = calcDominantPlanet(planets, ascLon, mcLon);

  const sun   = planets.find(p => p.name === 'Sun')!;
  const moon  = planets.find(p => p.name === 'Moon')!;
  const ascS  = signFromLon(ascLon);

  return {
    sunSign:       sun.sign,
    moonSign:      moon.sign,
    risingSign:    ascS.sign,
    dominantPlanet: dominant,
    aspects:       chartAspects.map(a => `${a.planet1}-${a.type}-${a.planet2}`),
    rawData:       {},
    planets,
    chartAspects,
    ascendantLon:  ascLon,
    mcLon,
    houseCusps,
  };
}

// ─── Legacy sun-sign helper (kept for compatibility) ──────────────────────────

const SIGNS_LEGACY: { name: string; symbol: string; from: [number, number]; to: [number, number] }[] = [
  { name: 'Capricorn',   symbol: '♑', from: [12, 22], to: [1, 19] },
  { name: 'Aquarius',    symbol: '♒', from: [1, 20],  to: [2, 18] },
  { name: 'Pisces',      symbol: '♓', from: [2, 19],  to: [3, 20] },
  { name: 'Aries',       symbol: '♈', from: [3, 21],  to: [4, 19] },
  { name: 'Taurus',      symbol: '♉', from: [4, 20],  to: [5, 20] },
  { name: 'Gemini',      symbol: '♊', from: [5, 21],  to: [6, 20] },
  { name: 'Cancer',      symbol: '♋', from: [6, 21],  to: [7, 22] },
  { name: 'Leo',         symbol: '♌', from: [7, 23],  to: [8, 22] },
  { name: 'Virgo',       symbol: '♍', from: [8, 23],  to: [9, 22] },
  { name: 'Libra',       symbol: '♎', from: [9, 23],  to: [10, 22] },
  { name: 'Scorpio',     symbol: '♏', from: [10, 23], to: [11, 21] },
  { name: 'Sagittarius', symbol: '♐', from: [11, 22], to: [12, 21] },
];

export function getSunSign(dateStr: string): { name: string; symbol: string } | null {
  if (!dateStr || dateStr.length < 10) return null;
  const parts = dateStr.split('-');
  if (parts.length < 3) return null;
  const month = parseInt(parts[1], 10);
  const day   = parseInt(parts[2], 10);
  if (!month || !day) return null;

  for (const sign of SIGNS_LEGACY) {
    const [fm, fd] = sign.from;
    const [tm, td] = sign.to;
    if (fm > tm) {
      if ((month === fm && day >= fd) || (month === tm && day <= td)) return sign;
    } else {
      if ((month === fm && day >= fd) || (month === tm && day <= td) ||
          (month > fm && month < tm)) return sign;
    }
  }
  return null;
}

// Spanish sign name lookup
export function signNameEs(englishName: string): string {
  return ZODIAC_SIGNS.find(z => z.name === englishName)?.nameEs ?? englishName;
}
