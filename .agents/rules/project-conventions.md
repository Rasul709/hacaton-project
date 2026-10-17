---
description: Coding standards and conventions for HR-Digital workspace
trigger: always_on
---

# HR-Digital Development Standards

1. **Strict TypeScript & React 19:**
   - Use strict type annotations everywhere. Avoid `any`.
   - Use standard React hooks and functional components.
   - For UI layout components, maintain responsiveness across desktop (1920x1080), laptop (1366x768), and tablet/mobile screens.

2. **Styling & Design System:**
   - Use Tailwind CSS v4 utility classes.
   - Brand Colors:
     - Header/Brand Deep Navy: `#101828`
     - Dark Sidebar: `#111827`
     - Primary Corporate Blue: `#2563EB`
     - Canvas Background: `#F5F7FB`
     - Neutral Cards: `#FFFFFF` with borders `border-slate-200`
   - Always provide accessible labels, focus rings, and proper keyboard navigation (Esc to close modals, Ctrl+K for search).

3. **Data Layer & Fallback:**
   - All API queries and mutations must go through TanStack Query hooks.
   - In demo mode, changes must reliably synchronize to `localStorage` via `MockService`.
   - Never break demo mode when developing new views.
