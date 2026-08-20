---
name: Simcc Intelligence
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#3f484c'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#6f787d'
  outline-variant: '#bfc8cc'
  surface-tint: '#07677e'
  primary: '#07677e'
  on-primary: '#ffffff'
  primary-container: '#559fb8'
  on-primary-container: '#003340'
  inverse-primary: '#88d1eb'
  secondary: '#37637d'
  on-secondary: '#ffffff'
  secondary-container: '#b4e0fe'
  on-secondary-container: '#38647e'
  tertiary: '#2b657c'
  on-tertiary: '#ffffff'
  tertiary-container: '#679db6'
  on-tertiary-container: '#003343'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b6eaff'
  primary-fixed-dim: '#88d1eb'
  on-primary-fixed: '#001f28'
  on-primary-fixed-variant: '#004e60'
  secondary-fixed: '#c6e7ff'
  secondary-fixed-dim: '#a0ccea'
  on-secondary-fixed: '#001e2d'
  on-secondary-fixed-variant: '#1c4b64'
  tertiary-fixed: '#bde9ff'
  tertiary-fixed-dim: '#98cee8'
  on-tertiary-fixed: '#001f2a'
  on-tertiary-fixed-variant: '#084d63'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
  navy-deep: '#024A60'
  steel-blue: '#719CB8'
  success-emerald: '#10b981'
  surface-white: '#ffffff'
  ink-black: '#0a0a0a'
typography:
  display:
    fontFamily: Lexend
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Lexend
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-md:
    fontFamily: Lexend
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  body-lg:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-tabular:
    fontFamily: Ubuntu
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Lexend
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Lexend
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  max-width: 1280px
---

## Brand & Style

The design system is engineered for a research mapping and scientific observatory ecosystem. Its core mission is to **"Explore dados integrados sobre produção científica, pesquisadores, instituições e inovações no estado da Bahia, apresentados com clareza e precisão."** 

The brand personality is **academic, analytical, and high-precision**, signaling institutional authority in handling complex metadata while remaining accessible for collaborative exploration. The visual direction follows a **Corporate / Modern** aesthetic with a heavy emphasis on **Information Architecture**. It prioritizes data density and technical legibility. The layout balances clean margins with a cold, professional palette of blues and grays, using strategic whitespace to organize indicators, patents, and bibliographies into a coherent knowledge map.

## Colors & Gradients

The chromatic strategy is anchored in **Principal Interactive Blue** (#559FB8), serving as the primary visual driver for active states, primary buttons, and core UI highlights. **Deep Navy** (#024A60) provides institutional weight, used for headers, sidebars, and hover states to denote depth and authority.

To provide dynamic breaks and draw attention to key elements, a **Strong Blue to Red Gradient** (e.g., Tailwind's `from-blue-700 to-red-600`) is strategically used. This strong blue (#1D4ED8) paired with a bold red (#DC2626) break adds a striking contrast that energizes the UI without abandoning its professional academic roots. It is particularly applied to highlight important regional or thematic keywords, such as "Bahia".

**Steel Blue** (#719CB8) acts as a secondary structural color, specifically reserved for content grouping and the signature left-border accent on researcher profiles. The neutral palette uses high-contrast whites for reading surfaces and subtle grays for background containment, ensuring technical data remains the focal point without visual fatigue.

## Typography

This system utilizes **Lexend** as its primary typeface. Its geometric construction and optimized character spacing are specifically chosen to reduce visual fatigue during dense readings of academic abstracts and technical reports. 

For technical data, tabular views, and specific dashboard metrics, **Ubuntu** is employed as a secondary font. Its distinct character shapes provide better clarity for alphanumeric strings and quantitative data. Hierarchy is strictly enforced through weight and scale, with semibold headings anchoring the page sections against regular-weight body text.

## Layout & Spacing

The design adopts an **Adaptive Grid** philosophy designed to support data-heavy dashboards and complex tables.

- **Desktop:** 12-column grid with a 1280px max-width, 24px gutters, and 64px external margins for a focused, institutional feel.
- **Tablet:** 8-column fluid grid with 16px gutters.
- **Mobile:** Single-column layout with 16px side margins to maximize reading real estate.

Spacing follows a 4px base unit. Vertical organization is paramount; elements are grouped in logical containers with consistent padding to maintain a rhythmic flow of information.

## Elevation & Depth

Visual hierarchy is managed through **Tonal Layers** and subtle **Ambient Shadows**, avoiding visual noise in information-dense environments.

- **Level 0 (Base):** Subtle gray background (#f9fafb) for the main canvas.
- **Level 1 (Surface):** Primary content cards and containers use a white background (#ffffff) with a 1px low-contrast outline (#e5e7eb).
- **Level 2 (Elevated):** Hover states and active search bars utilize soft, diffused shadows (Blur 8px, 4% Opacity) to suggest interactivity without breaking the flat professional aesthetic.
- **Level 3 (Overlay):** Modals and dropdown menus use more defined shadows to separate temporary UI layers from the data grid.

## Shapes

The shape language is functional and disciplined, using rounded corners to soften the technical grid without appearing overly casual.

- **Interactive Elements:** Buttons and Input fields use **8px (rounded-md)** to provide a modern, tactile feel.
- **Structural Containers:** Content cards and dashboard panels use **12px (rounded-lg)** to create clear visual groupings.
- **Metadata Tags:** Badges and specialization chips use **Pill-shaped (rounded-full)** styling to distinguish them from actionable buttons or navigation links.

## Components

### Buttons
Primary buttons are filled with Principal Blue (#559FB8) with white text. Hover states transition to Deep Navy (#024A60). All buttons feature 8px rounded corners and center-aligned text in Lexend Semibold.

### Search Bars
Central to the platform, search bars feature a height of 48px, 8px rounded corners, and a 1px gray outline. A search icon is persistently placed on the left. Upon focus, the outline transitions to Principal Blue.

### Researcher Cards
The central interface component. Cards feature a white background, 12px roundedness, and a soft elevation. Crucially, they include a **4px vertical border on the left side** in Steel Blue (#719CB8). Information is organized vertically: Name (Headline-md), Academic Line (Body-sm), and Specialization Chips (Pill-shaped) at the bottom.

### Inputs & Fields
Inputs maintain an 8px radius and a 40px standard height. Labels are positioned externally above the field in Label-md weight. 

### Highlights & Hero Elements
Text highlights in the hero section utilize the **Strong Blue to Red Gradient** (`bg-gradient-to-r from-blue-700 to-red-600`) with transparent text clip to create dynamic focal points on critical words without disrupting the layout.

### Indicators & Badges
Numerical indicators (e.g., publication counts) use a light Steel Blue background with Deep Navy text to ensure high legibility within the data grid. 
Special thematic badges (e.g., "CT&I" highlights) feature a strong blue background with white text, complemented by a **bottom border break in red** (`border-b-[3px] border-red-600`) to provide sharp, energetic contrast while maintaining a structured pill shape.
