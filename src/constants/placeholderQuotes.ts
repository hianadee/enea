import { EnneagramType } from '@/types';

export interface PlaceholderQuote {
  text: string;
  explanation: string;
  planetaryContext: string;
  numerologyContext?: string; // Contexto numerológico adicional para el prompt
}

// Citas personalizadas por eneagrama según la caracterología de Naranjo
export const PLACEHOLDER_QUOTES: Record<EnneagramType, PlaceholderQuote[]> = {
  1: [
    {
      text: 'La perfección no es un destino sino la calidad de atención que traes a cada momento. El arquero que suelta la flecha no la persigue — confía en la puntería.',
      explanation: 'Tu crítico interior, esa voz que Naranjo describe como la ira vuelta hacia adentro, pide hoy descanso. Saturno transitando tu sexta casa te invita a transformar el resentimiento en discernimiento.',
      planetaryContext: 'Saturno · tránsito casa 6',
    },
    {
      text: 'Lo que llamas defecto es exactamente el lugar por donde entra la luz. El recipiente agrietado es el que derrama.',
      explanation: 'La fijación del perfeccionismo nace del miedo a la corrupción interior. Venus en tu casa doce suaviza hoy ese juicio implacable — la belleza vive en la imperfección.',
      planetaryContext: 'Venus · casa 12',
    },
  ],
  2: [
    {
      text: 'Dar desde la plenitud es generosidad. Dar desde el agotamiento es una forma silenciosa de borrarte. El mundo te necesita entero/a.',
      explanation: 'El orgullo del E2, según Naranjo, es la ilusión de no necesitar nada a cambio. Júpiter expande hoy tu capacidad de recibir — también eso es amor.',
      planetaryContext: 'Júpiter · conjunción lunar',
    },
    {
      text: 'No tienes que ganarte tu lugar en la habitación. No fuiste hecho/a para ser útil — fuiste hecho/a para estar vivo/a.',
      explanation: 'La adulación como fijación busca el amor que no llegó sin condiciones. El tránsito de Venus por tu primera casa te invita hoy a dirigir ese amor hacia ti.',
      planetaryContext: 'Venus · tránsito casa 1',
    },
  ],
  3: [
    {
      text: 'La versión más poderosa de ti no es la que actúa el éxito — es la que ha olvidado por completo al público.',
      explanation: 'La vanidad como pasión, en el mapa de Naranjo, es la identificación con la máscara. La Luna en Tauro te pide hoy que ralentices y dejes que el trabajo sea su propia recompensa.',
      planetaryContext: 'Luna en Tauro',
    },
    {
      text: 'Bajo cada logro hay una persona que simplemente quería ser vista. Ya eres visto/a. Construye desde ahí.',
      explanation: 'Mercurio retrógrado en tu décima casa te invita a reexaminar qué significa el éxito cuando nadie está mirando.',
      planetaryContext: 'Mercurio Rx · casa 10',
    },
  ],
  4: [
    {
      text: 'No eres la herida. Eres quien la ha sobrevivido — y ha aprendido a hacer belleza con lo que queda.',
      explanation: 'La envidia del E4, según Naranjo, es el dolor de sentir que algo esencial falta. Neptuno en tu octava casa profundiza hoy tu capacidad de transformar ese dolor en creación.',
      planetaryContext: 'Neptuno · casa 8',
    },
    {
      text: 'El anhelo mismo es una forma de amor — el corazón que se extiende hacia algo que reconoce como propio. Confía en el dolor. Es una brújula.',
      explanation: 'Tu luna en Piscis y Venus en casa cuatro hacen de hoy un tránsito de despertar creativo. Deja que el sentir sea el medio.',
      planetaryContext: 'Tránsito lunar · Venus casa 4',
    },
  ],
  5: [
    {
      text: 'Ya has reunido suficiente. Hay un momento en que el conocimiento debe exhalarse al mundo, no apretarse más. Hoy es esa exhalación.',
      explanation: 'La avaricia del E5 no es de dinero sino de energía y de sí mismo. El Sol transitando tu undécima casa te invita a compartir lo que sabes — la mente compartida se multiplica.',
      planetaryContext: 'Sol · tránsito casa 11',
    },
    {
      text: 'El universo no se agota de sentido cuando das algo. La comprensión compartida se convierte en comprensión multiplicada.',
      explanation: 'Mercurio conjunto a tu Júpiter natal amplifica hoy tu voz. Lo que llamas "todavía no estoy listo/a" quizás solo espera permiso.',
      planetaryContext: 'Mercurio conjunto Júpiter natal',
    },
  ],
  6: [
    {
      text: 'La seguridad que buscas nunca estuvo en el resultado. Siempre estuvo en tu capacidad de encontrarte con lo que venga. Ya lo has demostrado — muchas veces.',
      explanation: 'El miedo del E6 busca certeza en la lealtad o en el desafío al peligro. Júpiter en trígono a tu Sol natal disuelve hoy esa duda. La confianza no es ingenuidad: es sabiduría ganada.',
      planetaryContext: 'Júpiter trígono Sol natal',
    },
    {
      text: 'El coraje no es la ausencia del miedo — es la decisión de que algo importa más. Siempre has sabido esto.',
      explanation: 'Marte activando tu primera casa te pide hoy que te muevas antes de sentirte completamente listo/a. Esa preparación total quizás nunca llegue.',
      planetaryContext: 'Marte · activación casa 1',
    },
  ],
  7: [
    {
      text: 'La alegría que huye de la quietud es agitación disfrazada. El placer más profundo es el que te quedas a sentir del todo.',
      explanation: 'La gula del E7 no es de comida sino de experiencias — una huida del dolor disfrazada de entusiasmo. La mano firme de Saturno te invita hoy a ir más hondo en lugar de más lejos.',
      planetaryContext: 'Saturno cuadrado Júpiter natal',
    },
    {
      text: '¿Y si este momento — exactamente como es, sin nada extraordinario — ya es la aventura que buscabas?',
      explanation: 'La fijación en la anticipación siempre sitúa la felicidad en el próximo plan. La Luna en tu cuarta casa te pide hoy que vuelvas a casa, a ti mismo/a.',
      planetaryContext: 'Luna · casa 4',
    },
  ],
  8: [
    {
      text: 'La fortaleza que no puede ablandarse es armadura, no poder. La fuerza más formidable que posees es la capacidad de ser conmovido/a.',
      explanation: 'La lujuria del E8 es intensidad vital que no tolera límites. Venus en tu casa doce te invita hoy a dejar que la ternura sea una forma de valentía.',
      planetaryContext: 'Venus · casa 12',
    },
    {
      text: 'El mundo no necesita hoy tu armadura. Necesita al que hay debajo — el que todavía cree que las cosas pueden ser distintas.',
      explanation: 'Quirón activando tu cuarta casa invita a sanar antes de liderar. La vulnerabilidad que escondes es también tu mayor poder.',
      planetaryContext: 'Quirón · activación casa 4',
    },
  ],
  9: [
    {
      text: 'Tu presencia no perturba la paz — es la paz. Deja de desaparecer en los deseos de los demás.',
      explanation: 'La pereza del E9 no es física sino psíquica: el abandono silencioso de uno mismo. Marte te urge hoy a reclamar tu lugar con plena presencia.',
      planetaryContext: 'Marte oposición Luna natal',
    },
    {
      text: 'La montaña no se disculpa por ser grande. Tú tampoco deberías. Ocupa el espacio que te corresponde por naturaleza.',
      explanation: 'El Sol transitando tu primera casa es una invitación anual a ser más tú, no menos. Hoy, deja que tus propias preferencias conduzcan.',
      planetaryContext: 'Retorno solar · casa 1',
    },
  ],
};

/**
 * Selecciona la cita del día según el tipo eneagramático.
 * La selección rota día a día para ofrecer variedad.
 *
 * @param enneagramType - Tipo eneagramático del usuario (1–9)
 * @param universalDay  - Día Universal numerológico (1–9) para modular la selección
 */
export function getPlaceholderQuote(
  enneagramType: EnneagramType | null,
  universalDay?: number,
): PlaceholderQuote {
  const type = enneagramType ?? 4;
  const quotes = PLACEHOLDER_QUOTES[type];

  // Selección basada en la fecha + día universal para máxima variedad
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const seed = universalDay ? dayOfYear + universalDay : dayOfYear;
  const quote = quotes[seed % quotes.length];

  // Enriquecer el contexto numerológico si hay día universal disponible
  if (universalDay) {
    return {
      ...quote,
      numerologyContext: `Día Universal ${universalDay}`,
    };
  }
  return quote;
}
