# ENEA Design System — Guía de Implementación Rápida

## 📦 Archivos Descargados

Tienes estos archivos listos para copiar a tu proyecto:

```
TOKENS:
├─ colors.js
├─ typography.js
└─ spacing.js

COMPONENTES:
├─ Button.tsx
├─ Card.tsx
└─ Input.tsx

DOCUMENTACIÓN:
├─ ENEA_DESIGN_FOUNDATIONS.md
├─ ENEA_COMPONENT_LIBRARY.md
└─ enea-design-tokens.json
```

---

## 🚀 Pasos de Instalación

### PASO 1: Crear carpetas en tu proyecto

En tu proyecto React Native (`enea_app/enea_/`), crea:

```bash
mkdir -p src/design-system/tokens
mkdir -p src/design-system/components
```

### PASO 2: Copiar tokens

Copia estos archivos a `src/design-system/tokens/`:

```
colors.js
typography.js
spacing.js
```

Crea un archivo `src/design-system/tokens/index.js`:

```javascript
export { colors as default } from './colors';
export { colors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius, shadow } from './spacing';
```

### PASO 3: Copiar componentes

Copia estos archivos a `src/design-system/components/`:

```
Button.tsx
Card.tsx
Input.tsx
```

Crea un archivo `src/design-system/components/index.ts`:

```javascript
export { Button } from './Button';
export { Card } from './Card';
export { Input } from './Input';
```

### PASO 4: Actualizar tsconfig.json (si usas TypeScript)

Asegúrate de que tienes path alias:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 💻 Usar en tu App

### Ejemplo 1: Pantalla Onboarding

```jsx
import { View, Text } from 'react-native';
import { Button, Card, Input } from '@/design-system/components';
import { colors, spacing } from '@/design-system/tokens';

export default function OnboardingScreen() {
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.bg.primary,
      padding: spacing.lg 
    }}>
      <Card variant="elevated">
        <Text style={{ color: colors.fg.primary }}>Enter Your Name</Text>
        <Input 
          label="Full Name" 
          placeholder="John Doe"
        />
        <Button variant="primary" onPress={() => handleNext()}>
          Continue
        </Button>
      </Card>
    </View>
  );
}
```

### Ejemplo 2: Daily Quote

```jsx
import { View, Text, ScrollView } from 'react-native';
import { Card } from '@/design-system/components';
import { colors, typography, spacing } from '@/design-system/tokens';

export default function DailyQuote({ quote, author }) {
  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.bg.primary }}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      <Card variant="elevated">
        <Text style={{
          fontSize: typography.fontSize.display,
          color: colors.fg.primary,
          fontFamily: typography.fontFamily.serif,
          marginBottom: spacing.lg,
        }}>
          "{quote}"
        </Text>
        <Text style={{
          fontSize: typography.fontSize.bodySmall,
          color: colors.fg.secondary,
        }}>
          — {author}
        </Text>
      </Card>
    </ScrollView>
  );
}
```

### Ejemplo 3: Settings

```jsx
import { View, Text, Switch } from 'react-native';
import { Button, Card } from '@/design-system/components';
import { colors, spacing, typography } from '@/design-system/tokens';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = React.useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary, padding: spacing.lg }}>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.fg.primary, fontSize: typography.fontSize.body }}>
            Dark Mode
          </Text>
          <Switch 
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: colors.border, true: colors.primary.action }}
          />
        </View>
      </Card>

      <Button variant="primary" onPress={() => handleLogout()}>
        Logout
      </Button>
    </View>
  );
}
```

---

## 🎨 Colores Disponibles

```javascript
import { colors } from '@/design-system/tokens';

// Primarios
colors.primary.action        // #A391D8 (Lavender) ← USA ESTE
colors.primary.dark          // #1A2332 (Deep Navy)
colors.primary.accent        // #E8A8A0 (Soft Rose)

// Fondos
colors.bg.primary            // #1A2332 (Fondo principal)
colors.bg.elevated           // #252E3F (Tarjetas)

// Texto
colors.fg.primary            // #E8E8E8 (Texto principal)
colors.fg.secondary          // #A8A8B8 (Texto secundario)

// Estado
colors.status.success        // #7DD3C0 (Verde)
colors.status.warning        // #F4B95B (Oro)
colors.status.error          // #D97C7C (Rojo)
```

---

## 📐 Espaciado

```javascript
import { spacing } from '@/design-system/tokens';

spacing.xs    // 4px
spacing.sm    // 8px
spacing.md    // 16px
spacing.lg    // 24px   ← Más usado
spacing.xl    // 32px
spacing['2xl'] // 48px
```

---

## 🔤 Tipografía

```javascript
import { typography } from '@/design-system/tokens';

// Tamaños
typography.fontSize.display       // 32
typography.fontSize.h1            // 28
typography.fontSize.body          // 16
typography.fontSize.caption       // 12

// Familias
typography.fontFamily.serif       // Para headings
typography.fontFamily.sans        // Para body

// Presets listos para usar
typography.presets.body           // { fontSize: 16, lineHeight: 24, ... }
typography.presets.h1             // { fontSize: 28, lineHeight: 36, ... }
```

---

## 🧩 Componentes

### Button

```jsx
<Button 
  variant="primary"      // 'primary' | 'secondary' | 'ghost'
  size="md"             // 'sm' | 'md' | 'lg'
  disabled={false}
  onPress={() => handlePress()}
>
  Click me
</Button>
```

### Card

```jsx
<Card variant="elevated">    {/* 'default' | 'elevated' | 'interactive' */}
  <Text>Content inside card</Text>
</Card>
```

### Input

```jsx
<Input 
  label="Email"
  placeholder="your@email.com"
  helperText="We'll never share your email"
  error={false}
  onChangeText={(text) => setEmail(text)}
/>
```

---

## ✅ Checklist

- [ ] Crear carpetas `src/design-system/{tokens,components}`
- [ ] Copiar archivos de tokens
- [ ] Copiar archivos de componentes
- [ ] Crear index.js en tokens/
- [ ] Crear index.ts en components/
- [ ] Actualizar tsconfig.json con path alias
- [ ] Importar y usar en una pantalla
- [ ] Probar que funcione
- [ ] ¡Listo!

---

## 🆘 Troubleshooting

**P: "Cannot find module '@/design-system/tokens'"**  
R: Verifica que tsconfig.json tiene la configuración de paths correcta

**P: Los colores no se ven bien**  
R: Asegúrate de que estás usando `colors.fg.primary` (no hardcodeado "#FFF")

**P: El componente Button no renderiza**  
R: Verifica que importaste correctamente: `import { Button } from '@/design-system/components'`

---

## 📚 Documentación Completa

Abre estos archivos para más detalles:
- `ENEA_DESIGN_FOUNDATIONS.md` — Especificaciones técnicas
- `ENEA_COMPONENT_LIBRARY.md` — Biblioteca de componentes detallada
- `enea-design-tokens.json` — Todos los tokens en JSON

---

**¡Listo! Ahora tienes un design system completo para ENEA.** 🚀
