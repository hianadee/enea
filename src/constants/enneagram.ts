import { EnneagramQuestion, EnneagramType } from '@/types';

// Eneatipos según la caracterología de Claudio Naranjo (Carácter y Neurosis)
export const ENNEAGRAM_TYPES: Record<EnneagramType, { name: string; tagline: string; description: string }> = {
  1: {
    name: 'El Perfeccionista',
    tagline: 'Pasión: ira · Fijación: resentimiento',
    description: 'Vives guiado por un crítico interior inflexible. Tu búsqueda de lo correcto esconde una rabia profunda ante la imperfección del mundo — y de ti mismo.',
  },
  2: {
    name: 'El Orgulloso',
    tagline: 'Pasión: orgullo · Fijación: adulación',
    description: 'Das para ser necesitado. Bajo tu generosidad habita un orgullo sutil que necesita sentirse especial e indispensable para los demás.',
  },
  3: {
    name: 'El Vanidoso',
    tagline: 'Pasión: vanidad · Fijación: imagen',
    description: 'Te has identificado con la máscara del éxito. El logro te protege de un vacío interior que temes encontrar si dejas de actuar.',
  },
  4: {
    name: 'El Envidioso',
    tagline: 'Pasión: envidia · Fijación: melancolía',
    description: 'Vives la herida de lo que falta. Tu profundidad emocional y tu anhelo de autenticidad nacen del dolor de sentirte fundamentalmente diferente.',
  },
  5: {
    name: 'El Avaro',
    tagline: 'Pasión: avaricia · Fijación: acumulación',
    description: 'Te retiras al mundo de la mente. Acumulas conocimiento y recursos como defensa ante un mundo que sientes amenazante y drenador.',
  },
  6: {
    name: 'El Cobarde',
    tagline: 'Pasión: miedo · Fijación: duda',
    description: 'La duda es tu compañera constante. Buscas seguridad en la lealtad o en el desafío al peligro — dos formas de enfrentar el mismo miedo profundo.',
  },
  7: {
    name: 'El Glotón',
    tagline: 'Pasión: gula · Fijación: anticipación',
    description: 'Vuelas de experiencia en experiencia para no aterrizar en el dolor. Tu entusiasmo es real, pero también es una huida de la profundidad.',
  },
  8: {
    name: 'El Lujurioso',
    tagline: 'Pasión: lujuria · Fijación: venganza',
    description: 'Tu intensidad vital no conoce medias tintas. Dominas y proteges con la misma fuerza, mientras ocultas una ternura que consideras peligrosa.',
  },
  9: {
    name: 'El Indolente',
    tagline: 'Pasión: pereza · Fijación: rumiación',
    description: 'Te diluyes en el entorno para evitar el conflicto. Tu pereza no es física sino psíquica: un abandono silencioso de ti mismo en busca de paz.',
  },
};

export const ENNEAGRAM_QUESTIONS: EnneagramQuestion[] = [
  {
    id: 1,
    text: 'Cuando algo injusto ocurre a tu alrededor, ¿qué sientes primero?',
    options: [
      { label: 'Indignación: necesito corregirlo o señalarlo', types: [1] },
      { label: 'Herida: me afecta y busco que lo reconozcan', types: [2] },
      { label: 'Cálculo: pienso cómo afecta lo que proyecto', types: [3] },
      { label: 'Intensidad: me sumerjo en el dolor de lo que falta', types: [4] },
      { label: 'Distancia: observo y analizo desde afuera', types: [5] },
      { label: 'Ansiedad: me pregunto qué vendrá después', types: [6] },
      { label: 'Evasión: busco algo más estimulante en lo que pensar', types: [7] },
      { label: 'Reacción directa: intervengo con toda mi fuerza', types: [8] },
      { label: 'Adaptación: trato de mantener la calma y la armonía', types: [9] },
    ],
  },
  {
    id: 2,
    text: 'En el fondo, ¿qué buscas en tus relaciones más íntimas?',
    options: [
      { label: 'Alguien que valore mis principios y mi integridad', types: [1] },
      { label: 'Sentirme necesario/a e imprescindible para el otro', types: [2] },
      { label: 'Ser admirado/a y deseado/a por lo que logro', types: [3] },
      { label: 'Una conexión profunda que nunca llega del todo', types: [4] },
      { label: 'Autonomía: que no me invadan ni me agoten', types: [5] },
      { label: 'Alguien de absoluta confianza que no me abandone', types: [6] },
      { label: 'Diversión y libertad sin demasiado compromiso', types: [7] },
      { label: 'Proteger con intensidad a quien amo', types: [8] },
      { label: 'Fusionarme y no perder la paz', types: [9] },
    ],
  },
  {
    id: 3,
    text: '¿Cuál es tu mayor fuente de sufrimiento interno?',
    options: [
      { label: 'El resentimiento ante la imperfección del mundo', types: [1] },
      { label: 'El orgullo herido cuando no soy reconocido/a', types: [2] },
      { label: 'El miedo a ser desenmascarado/a o a fracasar', types: [3] },
      { label: 'La envidia ante lo que otros tienen y yo siento que me falta', types: [4] },
      { label: 'El miedo a ser invadido/a o perder mi autonomía', types: [5] },
      { label: 'La duda constante y la desconfianza hacia el mundo', types: [6] },
      { label: 'El dolor que evito a toda costa buscando placer', types: [7] },
      { label: 'La intensidad que me lleva al exceso o la destrucción', types: [8] },
      { label: 'La pereza profunda que me hace desaparecer', types: [9] },
    ],
  },
  {
    id: 4,
    text: '¿Cómo intentas llenar el vacío interior?',
    options: [
      { label: 'Siguiendo normas y haciendo todo lo más correctamente posible', types: [1] },
      { label: 'Siendo útil e indispensable para quienes me rodean', types: [2] },
      { label: 'Logrando metas y buscando que me admiren', types: [3] },
      { label: 'Creando, sufriendo o buscando belleza y profundidad', types: [4] },
      { label: 'Acumulando conocimiento y tiempo a solas', types: [5] },
      { label: 'Buscando alianzas sólidas y sistemas de seguridad', types: [6] },
      { label: 'Lanzándome a nuevas experiencias y planes emocionantes', types: [7] },
      { label: 'Tomando el control y demostrando mi fortaleza', types: [8] },
      { label: 'Fusionándome con el entorno y evitando cualquier conflicto', types: [9] },
    ],
  },
  {
    id: 5,
    text: '¿Cómo describes tu relación con tus propias emociones?',
    options: [
      { label: 'Las racionalizo y controlo antes de sentirlas plenamente', types: [1] },
      { label: 'Las uso para conectar y generar vínculos afectivos', types: [2] },
      { label: 'Las administro según lo que conviene proyectar', types: [3] },
      { label: 'Las siento con una intensidad que a veces me desborda', types: [4] },
      { label: 'Las observo desde la distancia; prefiero la mente', types: [5] },
      { label: 'Me generan ansiedad; necesito comprenderlas y contenerlas', types: [6] },
      { label: 'Busco las placenteras y huyo de las dolorosas', types: [7] },
      { label: 'Las expreso sin filtro con toda su fuerza', types: [8] },
      { label: 'Las anestesio para mantener la calma y la paz', types: [9] },
    ],
  },
];
