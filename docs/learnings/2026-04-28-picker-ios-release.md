# Picker iOS rebota a la hora anterior en Release

**Fecha:** 2026-04-28
**Builds afectados:** 9 (primer fallo), 10 (segundo fallo)
**Resolución final:** Eliminamos el picker. Lo sustituimos por chips presets (07:00 / 09:00 / 14:00 / 18:00 / 21:00).

## Síntoma

En la pantalla **Tú · Cita diaria**, al usar la rueda de hora del `DateTimePicker` con `display="spinner"`:
- En simulador: rueda fluida, inercia natural al soltar
- En TestFlight: la rueda rebota a la hora anterior durante el scroll, cancelando la inercia

## Causa raíz

`@react-native-community/datetimepicker@8.4.4` re-aplica todas sus props al `UIDatePicker` nativo en cada `updateProps`, incluyendo `value`. Si el componente padre re-renderiza durante el scroll del usuario:

1. RN reconcilia y manda `updateProps` al native module
2. El native module re-aplica `value` al `UIDatePicker`
3. El UIDatePicker interpreta esto como un `setDate` programático
4. **Cancela la inercia del momentum scroll**
5. La rueda rebota visualmente a la posición de `value` (la hora vieja del state)

Cualquiera de estos disparaba un re-render del padre durante el scroll:
- `style={{ width: '100%' }}` inline → referencia nueva cada render
- `onChange={() => {…}}` sin `useCallback` → función nueva cada render
- `textColor: colors.text` cuando `useTheme()` cambiaba ref
- Cualquier suscripción de Zustand del `SettingsScreen` que disparara mid-scroll

## Fixes intentados (y por qué fallaron)

### Build 9 — Tracking en ref, no setState
```tsx
// onChange escribe en pickerDateRef, no setState
if (selectedDate) pickerDateRef.current = selectedDate;
```

**Por qué falló:** Resolvía solo UNA fuente de re-render (no actualizar `pickerDate` durante scroll). Pero re-renders del padre seguían llegando por otras vías (Zustand, theme, etc.) y cada uno disparaba `updateProps` en el picker.

### Build 10 — Conditional render + key dinámico + value estable
```tsx
{showTimePicker && (
  <DateTimePicker
    key={pickerSessionKey}
    value={pickerDate}
    ...
  />
)}
```

**Por qué falló:** El `key` dinámico solo refresca al abrir el modal. Mientras el modal está abierto y el usuario gira la rueda, el `key` no cambia → React reconcilia → `updateProps` sigue llegando al native module → mismo bug.

**Patrón:** Ambos fixes trataban el síntoma ("evitar setState"), no la causa ("el native module re-aplica value en cualquier updateProps"). Cada nuevo build añadía una capa defensiva sobre una teoría rota.

## Fix definitivo

**Eliminar el picker entero.** Sustituirlo por una fila de chips presets con `flex: 1`:

```tsx
const TIME_PRESETS = [
  { h: 7, m: 0, label: '07:00' },
  { h: 9, m: 0, label: '09:00' },
  { h: 14, m: 0, label: '14:00' },
  { h: 18, m: 0, label: '18:00' },
  { h: 21, m: 0, label: '21:00' },
];

{dailyQuote.enabled && TIME_PRESETS.map(p => (
  <Chip
    key={p.label}
    active={dailyQuote.hour === p.h}
    onPress={() => updateTime(p.h, p.m)}
    label={p.label}
  />
))}
```

Cero superficie nativa → cero divergencia simulator/release.

## Por qué no se vio en simulador

El simulador corre el JS thread sobre la CPU del Mac, mucho más rápida que un iPhone. Los re-renders del padre llegaban DESPUÉS del momentum scroll y no afectaban la inercia. En iPhone real con build Release, los re-renders llegaban DENTRO del momentum y cancelaban la inercia visiblemente.

## Cómo prevenir bugs similares

1. **Sospechar de cualquier native module con UI compleja** (pickers, sliders, sheets nativos). Si admite props que cambian frecuentemente, asumir divergencia simulator/release.

2. **Antes de elegir un componente nativo**, considerar el coste de mantenerlo: cada actualización de iOS o de la library puede romperlo. Para casos donde se acepta una alternativa simple (chips, stepper, presets), preferirla.

3. **Si un fix nativo no aguanta TestFlight**, no insistir con más capas defensivas. Considerar eliminar la dependencia nativa.

4. **Buscar GitHub issues del package** antes de teorizar. `@react-native-community/datetimepicker` tiene reportes públicos de exactly este comportamiento en iOS 17+.
