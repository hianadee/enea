/**
 * numerologyUtils.ts
 * Cálculos numerológicos integrados para ENEA.
 * Basado en numerología pitagórica occidental (reducción a 1–9, con maestros 11, 22, 33).
 */

export interface NumerologyProfile {
  lifePath: number;      // 1–9 (o 11, 22, 33 — maestros)
  dayNumber: number;     // 1–9
  personalYear: number;  // 1–9
  universalDay: number;  // 1–9 — varía cada día
}

// ─── Constantes de significado ─────────────────────────────────────────────

export interface NumerologyMeaning {
  title: string;
  titleShort: string;
  phrase: string;         // Frase poética para mostrar en pantalla
  description: string;   // Explicación profunda del número
  shadow: string;        // Aspecto sombra / desafío
  keywords: string[];
  color: string;
}

export const NUMEROLOGY_MEANINGS: Record<number, NumerologyMeaning> = {
  1: {
    title: 'El Iniciador',
    titleShort: 'Iniciador',
    phrase: 'Eres el comienzo de algo que el mundo todavía no conoce.',
    description:
      'El 1 vibra con la energía del origen. Tu camino de vida te llama a liderar, crear y actuar desde la soberanía individual. Naciste para abrir puertas, no para esperar que otros lo hagan.',
    shadow:
      'El mayor desafío del 1 es la soledad que genera su independencia y la tendencia a la arrogancia cuando el miedo se disfraza de fuerza.',
    keywords: ['liderazgo', 'independencia', 'creación', 'pionero', 'voluntad'],
    color: '#F4C542',
  },
  2: {
    title: 'El Tejedor',
    titleShort: 'Tejedor',
    phrase: 'Tu sensibilidad no es debilidad — es la antena más fina del universo.',
    description:
      'El 2 vibra con la dualidad, la cooperación y la escucha profunda. Tu camino está en la conexión, en construir puentes entre mundos que no saben que son el mismo.',
    shadow:
      'La dependencia excesiva y la incapacidad de decir no pueden convertirse en la trampa del 2, que sacrifica su verdad por mantener la paz.',
    keywords: ['cooperación', 'intuición', 'diplomacia', 'paciencia', 'dualidad'],
    color: '#C4B5FD',
  },
  3: {
    title: 'El Creador',
    titleShort: 'Creador',
    phrase: 'Lo que existe en tu imaginación ya es real. Solo falta que lo traigas.',
    description:
      'El 3 es el número de la expresión, la creatividad y el gozo. Tu camino de vida te pide que comuniques, crees e ilumines con la originalidad que nadie más puede replicar.',
    shadow:
      'La dispersión, la superficialidad y el miedo al juicio pueden silenciar la voz más auténtica del 3 justo cuando tiene algo verdadero que decir.',
    keywords: ['expresión', 'creatividad', 'alegría', 'comunicación', 'arte'],
    color: '#6EE7B7',
  },
  4: {
    title: 'El Constructor',
    titleShort: 'Constructor',
    phrase: 'Todo lo que dura fue construido por alguien dispuesto a creer en lo invisible.',
    description:
      'El 4 vibra con la estabilidad, la disciplina y el trabajo profundo. Tu camino es construir fundamentos que sostengan no solo tu vida sino la de quienes vienen después.',
    shadow:
      'La rigidez, el miedo al cambio y el perfeccionismo pueden convertir la fortaleza del 4 en una cárcel de la que no sabe salir.',
    keywords: ['disciplina', 'estabilidad', 'trabajo', 'fundamento', 'orden'],
    color: '#FCD34D',
  },
  5: {
    title: 'El Explorador',
    titleShort: 'Explorador',
    phrase: 'La libertad no es un lujo. Para ti, es el oxígeno.',
    description:
      'El 5 vibra con el movimiento, la libertad y la transformación. Tu camino te lleva a experimentar la vida en toda su variedad, y a enseñar al mundo que el cambio es la única constante sagrada.',
    shadow:
      'La inconstancia, el exceso y la huida del compromiso pueden dispersar toda la energía transformadora del 5 en fragmentos que nunca se completan.',
    keywords: ['libertad', 'aventura', 'cambio', 'curiosidad', 'versatilidad'],
    color: '#67E8F9',
  },
  6: {
    title: 'El Guardián',
    titleShort: 'Guardián',
    phrase: 'El amor que das al mundo debe tener también tu propio nombre.',
    description:
      'El 6 vibra con la responsabilidad, el amor incondicional y la armonía. Tu camino te llama a cuidar, sanar y crear belleza — desde el equilibrio, no desde el sacrificio.',
    shadow:
      'El perfeccionismo en las relaciones, el martirio y la necesidad de control disfrazada de cuidado son las sombras que el 6 debe aprender a reconocer.',
    keywords: ['responsabilidad', 'amor', 'familia', 'armonía', 'servicio'],
    color: '#FDA4AF',
  },
  7: {
    title: 'El Buscador',
    titleShort: 'Buscador',
    phrase: 'La respuesta que persigues no está en el próximo libro — está en el silencio entre dos pensamientos.',
    description:
      'El 7 vibra con el análisis, la espiritualidad y la búsqueda de verdad. Tu camino es ir más profundo que la superficie de las cosas, encontrar el patrón invisible que subyace a todo.',
    shadow:
      'El aislamiento, la desconfianza y el análisis paralizante pueden convertir la sabiduría del 7 en soledad intelectual que confunde saber con vivir.',
    keywords: ['sabiduría', 'análisis', 'espiritualidad', 'introspección', 'verdad'],
    color: '#A5B4FC',
  },
  8: {
    title: 'El Alquimista',
    titleShort: 'Alquimista',
    phrase: 'Tu poder real no está en lo que controlas — está en lo que puedes transformar.',
    description:
      'El 8 vibra con el poder, la abundancia y la justicia kármica. Tu camino te lleva a dominar el mundo material con integridad, transformando recursos en legado.',
    shadow:
      'La sed de control, el materialismo y la tendencia a aplastar lo que no puede seguir su ritmo son las sombras que el 8 debe integrar.',
    keywords: ['poder', 'abundancia', 'autoridad', 'karma', 'transformación'],
    color: '#FC8181',
  },
  9: {
    title: 'El Sabio',
    titleShort: 'Sabio',
    phrase: 'Has completado algo. Ahora puedes soltarlo con gratitud y sin mirada atrás.',
    description:
      'El 9 vibra con la compasión universal, la sabiduría y la culminación. Tu camino es el más amplio: abrazar la humanidad entera sin perder el hilo de ti mismo.',
    shadow:
      'El apego a lo que ya terminó, la amargura ante la ingratitud y la dificultad para recibir son las sombras que el 9 carga cuando no aprende a soltar.',
    keywords: ['compasión', 'sabiduría', 'universalidad', 'culminación', 'servicio'],
    color: '#D8B4FE',
  },
  11: {
    title: 'El Iluminador',
    titleShort: 'Iluminador',
    phrase: 'Eres el canal, no la fuente. Aprende a confiar en lo que te atraviesa.',
    description:
      'El 11 es el primero de los números maestros. Combina la intuición extrema del 2 con la visión del 1, creando un puente entre lo invisible y lo cotidiano. Tu camino es inspirar a través del ser.',
    shadow:
      'La hipersensibilidad, la ansiedad y la distancia entre el ideal y la realidad pueden paralizar al 11 antes de que comparta su luz.',
    keywords: ['intuición', 'inspiración', 'maestro', 'visión', 'espiritualidad'],
    color: '#E9D5FF',
  },
  22: {
    title: 'El Maestro Constructor',
    titleShort: 'Maestro Constructor',
    phrase: 'Tienes la visión del soñador y las manos del arquitecto. Úsalas juntas.',
    description:
      'El 22 es el número maestro del constructor. Combina la intuición del 11 con la disciplina del 4, capaz de materializar visiones que trascienden generaciones.',
    shadow:
      'La distancia entre la grandiosidad de la visión y las limitaciones cotidianas puede generar frustración y abandono justo antes de que la obra esté completa.',
    keywords: ['maestría', 'visión', 'construcción', 'legado', 'poder práctico'],
    color: '#93C5FD',
  },
  33: {
    title: 'El Maestro Maestro',
    titleShort: 'Maestro',
    phrase: 'El amor que vive en ti no te pertenece. Está aquí para ser regalado.',
    description:
      'El 33 es el más raro de los números maestros. Combina la compasión del 6 con la visión mística del 11 y 22. Tu camino es enseñar a través del amor puro, sin agenda.',
    shadow:
      'Cargar con la responsabilidad de ser "el que sana todo" puede destruir al 33 si no aprende que su bienestar es la primera condición del servicio.',
    keywords: ['amor incondicional', 'curación', 'maestría espiritual', 'sacrificio consciente', 'guía'],
    color: '#FBCFE8',
  },
};

// ─── Funciones de cálculo ──────────────────────────────────────────────────

/**
 * Reduce un número a un solo dígito (1–9), preservando 11, 22 y 33.
 */
export function reduceNumber(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  while (n > 9) {
    n = String(n)
      .split('')
      .reduce((acc, d) => acc + parseInt(d, 10), 0);
    if (n === 11 || n === 22 || n === 33) return n;
  }
  return n;
}

/**
 * Suma todos los dígitos de una cadena numérica y reduce.
 */
function sumDigits(str: string): number {
  return str
    .split('')
    .filter(c => /\d/.test(c))
    .reduce((acc, d) => acc + parseInt(d, 10), 0);
}

/**
 * Número de Camino de Vida (Life Path).
 * Método: reducción separada de día, mes y año, luego suma total.
 * Preserva números maestros 11, 22, 33.
 */
export function calculateLifePath(dateStr: string): number {
  if (!dateStr || dateStr.length < 10) return 1;
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const day   = reduceNumber(sumDigits(dayStr));
  const month = reduceNumber(sumDigits(monthStr));
  const year  = reduceNumber(sumDigits(yearStr));
  return reduceNumber(day + month + year);
}

/**
 * Número del Día (Day Number).
 * Reducción del día de nacimiento.
 */
export function calculateDayNumber(dateStr: string): number {
  if (!dateStr || dateStr.length < 10) return 1;
  const day = parseInt(dateStr.split('-')[2], 10);
  return reduceNumber(day);
}

/**
 * Año Personal (Personal Year).
 * Fórmula: día de nacimiento + mes de nacimiento + año actual.
 */
export function calculatePersonalYear(dateStr: string, currentYear?: number): number {
  if (!dateStr || dateStr.length < 10) return 1;
  const [, monthStr, dayStr] = dateStr.split('-');
  const year = currentYear ?? new Date().getFullYear();
  const day   = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  return reduceNumber(day + month + year);
}

/**
 * Día Universal (Universal Day).
 * Reducción de la fecha actual completa.
 */
export function calculateUniversalDay(date?: Date): number {
  const d = date ?? new Date();
  const str = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return reduceNumber(sumDigits(str));
}

/**
 * Genera el perfil numerológico completo a partir de la fecha de nacimiento.
 */
export function calculateNumerologyProfile(birthDateStr: string): NumerologyProfile {
  return {
    lifePath:     calculateLifePath(birthDateStr),
    dayNumber:    calculateDayNumber(birthDateStr),
    personalYear: calculatePersonalYear(birthDateStr),
    universalDay: calculateUniversalDay(),
  };
}

/**
 * Devuelve el contexto numerológico como cadena para los prompts de GPT-4o.
 * Ej.: "Camino de vida 7 (El Buscador) · Año Personal 3 · Día Universal 5"
 */
export function getNumerologyContext(profile: NumerologyProfile): string {
  const lp = NUMEROLOGY_MEANINGS[profile.lifePath];
  return `Camino de vida ${profile.lifePath} (${lp?.titleShort ?? ''}) · Año Personal ${profile.personalYear} · Día Universal ${profile.universalDay}`;
}

/**
 * Frase diaria de numerología basada en el Día Universal actual.
 */
export function getDailyNumerologyPhrase(universalDay: number): string {
  const phrases: Record<number, string> = {
    1: 'Día de comienzos. Actúa antes de pensar demasiado.',
    2: 'Día de cooperación. Escucha más de lo que hablas.',
    3: 'Día de expresión. Crea algo — lo que sea.',
    4: 'Día de trabajo. La constancia de hoy construye el mañana.',
    5: 'Día de cambio. Deja que algo se mueva.',
    6: 'Día de cuidado. Empieza por ti.',
    7: 'Día de reflexión. El silencio tiene respuestas.',
    8: 'Día de poder. Usa tu fuerza con intención.',
    9: 'Día de cierre. Suelta lo que ya cumplió su ciclo.',
    11: 'Día maestro de intuición. Confía en lo que sientes sin explicación.',
    22: 'Día maestro de construcción. Los grandes pasos se dan hoy.',
    33: 'Día maestro de amor. Tu presencia sana.',
  };
  return phrases[universalDay] ?? phrases[reduceNumber(universalDay)];
}
