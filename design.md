# Ultimate Apple Design System

This document defines the core principles and tokens to achieve a true, ultra-premium Apple aesthetic for **Sistema EDO Chelabs v2**.

## 1. Core Principles
- **Clarity:** Every element must be legible. No invisible buttons or overlapping text.
- **Deference:** The UI recedes, content takes center stage.
- **Depth:** Use layers, shadows, and translucency (`glassmorphism`) to create a sense of space.
- **Precision:** Perfect alignments, consistent corner radii (Squircle), and refined typography.

## 2. Typography (The "SF" Look)
We will use **SF Pro Display** (or Inter as high-quality fallback) with specific characteristics:
- **Tracking:** `-0.02em` for headers, `-0.01em` for body.
- **Line Height:** `1.1` for headers, `1.5` for body.
- **Contrast:** Pure black `#1d1d1f` or dark gray `#86868b` for hierarchy.

## 3. Color Science & Dark Mode
| Layer | Light Mode | Dark Mode |
| :--- | :--- | :--- |
| **System Background** | `#fbfbfd` | `#000000` |
| **Elevated Card** | `rgba(255, 255, 255, 0.7)` | `rgba(28, 28, 30, 0.7)` |
| **Primary Blue** | `#0071e3` | `#0077ed` |
| **Text Primary** | `#1d1d1f` | `#f5f5f7` |
| **Text Secondary** | `#86868b` | `#a1a1a6` |

## 4. Components Checklist
- [ ] **Buttons:** No more invisible text. High contrast labels + subtle inner glow.
- [ ] **Cards:** `32px` corner radius (True Squircle). Border of `1px` with low opacity.
- [ ] **Glassmorphism:** `backdrop-blur-xl` is mandatory for floating elements.
- [ ] **Icons:** Lucide icons set to `1.5` stroke width, always balanced with text weight.

## 5. Visual Bug Fixes (Identified)
- **Hero Title:** Remove the gray shadow text causing the "blurry/overlapping" look.
- **CTA Buttons:** Ensure `white text` only appears on `high contrast background` (Blue/Black).
- **Navigation:** Add more structure and refined transitions.
- **Spacing:** Standardize on an 8px grid (8, 16, 24, 32, 48, 64).
