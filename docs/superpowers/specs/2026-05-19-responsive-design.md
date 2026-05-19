# BuildRight Responsive & Quick Estimate Dropdown Fix - Design Spec

## Summary
- Make the UI responsive across small phones (~360px), large phones (~430px), tablets (~768px), and desktops.
- Introduce a hamburger + slide-down drawer navigation on mobile.
- Fix the missing dropdown arrow in the Quick Estimate service selector.

## Goals
- Preserve the current industrial brand feel while making layout adjustments for smaller screens.
- Maintain usability for navigation, forms, and data tables on phones and tablets.
- Fix the Quick Estimate select arrow visibility consistently across browsers.

## Non-Goals
- No new features beyond responsive layout and the dropdown arrow fix.
- No copy changes beyond what is needed for layout.
- No backend or data model changes.

## Responsive Strategy

### Breakpoints
- 360px: Very small phones (legacy / compact devices).
- 430px: Large phones.
- 768px: Tablets.
- 1024px: Small laptops.
- 1280px+: Desktop standard.

### Header & Navigation
- Desktop: keep current header with inline nav.
- <= 900px: hide inline nav, show hamburger button.
- Drawer opens below header and lists nav items + auth buttons.
- Drawer overlays with a subtle background to keep focus.

### Layout & Grids
- Services / Engineers / WhyUs grids collapse to 1 column at <= 430px.
- Shift to 2 columns at tablet widths.
- Maintain current layout at desktop.

### Hero Section
- Reduce padding on small screens.
- Keep hero text readable with clamp-based sizing.
- Hide Quick Estimate card below tablet (already hidden at <= 1000px).

### Booking Form
- Steps stack and wrap on small screens.
- Buttons stack full-width on <= 430px.
- Reduce padding and gaps to fit without horizontal scroll.

### Admin Tables
- Add horizontal scroll on small screens.
- Keep headers readable and avoid overflow.

## Quick Estimate Dropdown Arrow Fix
- Apply consistent `appearance: none` on select.
- Add custom arrow icon via CSS background SVG.
- Add right padding so arrow does not overlap text.
- Ensure arrow is visible on dark background.

## Files In Scope
- `src/components/Header.tsx`
- `src/components/Header.module.css`
- `src/components/Hero.module.css`
- `src/components/ServiceCards.module.css`
- `src/components/EngineerGrid.module.css`
- `src/components/WhyUs.module.css`
- `src/components/BookingForm.module.css`
- `src/components/AdminDashboard.module.css`
- `src/components/Topbar.module.css`
- `src/components/UserBar.module.css`
- `src/app/globals.css`

## Risks & Mitigations
- Risk: Header drawer overlaps content on short screens.
  - Mitigation: Use max-height with scroll and safe padding.
- Risk: Tables overflow awkwardly on mobile.
  - Mitigation: Wrap in horizontal scroll container with min-width.

## Acceptance Criteria
- Navigation is accessible on phones via hamburger menu.
- No horizontal scrolling on primary pages except data tables.
- Booking form steps and buttons remain usable on phones.
- Quick Estimate dropdown arrow is visible on all browsers.
