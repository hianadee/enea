# Learnings

Patrones descubiertos trabajando en ENEA. Una entrada por bug significativo o decisión de arquitectura no obvia.

**Cuándo añadir una entrada:**
- Un bug llegó a TestFlight y costó esfuerzo entender la causa raíz
- Un fix volvió a romperse y fue necesario un segundo intento
- Descubrimos un comportamiento del entorno (Hermes, Release builds, librería nativa) que no era obvio desde el código

**Cuándo NO añadir:**
- Bugs triviales arreglados en una sesión (commit message basta)
- Decisiones de feature ("añadimos chips para presets") — eso vive en commits

**Estructura mínima:**
1. Síntoma (qué ve el usuario)
2. Causa raíz (no el síntoma)
3. Fix (qué cambió y por qué resuelve la causa, no el síntoma)
4. Por qué no se vio en simulador / dev (la sección más valiosa)
5. Cómo prevenirlo

Ordenadas por fecha descendente.
