/**
 * promptUtils.ts
 * Sistema de prompts mejorado para GPT-4o en Astro Enea.
 * Integra astrología (Sol/Luna/Ascendente + tránsitos), Eneagrama de Claudio Naranjo
 * y numerología (Camino de Vida + Año Personal + Día Universal).
 */

import { NatalChart, EnneagramType, TonePreferences } from '@/types';
import { NumerologyProfile, NUMEROLOGY_MEANINGS, getNumerologyContext } from '@/utils/numerologyUtils';

// ─── Tipos de contexto planetario ─────────────────────────────────────────

type LunarPhase = 'luna_nueva' | 'luna_creciente' | 'luna_llena' | 'luna_menguante';
type RetrogradeStatus = {
  mercury: boolean;
  venus: boolean;
  mars: boolean;
};

export interface TransitContext {
  lunarPhase?: LunarPhase;
  retrograde?: RetrogradeStatus;
  dominantTransit?: string; // Ej: "Júpiter trígono Sol natal"
}

// ─── Traducciones ──────────────────────────────────────────────────────────

const SIGN_ES: Record<string, string> = {
  Aries: 'Aries', Taurus: 'Tauro', Gemini: 'Géminis', Cancer: 'Cáncer',
  Leo: 'Leo', Virgo: 'Virgo', Libra: 'Libra', Scorpio: 'Escorpio',
  Sagittarius: 'Sagitario', Capricorn: 'Capricornio', Aquarius: 'Acuario', Pisces: 'Piscis',
};

const ENNEAGRAM_PASSION: Record<EnneagramType, string> = {
  1: 'ira transformada en exigencia',
  2: 'orgullo disfrazado de generosidad',
  3: 'vanidad que busca ser vista',
  4: 'envidia del alma que añora completarse',
  5: 'avaricia del ser que teme vaciarse',
  6: 'miedo que busca certeza en la lealtad',
  7: 'gula de experiencias que huye del dolor',
  8: 'lujuria vital que no tolera límites',
  9: 'pereza psíquica que se disuelve en el entorno',
};

const ENNEAGRAM_GIFT: Record<EnneagramType, string> = {
  1: 'discernimiento y rectitud que transforma sistemas',
  2: 'empatía y nutrición que sostiene a los demás',
  3: 'eficiencia y carisma que inspira logro',
  4: 'profundidad emocional y autenticidad radical',
  5: 'análisis penetrante y síntesis del conocimiento',
  6: 'lealtad y coraje ante la incertidumbre',
  7: 'entusiasmo y visión que abre nuevas posibilidades',
  8: 'protección y liderazgo que mueve montañas',
  9: 'presencia mediadora y paz que sostiene al grupo',
};

// ─── Constructor del prompt principal ─────────────────────────────────────

export interface PromptContext {
  firstName: string;
  natalChart: NatalChart;
  enneagramType: EnneagramType;
  numerologyProfile: NumerologyProfile;
  tonePreferences: Partial<TonePreferences>;
  transitContext?: TransitContext;
}

/**
 * Genera el prompt completo para GPT-4o.
 * Devuelve un objeto con systemPrompt y userPrompt.
 */
export function buildQuotePrompt(ctx: PromptContext): { systemPrompt: string; userPrompt: string } {
  const {
    firstName,
    natalChart,
    enneagramType,
    numerologyProfile,
    tonePreferences,
    transitContext,
  } = ctx;

  const sunEs   = SIGN_ES[natalChart.sunSign]   ?? natalChart.sunSign;
  const moonEs  = SIGN_ES[natalChart.moonSign]  ?? natalChart.moonSign;
  const riseEs  = SIGN_ES[natalChart.risingSign] ?? natalChart.risingSign;
  const lpMeaning = NUMEROLOGY_MEANINGS[numerologyProfile.lifePath];
  const numerologyCtx = getNumerologyContext(numerologyProfile);
  const passion = ENNEAGRAM_PASSION[enneagramType];
  const gift    = ENNEAGRAM_GIFT[enneagramType];

  // Bloque de tránsitos si existe
  let transitBlock = '';
  if (transitContext) {
    const lines: string[] = [];
    if (transitContext.lunarPhase) {
      const phaseMap: Record<LunarPhase, string> = {
        luna_nueva: 'Luna Nueva — energía de siembra, nuevos comienzos',
        luna_creciente: 'Luna Creciente — energía de intención y crecimiento',
        luna_llena: 'Luna Llena — energía de culminación y revelación',
        luna_menguante: 'Luna Menguante — energía de soltar y reflexión',
      };
      lines.push(`Fase lunar: ${phaseMap[transitContext.lunarPhase]}`);
    }
    if (transitContext.retrograde) {
      const rx: string[] = [];
      if (transitContext.retrograde.mercury) rx.push('Mercurio Rx (revisión, comunicación interior)');
      if (transitContext.retrograde.venus)   rx.push('Venus Rx (revalorización de relaciones y valores)');
      if (transitContext.retrograde.mars)    rx.push('Marte Rx (redirección de energía y acción)');
      if (rx.length) lines.push(`Retrógrados activos: ${rx.join(', ')}`);
    }
    if (transitContext.dominantTransit) {
      lines.push(`Tránsito principal: ${transitContext.dominantTransit}`);
    }
    if (lines.length) transitBlock = `\nContexto de tránsitos:\n${lines.join('\n')}`;
  }

  // Preferencias de voz
  const style     = tonePreferences.languageStyle   ?? 'Poético';
  const energy    = tonePreferences.energy          ?? 'Reflexivo';
  const focus     = tonePreferences.lifeFocus       ?? 'Crecimiento interior';

  const systemPrompt = `Eres ENEA, una inteligencia simbólica que genera frases de orientación personal en español.

Tu tarea es componer UNA frase única y personalizada para ${firstName}, basada exactamente en su perfil completo.

PERFIL ASTROLÓGICO:
- Sol en ${sunEs} · Luna en ${moonEs} · Ascendente en ${riseEs}
- Planeta dominante: ${natalChart.dominantPlanet}${transitBlock}

PERFIL ENEAGRAMA (Claudio Naranjo):
- Tipo ${enneagramType}: pasión de ${passion}
- Don esencial: ${gift}

PERFIL NUMEROLÓGICO:
- ${numerologyCtx}
- Arquetipo del camino de vida: ${lpMeaning?.title ?? ''} — ${lpMeaning?.phrase ?? ''}

VOZ Y ESTILO:
- Estilo de lenguaje: ${style}
- Energía deseada: ${energy}
- Enfoque de vida: ${focus}

REGLAS ABSOLUTAS:
1. La frase debe tener MÁXIMO 20 palabras. Cuenta las palabras — es obligatorio.
2. Escribe SOLO en español, nunca en otro idioma.
3. La frase debe ser poética, metafórica o filosófica — nunca genérica ni de autoayuda barata.
4. NO menciones signos zodiacales, números ni el tipo de eneagrama directamente.
5. La frase debe poder resonar como si hablara directamente al alma de esta persona.
6. Varía el tono según la fase lunar y el día universal cuando estén presentes.
7. NO incluyas explicaciones, solo la frase entre comillas.`;

  const userPrompt = `Genera la frase del día para ${firstName}. Solo la frase, entre comillas, máximo 20 palabras.`;

  return { systemPrompt, userPrompt };
}

/**
 * Genera un prompt de explicación para acompañar la frase principal.
 * La explicación es más larga (2–3 oraciones) y conecta el contexto simbólico.
 */
export function buildExplanationPrompt(
  ctx: PromptContext,
  mainQuote: string,
): { systemPrompt: string; userPrompt: string } {
  const {
    natalChart,
    enneagramType,
    numerologyProfile,
    tonePreferences,
    transitContext,
  } = ctx;

  const sunEs   = SIGN_ES[natalChart.sunSign]   ?? natalChart.sunSign;
  const moonEs  = SIGN_ES[natalChart.moonSign]  ?? natalChart.moonSign;
  const passion = ENNEAGRAM_PASSION[enneagramType];
  const universalDayStr = `Día Universal ${numerologyProfile.universalDay}`;
  const personalYearStr = `Año Personal ${numerologyProfile.personalYear}`;
  const focus = tonePreferences.lifeFocus ?? 'Crecimiento interior';

  let transitHint = '';
  if (transitContext?.lunarPhase) {
    const phaseHints: Record<LunarPhase, string> = {
      luna_nueva:     'Luna Nueva — momento de sembrar intenciones',
      luna_creciente: 'Luna Creciente — momento de crecer hacia lo deseado',
      luna_llena:     'Luna Llena — momento de ver con claridad',
      luna_menguante: 'Luna Menguante — momento de soltar',
    };
    transitHint = phaseHints[transitContext.lunarPhase];
  }
  if (transitContext?.retrograde?.mercury) {
    transitHint += (transitHint ? ' y ' : '') + 'Mercurio retrógrado invita a revisar antes de avanzar';
  }

  const systemPrompt = `Eres ENEA. Tu tarea es escribir una explicación simbólica de 2 a 3 oraciones en español para una frase de orientación personal.

La explicación debe:
- Conectar la frase con el contexto astrológico (Sol en ${sunEs}, Luna en ${moonEs}) y el eneagrama (pasión: ${passion})
- Mencionar el ${universalDayStr} y el ${personalYearStr} de forma natural, sin tecnicismos
- Hacer referencia a ${focus} como área de vida
${transitHint ? `- Incluir este contexto temporal: ${transitHint}` : ''}
- Usar un tono cálido, poético e íntimo — como una carta de un amigo muy sabio
- Máximo 60 palabras en total

NO expliques qué es el eneagrama ni la numerología. Habla al ser, no al sistema.`;

  const userPrompt = `La frase del día es: "${mainQuote}"\n\nEscribe la explicación simbólica (2–3 oraciones, máximo 60 palabras):`;

  return { systemPrompt, userPrompt };
}

/**
 * Variaciones de prompt según el contexto lunar.
 * Para uso como modificadores adicionales en el prompt principal.
 */
export const LUNAR_PHASE_MODIFIERS: Record<LunarPhase, string> = {
  luna_nueva:
    'Es Luna Nueva. La frase debe sembrar una semilla — una posibilidad que todavía no existe pero que está a punto de comenzar.',
  luna_creciente:
    'Es Luna Creciente. La frase debe orientar hacia el movimiento — hacia lo que se está construyendo con esfuerzo e intención.',
  luna_llena:
    'Es Luna Llena. La frase debe iluminar — revelar algo que ya estaba ahí pero no se había visto del todo.',
  luna_menguante:
    'Es Luna Menguante. La frase debe invitar a soltar — a dejar ir lo que ya cumplió su propósito.',
};

/**
 * Modificador especial para Mercurio Retrógrado.
 */
export const MERCURY_RX_MODIFIER =
  'Mercurio está retrógrado. La frase debe invitar a la revisión interior, a escuchar lo que se dijo sin palabras, a releer los mensajes que dejamos a medias.';
