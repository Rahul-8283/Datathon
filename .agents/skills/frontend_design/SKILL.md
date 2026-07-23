---
name: Frontend Design Guidelines
description: Strict design rules for the frontend, including zero border radius, premium icons, responsive design, and specific color/typography constraints.
---

# Frontend Design Guidelines

When writing or modifying frontend code for this project, you MUST strictly adhere to the following design constraints to maintain the premium, tactical "Command Center" aesthetic.

## 1. Zero Border Radius (Sharp Edges)
- **Constraint:** All UI elements must have perfectly sharp, rigid corners. No rounded edges allowed.
- **Tailwind Execution:** Actively remove any `rounded-lg`, `rounded-xl`, or `rounded-full` classes. Use `rounded-none` or simply omit rounding classes for all cards, buttons, inputs, and modals. The only exceptions are literal circular elements (like status dots or avatar circles).

## 2. Premium Iconography
- **Constraint:** Icons must look professional, technical, and minimalist. Do not use cartoonish, chunky, or "cheap" icons.
- **Execution:** Continue using `lucide-react`. Ensure a consistent stroke width (usually `1.5` or `2`). Avoid filled icons unless indicating an active state.

## 3. Responsive & Multi-View Perfection
- **Constraint:** The dashboard must be flawlessly responsive across all devices—from mobile screens to ultra-wide operations center displays.
- **Execution:**
  - Build mobile-first using Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`).
  - Ensure data-heavy elements (like the Cases Ledger or Network Graph) fail gracefully on small screens (e.g., using horizontal scrolling for tables, stacking for grids).
  - Avoid hardcoded fixed pixel widths (e.g., `w-[600px]`); prefer percentage-based or `max-w-*` constraints.

## 4. Color Palette
- **Constraint:** Strictly adhere to a deep, dark, and tactical color scheme.
- **Execution:**
  - **Base Backgrounds:** Very dark, desaturated tones (e.g., `#07110f`, `#0a0a0a`).
  - **Surface/Card Backgrounds:** Slightly lighter for contrast (`#0c211b`, `bg-white/[0.035]`).
  - **Borders:** Subtle and low-opacity (`border-white/10`, `border-white/8`) for a glassmorphic feel without heavy lines.
  - **Accents:** Use muted, tactical accent colors:
    - *Emerald/Teal* (`emerald-300`, `emerald-200`) for success, active systems, or safe zones.
    - *Gold/Amber* (`#c6a75b`, `#d8bb70`) for highlights, warnings, and priority elements.
    - *Coral/Muted Red* (`#ef7763`) for critical anomalies and high-risk alerts.
    - Never use pure, highly saturated primary colors (`#FF0000`, `#00FF00`).

## 5. Typography
- **Constraint:** Professional, crisp, and highly legible.
- **Execution:**
  - Ensure stark contrast for readability: use bright white (`text-white`) for primary headings/values, and slate/gray (`text-slate-400`, `text-slate-500`) for secondary information.
  - **Micro-Typography:** For tags, small badges, and status labels, use tiny text with heavy letter spacing (`text-[10px] font-bold uppercase tracking-widest`) to emulate specialized intelligence software.
