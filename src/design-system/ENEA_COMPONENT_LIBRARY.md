# ENEA Component Library

## Overview
Componentes React Native reutilizables y bien documentados, listos para ser implementados en la app ENEA.

---

## Button Component

### Primary Button
**Use case**: Main CTAs, confirmations, next steps

```jsx
<TouchableOpacity 
  className="bg-enea-primary px-lg py-md rounded-md flex-row items-center justify-center"
  onPress={() => handleAction()}
  activeOpacity={0.8}
>
  <Text className="text-white font-medium text-body">Continue</Text>
</TouchableOpacity>
```

**States**:
- Default: `bg-enea-primary`
- Hover: `bg-enea-primary-dark`
- Active: `opacity-60 scale-95`
- Disabled: `opacity-40 cursor-not-allowed`

### Secondary Button
**Use case**: Alternative actions, cancel, skip

```jsx
<TouchableOpacity 
  className="border border-enea-primary px-lg py-md rounded-md flex-row items-center justify-center bg-transparent"
  onPress={() => handleAlternate()}
>
  <Text className="text-enea-primary font-medium text-body">Skip</Text>
</TouchableOpacity>
```

### Ghost Button
**Use case**: Links, tertiary actions, learn more

```jsx
<TouchableOpacity 
  className="bg-transparent px-0 py-sm"
  onPress={() => handleLink()}
>
  <Text className="text-enea-primary font-medium text-body">Learn more</Text>
</TouchableOpacity>
```

---

## Card Component

**Use case**: Containers for content blocks, elevated surfaces

```jsx
<View className="bg-enea-dark-secondary rounded-lg p-lg border border-enea-dark-tertiary shadow-medium">
  <Text className="text-h2 text-enea-fg-primary mb-md">Card Title</Text>
  <Text className="text-body text-enea-fg-secondary">Card content goes here with secondary text color.</Text>
</View>
```

**Variants**:

#### Elevated Card (Interactive)
```jsx
<View className="bg-enea-dark-secondary rounded-lg p-lg border-2 border-enea-primary shadow-glow">
  {/* Content */}
</View>
```

#### Minimal Card
```jsx
<View className="bg-enea-dark-secondary rounded-lg p-md">
  {/* Content */}
</View>
```

---

## Input Field Component

**Use case**: Text entry, search, form fields

```jsx
<TextInput
  className="w-full bg-black bg-opacity-30 border border-enea-dark-tertiary rounded-md px-md py-md text-enea-fg-primary font-body placeholder-enea-fg-secondary focus:border-enea-primary focus:shadow-glow"
  placeholder="Enter your input..."
  placeholderTextColor="#A8A8B8"
  value={value}
  onChangeText={setValue}
/>
```

**Variants**:

#### With Label
```jsx
<View className="mb-lg">
  <Text className="text-label-lg text-enea-fg-primary mb-sm">Label</Text>
  <TextInput
    className="w-full bg-black bg-opacity-30 border border-enea-dark-tertiary rounded-md px-md py-md text-enea-fg-primary"
    placeholder="Placeholder text..."
  />
</View>
```

#### With Helper Text
```jsx
<View className="mb-lg">
  <TextInput
    className="w-full bg-black bg-opacity-30 border border-enea-dark-tertiary rounded-md px-md py-md text-enea-fg-primary mb-sm"
    placeholder="Input..."
  />
  <Text className="text-caption text-enea-fg-secondary">Helper text or error message</Text>
</View>
```

---

## Text Components

### Heading (Display Level)
```jsx
<Text className="text-display font-serif font-regular text-enea-fg-primary mb-lg">
  Welcome to ENEA
</Text>
```

### Heading Level 1
```jsx
<Text className="text-h1 font-serif font-regular text-enea-fg-primary mb-md">
  Section Title
</Text>
```

### Body Text
```jsx
<Text className="text-body font-sans text-enea-fg-primary leading-relaxed">
  Main content with good line height and readability.
</Text>
```

### Secondary Text
```jsx
<Text className="text-body-sm font-sans text-enea-fg-secondary">
  Secondary information, captions, metadata
</Text>
```

### Label / Button Text
```jsx
<Text className="text-label-lg font-medium text-enea-fg-primary">
  Action Label
</Text>
```

---

## Badge / Pill Component

**Use case**: Tags, status indicators, categorical labels

```jsx
<View className="bg-enea-primary rounded-full px-md py-xs inline-flex">
  <Text className="text-label text-white font-medium">Premium</Text>
</View>
```

**Variants**:

#### Status Badge (Success)
```jsx
<View className="bg-success rounded-full px-md py-xs">
  <Text className="text-label text-white font-medium">Confirmed</Text>
</View>
```

#### Status Badge (Warning)
```jsx
<View className="bg-warning rounded-full px-md py-xs">
  <Text className="text-label text-gray-900 font-medium">Pending</Text>
</View>
```

#### Outline Badge
```jsx
<View className="border border-enea-primary rounded-full px-md py-xs bg-transparent">
  <Text className="text-label text-enea-primary font-medium">Optional</Text>
</View>
```

---

## Toggle / Switch Component

**Use case**: On/off settings, preferences

```jsx
<View className="flex-row items-center justify-between">
  <Text className="text-body text-enea-fg-primary">Dark Mode</Text>
  <Switch
    value={isEnabled}
    onValueChange={setIsEnabled}
    trackColor={{ false: '#3A4A5F', true: '#A391D8' }}
    thumbColor={isEnabled ? '#FFFFFF' : '#E8E8E8'}
  />
</View>
```

---

## Modal / Overlay Component

**Use case**: Alerts, dialogs, confirmations

```jsx
<Modal
  visible={isVisible}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setIsVisible(false)}
>
  <View className="flex-1 bg-black bg-opacity-50 items-center justify-center">
    <View className="bg-enea-dark-secondary rounded-lg p-2xl max-w-sm">
      <Text className="text-h2 text-enea-fg-primary mb-md">Confirm Action</Text>
      <Text className="text-body text-enea-fg-secondary mb-2xl">
        Are you sure you want to continue?
      </Text>
      <View className="flex-row gap-md">
        <TouchableOpacity 
          className="flex-1 bg-enea-dark-tertiary py-md rounded-md"
          onPress={() => setIsVisible(false)}
        >
          <Text className="text-center text-body text-enea-fg-primary">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="flex-1 bg-enea-primary py-md rounded-md"
          onPress={() => {
            handleConfirm();
            setIsVisible(false);
          }}
        >
          <Text className="text-center text-body text-white font-medium">Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
```

---

## Divider Component

**Use case**: Visual separation, section breaks

### Subtle Divider
```jsx
<View className="h-px bg-enea-dark-tertiary my-lg" />
```

### With Label
```jsx
<View className="flex-row items-center gap-md my-lg">
  <View className="flex-1 h-px bg-enea-dark-tertiary" />
  <Text className="text-caption text-enea-fg-secondary">Or continue with</Text>
  <View className="flex-1 h-px bg-enea-dark-tertiary" />
</View>
```

---

## Icon Component

**Use case**: Visual indicators, actions, status

```jsx
import SvgIcon from 'react-native-svg'; // or use react-native-svg

<SvgIcon
  width={24}
  height={24}
  viewBox="0 0 24 24"
  fill="none"
  stroke="#A391D8"
  strokeWidth={2}
>
  {/* SVG path */}
</SvgIcon>
```

**Color variants**:
- Primary action: `#A391D8`
- Secondary text: `#A8A8B8`
- Success: `#7DD3C0`
- Warning: `#F4B95B`
- Error: `#D97C7C`

---

## Avatar Component

**Use case**: User profiles, initials, profile pictures

### Initials Avatar
```jsx
<View className="w-12 h-12 rounded-full bg-enea-primary flex items-center justify-center">
  <Text className="text-label-lg text-white font-medium">AD</Text>
</View>
```

### Image Avatar
```jsx
<Image
  source={{ uri: 'https://...' }}
  className="w-12 h-12 rounded-full bg-enea-dark-tertiary"
/>
```

---

## Progress Bar / Indicator Component

**Use case**: Loading states, progress tracking, step indicators

### Linear Progress
```jsx
<View className="w-full h-1 bg-enea-dark-tertiary rounded-full overflow-hidden">
  <View 
    className="h-full bg-enea-primary"
    style={{ width: `${progress}%` }}
  />
</View>
```

### Step Indicator
```jsx
<View className="flex-row items-center gap-lg mb-xl">
  {[1, 2, 3, 4, 5].map((step) => (
    <View 
      key={step}
      className={`w-2 h-2 rounded-full ${
        step <= currentStep ? 'bg-enea-primary' : 'bg-enea-dark-tertiary'
      }`}
    />
  ))}
</View>
```

---

## List / ScrollView Component

**Use case**: Multiple items, collections, feeds

```jsx
<ScrollView 
  className="flex-1 bg-enea-dark-primary"
  showsVerticalScrollIndicator={false}
>
  {items.map((item) => (
    <TouchableOpacity 
      key={item.id}
      className="bg-enea-dark-secondary rounded-lg p-lg mb-md border border-enea-dark-tertiary flex-row items-center justify-between"
      onPress={() => handlePress(item)}
    >
      <View className="flex-1">
        <Text className="text-body text-enea-fg-primary font-medium">{item.title}</Text>
        <Text className="text-body-sm text-enea-fg-secondary mt-xs">{item.subtitle}</Text>
      </View>
      <View className="w-6 h-6 rounded-full bg-enea-primary opacity-20" />
    </TouchableOpacity>
  ))}
</ScrollView>
```

---

## Layout Patterns

### Full-Width Screen with Safe Area
```jsx
<SafeAreaView className="flex-1 bg-enea-dark-primary">
  <ScrollView 
    className="flex-1"
    contentContainerStyle={{ padding: 24 }}
    showsVerticalScrollIndicator={false}
  >
    {/* Content */}
  </ScrollView>
</SafeAreaView>
```

### Centered Content Container
```jsx
<View className="flex-1 bg-enea-dark-primary items-center justify-center px-lg">
  <View className="max-w-sm">
    {/* Content centered horizontally and vertically */}
  </View>
</View>
```

### Floating Action Button (FAB)
```jsx
<TouchableOpacity 
  className="absolute bottom-2xl right-lg w-16 h-16 rounded-full bg-enea-primary items-center justify-center shadow-glow"
  onPress={() => handleFAB()}
>
  <Text className="text-2xl text-white">+</Text>
</TouchableOpacity>
```

---

## Accessibility Guidelines

### Touch Target Minimum
Ensure all interactive elements are **at least 44×44 points** (iOS) or **48×48 dp** (Android):

```jsx
<TouchableOpacity 
  className="p-md" // Ensures minimum 44×44 touch area
  onPress={() => handlePress()}
>
  <Text>Interactive Element</Text>
</TouchableOpacity>
```

### Focus Management
Always provide clear focus indicators for keyboard navigation:

```jsx
<TextInput
  className="focus:ring-2 focus:ring-offset-2 focus:ring-enea-primary"
  accessible={true}
  accessibilityLabel="Email address input"
/>
```

### Color Contrast
- Primary text on primary dark: **11.5:1** ✓ (WCAG AAA)
- Secondary text on primary dark: **5.2:1** ✓ (WCAG AA)
- Action color on primary dark: **5.8:1** ✓ (WCAG AA)

### Semantic HTML / Accessibility Props
```jsx
<TouchableOpacity 
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Submit form"
  accessibilityHint="Double-tap to submit the form"
  onPress={() => handleSubmit()}
>
  <Text>Submit</Text>
</TouchableOpacity>
```

---

## Animation Patterns

### Fade In
```jsx
import { Animated } from 'react-native';

const fadeAnim = new Animated.Value(0);

Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 200,
  useNativeDriver: true,
}).start();

<Animated.View style={{ opacity: fadeAnim }}>
  {/* Content */}
</Animated.View>
```

### Scale In
```jsx
const scaleAnim = new Animated.Value(0.95);

Animated.timing(scaleAnim, {
  toValue: 1,
  duration: 200,
  useNativeDriver: true,
}).start();

<Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
  {/* Content */}
</Animated.View>
```

---

## Dark Mode Implementation

All components automatically adapt to light/dark mode via CSS variables. No special handling needed — the design system tokens handle it.

To force dark mode:
```jsx
// In your app root
import { useColorScheme } from 'react-native';

const App = () => {
  const isDark = useColorScheme() === 'dark';
  
  return (
    <View className={isDark ? 'bg-enea-dark-primary' : 'bg-white'}>
      {/* App content */}
    </View>
  );
};
```

---

## Implementation Checklist

- [ ] Colors imported into theme configuration
- [ ] Font families configured in Tailwind/NativeWind
- [ ] Spacing tokens defined and accessible via class names
- [ ] Button components created and tested
- [ ] Input components with all states
- [ ] Card layouts built
- [ ] Accessibility audit passed (contrast, touch targets, keyboard navigation)
- [ ] Dark mode verified across all components
- [ ] Animation performance optimized (use native driver)
- [ ] Components documented in Storybook or similar

---

**Status**: Ready for implementation
**Last Updated**: April 2026
