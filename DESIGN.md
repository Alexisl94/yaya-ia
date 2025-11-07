# 🎨 Design System - yaya.ia

Documentation complète du design system et de la direction artistique de yaya.ia.

## 📐 Direction Artistique

### Identité Visuelle

**Style:** Moderne, épuré, professionnel mais chaleureux

**Références d'inspiration:**
- **Linear** - Interfaces clean et efficaces
- **Notion** - Accessibilité et clarté
- **Vercel** - Minimalisme moderne

**Valeurs transmises:**
- 🎯 **Fiabilité** - Design solide et cohérent
- ✨ **Simplicité** - Interfaces intuitives
- 🚀 **Innovation** - Technologies modernes
- 🤝 **Accessibilité** - Pour tous les utilisateurs

## 🎨 Palette de Couleurs

### Couleurs Principales

#### Primary (Sky Blue)
Couleur de marque principale, utilisée pour les CTAs et éléments interactifs.

```css
--primary-50: #f0f9ff
--primary-100: #e0f2fe
--primary-200: #bae6fd
--primary-300: #7dd3fc
--primary-400: #38bdf8
--primary-500: #0ea5e9  /* Brand color */
--primary-600: #0284c7
--primary-700: #0369a1
--primary-800: #075985
--primary-900: #0c4a6e
```

**Usage:**
- Boutons primaires
- Links actifs
- Bordures d'éléments sélectionnés
- Indicateurs de statut actif

#### Secondary (Violet)
Couleur d'accent, utilisée pour les éléments secondaires et badges.

```css
--secondary-50: #faf5ff
--secondary-100: #f3e8ff
--secondary-200: #e9d5ff
--secondary-300: #d8b4fe
--secondary-400: #c084fc
--secondary-500: #8b5cf6  /* Accent color */
--secondary-600: #7c3aed
--secondary-700: #6d28d9
--secondary-800: #5b21b6
--secondary-900: #4c1d95
```

**Usage:**
- Badges
- Tags
- Éléments secondaires
- Gradients d'accent

### Couleurs Sémantiques

#### Success (Green)
```css
--success: #10b981
--success-light: #34d399
--success-dark: #059669
```

**Usage:** Messages de succès, confirmations, statuts positifs

#### Warning (Orange)
```css
--warning: #f59e0b
--warning-light: #fbbf24
--warning-dark: #d97706
```

**Usage:** Alertes, avertissements, actions à confirmer

#### Danger (Red)
```css
--danger: #ef4444
--danger-light: #f87171
--danger-dark: #dc2626
```

**Usage:** Erreurs, suppressions, actions critiques

### Couleurs Neutres

```css
--background: #ffffff
--foreground: #0f172a
--muted: #f8fafc
--muted-foreground: #64748b
--border: #e2e8f0
--input: #e2e8f0
```

## 📝 Typographie

### Font Family

**Primary:** Inter (Google Fonts)
- Display: swap
- Subsets: latin
- Usage: Tout le texte de l'application

**Code:** Geist Mono
- Usage: Code snippets, exemples techniques

### Hiérarchie

```css
h1: text-4xl md:text-5xl font-bold tracking-tight
h2: text-3xl md:text-4xl font-semibold tracking-tight
h3: text-2xl md:text-3xl font-semibold
h4: text-xl font-semibold
p: text-base leading-relaxed
```

### Tailles de Texte

```
xs:  12px / 0.75rem   - Metadata, helpers
sm:  14px / 0.875rem  - Secondary text
base: 16px / 1rem     - Body text
lg:  18px / 1.125rem  - Large body
xl:  20px / 1.25rem   - Headings
2xl: 24px / 1.5rem    - Section titles
```

## 🔲 Espacements & Layout

### Border Radius

```css
sm: 6px   - Inputs, petits éléments
md: 8px   - Buttons
lg: 12px  - Cards
xl: 16px  - Modals
2xl: 24px - Messages, grandes cards
```

### Spacing Scale

```
0.5: 2px
1:   4px
2:   8px
3:   12px
4:   16px
5:   20px
6:   24px
8:   32px
10:  40px
12:  48px
```

### Shadows

```css
card: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.1)
card-hover: 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1)
card-lg: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.1)
```

## 🎭 Composants

### Buttons

#### Primary
```tsx
<Button className="gradient-primary shadow-md hover:shadow-lg">
  Action Principale
</Button>
```
- Background: Gradient primary
- Text: White
- Shadow: Medium → Large on hover
- Border radius: md (8px)

#### Secondary
```tsx
<Button variant="secondary">
  Action Secondaire
</Button>
```
- Background: Muted
- Text: Foreground
- Border: 1px solid border

#### Ghost
```tsx
<Button variant="ghost">
  Action Tertiaire
</Button>
```
- Background: Transparent → Accent on hover
- Text: Foreground

### Cards

#### Standard Card
```tsx
<div className="card-elevated rounded-xl border bg-card p-6">
  {/* Content */}
</div>
```

#### Interactive Card
```tsx
<Card className="card-elevated hover:border-primary-500 hover:-translate-y-0.5 transition-all cursor-pointer">
  {/* Content */}
</Card>
```

### Messages

#### User Message
- Alignment: Right
- Background: Primary gradient
- Text: White
- Border radius: 2xl (24px)
- Avatar: Primary colors

#### Assistant Message
- Alignment: Left
- Background: Card with border
- Text: Foreground
- Border radius: 2xl (24px)
- Avatar: Secondary colors
- Copy button on hover

### Input Fields

```tsx
<Textarea
  className="rounded-2xl border-2 focus:border-primary-500 transition-colors"
  placeholder="Votre message..."
/>
```

- Border: 2px solid border
- Focus: Primary-500
- Border radius: 2xl (24px)
- Transition: All 200ms

## 🎬 Animations

### Keyframes

```css
fadeIn: opacity 0 → 1 (200ms ease-in)
slideUp: translateY(10px) + opacity (300ms ease-out)
slideDown: translateY(-10px) + opacity (300ms ease-out)
scaleIn: scale(0.95) + opacity (200ms ease-out)
```

### Usage

```tsx
// Fade in content
<div className="animate-fade-in">

// Slide up on mount
<div className="animate-slide-up">

// Scale in modal
<Dialog className="animate-scale-in">
```

### Micro-interactions

- **Hover states:** Transform, shadow, border color
- **Active states:** Scale(0.98) sur buttons
- **Loading:** Pulse, spin, bounce
- **Transitions:** 200-300ms ease-out

## 🎯 Patterns UI

### Empty States

**Structure:**
1. Icon avec gradient background (16x16)
2. Titre principal (h3)
3. Description (text-muted-foreground)
4. CTA ou suggestions

**Style:**
- Centré verticalement et horizontalement
- Animation: fade-in ou scale-in
- Icons: 2-3 suggestions interactives

### Loading States

**Skeleton:**
```tsx
<Skeleton className="h-4 w-full" />
<Skeleton className="h-4 w-3/4" />
```

**Typing Indicator:**
- 3 dots animés avec bounce
- Delay: -0.3s, -0.15s, 0s
- Dans message bubble style

**Spinner:**
- Border animation
- Primary color
- 3 sizes: sm (16px), md (24px), lg (32px)

### Error States

```tsx
<div className="bg-danger-50 border border-danger-200 rounded-xl p-4">
  <div className="text-danger-700">
    Message d'erreur
  </div>
</div>
```

## ✨ Gradients

### Primary Gradient
```css
.gradient-primary {
  background: linear-gradient(to right, #0ea5e9, #0284c7);
}
```

**Usage:** Buttons primaires, badges importants, headers

### Secondary Gradient
```css
.gradient-secondary {
  background: linear-gradient(to right, #8b5cf6, #7c3aed);
}
```

**Usage:** Accents, éléments secondaires

### Text Gradient
```css
.text-gradient-primary {
  background: linear-gradient(to right, #0ea5e9, #0284c7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

**Usage:** Titres importants, logos

## 📱 Responsive

### Breakpoints

```css
sm: 640px   - Mobile landscape
md: 768px   - Tablet
lg: 1024px  - Desktop
xl: 1280px  - Large desktop
2xl: 1536px - Extra large
```

### Mobile-First Approach

```tsx
// Default: mobile
<div className="text-sm">
// md: tablet et +
<div className="text-sm md:text-base">
// lg: desktop et +
<div className="text-sm md:text-base lg:text-lg">
```

### Sidebar Behavior

- **Mobile (< md):** Collapsible avec overlay
- **Desktop (≥ md):** Fixe, toujours visible

## ♿ Accessibilité

### Contraste

Tous les textes respectent WCAG AA:
- Normal text: 4.5:1
- Large text: 3:1
- UI components: 3:1

### Focus States

```css
.focus-ring {
  focus:outline-none
  focus:ring-2
  focus:ring-primary-500
  focus:ring-offset-2
}
```

### Keyboard Navigation

- Tab order logique
- Focus visible sur tous les éléments interactifs
- Shortcuts clavier documentés (Entrée, Shift+Entrée)

## 🚫 Dos & Don'ts

### ✅ Do

- Utiliser les couleurs primary/secondary selon leur rôle
- Respecter la hiérarchie typographique
- Ajouter des animations subtiles (200-300ms)
- Utiliser les gradients sur les éléments d'action
- Tester le contraste des couleurs
- Espacer généreusement les éléments
- Utiliser les empty states engageants

### ❌ Don't

- Mélanger plusieurs gradients sur la même vue
- Utiliser des animations > 500ms
- Négliger les états hover/focus/active
- Oublier les loading states
- Utiliser du texte < 12px
- Surcharger visuellement les interfaces
- Oublier les empty states

## 🛠️ Outils & Resources

### Figma (à créer)
- Design system complet
- Composants réutilisables
- Prototypes interactifs

### Code

```bash
# Installer un composant shadcn
npx shadcn@latest add [component]

# Tester l'accessibilité
npm run lighthouse

# Vérifier les couleurs
npm run check-contrast
```

### Extensions VSCode Recommandées

- Tailwind CSS IntelliSense
- Color Highlight
- SVG Preview
- Prettier

## 📚 Références

- [Tailwind CSS Docs](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)
- [OKLCH Color](https://oklch.com)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Maintenu par:** Équipe yaya.ia
**Dernière mise à jour:** 2025-01-07
**Version:** 1.0.0

