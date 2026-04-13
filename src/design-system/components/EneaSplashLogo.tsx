/**
 * EneaSplashLogo
 *
 * Logotipo completo para la pantalla de entrada:
 *   - Luna creciente con anillo (calculada como path de dos arcos)
 *   - Dos destellos de estrella en la periferia del anillo
 *   - Wordmark ENEA (paths del logotipo oficial, escala 0.882)
 *
 * Geometría (viewBox 200×250):
 *   Círculo: centro (100,100) r=76
 *   Creciente: arco mayor de A (P2→P1 CW) + arco menor de B (P1→P2 CCW)
 *     Intersecciones A∩B: P2=(71.5,29.5)  P1=(170.5,128.5)
 *     Círculo B (máscara): centro (122,78) r=70
 *   Destello principal: cima del círculo  (100, 24)
 *   Destello secundario: 2h del círculo   (166, 62)
 *   Wordmark: translate(55,218) scale(0.882) → 90×23px centrado
 */

import React from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';

interface Props {
  /** Anchura de renderizado en pts; la altura se calcula en proporción 200:250 */
  size?: number;
}

export const EneaSplashLogo: React.FC<Props> = ({ size = 220 }) => {
  const height = size * (250 / 200);

  return (
    <Svg
      width={size}
      height={height}
      viewBox="0 0 200 250"
      accessibilityLabel="Logo de Enea"
      accessibilityRole="image"
    >
      {/* ── Anillo exterior ─────────────────────────────── */}
      <Circle
        cx="100" cy="100" r="76"
        stroke="white" strokeWidth="0.7" fill="none"
      />

      {/* ── Creciente lunar ─────────────────────────────── */}
      {/*
          Path de dos arcos:
            Arco A (r=76): de P2(71.5,29.5) a P1(170.5,128.5)
              large-arc=1 (arco mayor), sweep=1 (horario)
              → recorre el lado izquierdo-inferior del círculo A
            Arco B (r=70): de P1(170.5,128.5) a P2(71.5,29.5)
              large-arc=0 (arco menor), sweep=0 (antihorario)
              → cierra la curva interior creando la silueta creciente
      */}
      <Path
        d="M71.5,29.5 A76,76 0 1,1 170.5,128.5 A70,70 0 0,0 71.5,29.5 Z"
        fill="white"
      />

      {/* ── Destello principal — cima del anillo (100,24) ── */}
      <Path
        d="M100,9 L101.2,21.5 L105,24 L101.2,26.5 L100,39 L98.8,26.5 L95,24 L98.8,21.5 Z"
        fill="white"
      />

      {/* ── Destello secundario — 2h del anillo (166,62) ── */}
      <Path
        d="M166,54 L166.8,60 L169,62 L166.8,64 L166,70 L165.2,64 L163,62 L165.2,60 Z"
        fill="white"
      />

      {/* ── Wordmark ENEA ────────────────────────────────── */}
      {/* Paths originales (viewBox 0 0 102 26) → scale 0.882 → 90×23px */}
      <G transform="translate(55,218) scale(0.882)">
        {/* A */}
        <Path
          d="M81.1104 25.0939L91.3908 0H91.4448L101.725 25.0939H98.4603L95.6001 17.8895H87.1005L84.2134 25.0939H81.1104ZM88.1259 15.3261H94.5748L92.659 10.5232C92.4251 9.91163 92.2003 9.30901 91.9844 8.7154C91.7686 8.12178 91.5527 7.41123 91.3368 6.58377C91.121 7.41123 90.9141 8.12178 90.7162 8.7154C90.5184 9.29103 90.2935 9.89364 90.0417 10.5232L88.1259 15.3261Z"
          fill="white"
        />
        {/* E (segunda) */}
        <Path
          d="M59.2544 25.0991V0.814697H71.2348V3.56693H62.3304V8.74759H69.346V11.4998H62.3304V22.3468H71.2348V25.0991H59.2544Z"
          fill="white"
        />
        {/* N */}
        <Path
          d="M44.6836 25.9033L27.6844 7.69005V25.0939H24.7703V0L41.7694 18.2133V0.809481H44.6836V25.9033Z"
          fill="white"
        />
        {/* E (primera) */}
        <Path
          d="M0 25.0991V0.814697H11.9804V3.56693H3.07604V8.74759H10.0916V11.4998H3.07604V22.3468H11.9804V25.0991H0Z"
          fill="white"
        />
      </G>
    </Svg>
  );
};
