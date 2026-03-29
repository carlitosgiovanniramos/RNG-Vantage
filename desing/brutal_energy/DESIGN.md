# Design System Strategy: High-End Editorial Brutalism

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Kinetic Editor."** 

This system rejects the "templated" nature of the modern web in favor of a bold, high-contrast, editorial experience. It draws inspiration from Swiss Modernism and Brutalist architecture—emphasizing raw structural honesty, unapologetic scale, and a vibrant, energetic pulse. We move beyond standard grids by employing intentional asymmetry, allowing elements to overlap or bleed off the canvas, and utilizing massive typographic shifts to guide the eye. This is not just an interface; it is a digital publication that feels curated, premium, and authoritative.

---

## 2. Colors
Our palette is rooted in a high-intensity primary orange, balanced by sophisticated, architectural neutrals.

### Primary & Accent
- **Primary (#ae2900):** The lifeblood of the system. Used for high-impact brand moments and critical CTAs.
- **Primary Container (#ff7855):** A softer, luminous variation used for large-scale backgrounds or secondary action zones.

### Neutral & Surface
- **Surface (#f5f7f5):** The "off-white" paper stock of our editorial layout.
- **Surface Container Highest (#dadedb):** Used for deep, structural nesting.
- **On-Surface (#2c2f2e):** The primary charcoal for readability, maintaining a softer edge than pure black.

### The "No-Line" Rule
To maintain a high-end feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined through background color shifts. For example, a card (using `surface_container_lowest`) should sit on a background of `surface_container_low`. Let the geometry of the color blocks create the structure, not a "box."

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the `surface-container` tiers (Lowest to Highest) to create "nested" depth. Importance is defined by the shift in tone:
- **Layer 0 (Background):** `surface`
- **Layer 1 (Sub-section):** `surface_container_low`
- **Layer 2 (Content Card):** `surface_container_lowest`

### The "Glass & Gradient" Rule
To add "soul" to the Brutalist structure, use semi-transparent surfaces for floating elements (Glassmorphism) with a 20px backdrop blur. For hero sections, utilize subtle gradients transitioning from `primary` to `primary_container` to provide a sense of illumination and professional polish.

---

## 3. Typography
Typography is the primary decorative element of this system.

- **Display & Headline (Space Grotesk):** This is our "Brutalist" engine. Use `display-lg` (3.5rem) and `headline-lg` (2rem) with tight letter-spacing to create an impactful, editorial presence. These should be treated as graphic objects.
- **Title & Body (Work Sans):** To balance the technical feel of Space Grotesk, Work Sans provides a humanist, legible foundation. 
- **Label (Space Grotesk):** Used for micro-copy and metadata. The "all-caps" technical look of Space Grotesk in `label-sm` (0.6875rem) adds a sophisticated, engineered feel to the smallest details.

---

## 4. Elevation & Depth
We eschew traditional drop shadows for a more contemporary, atmospheric approach to depth.

### The Layering Principle
Depth is achieved primarily through "Tonal Layering." By stacking contrasting surface tokens, we create a soft, natural lift. A card in `surface_container_lowest` sitting on `surface_container` creates a "recessed" or "elevated" effect without a single shadow.

### Ambient Shadows
If a floating effect is required (e.g., a modal or floating action button), use **Ambient Shadows**. These are extra-diffused (32px - 64px blur) and low-opacity (4%-6%). The shadow color must be a tinted version of the `on_surface` color, never a generic gray.

### The "Ghost Border" Fallback
If a boundary is absolutely necessary for accessibility, use a **Ghost Border**: the `outline_variant` token at 15% opacity. High-contrast, 100% opaque borders are strictly forbidden.

### Glassmorphism & Depth
For overlays, use semi-transparent surface colors with a `backdrop-filter: blur(12px)`. This allows the vibrant brand orange or background imagery to bleed through, making the layout feel integrated and sophisticated rather than "pasted on."

---

## 5. Components

### Buttons
- **Primary:** Solid `primary` background with `on_primary` text. Hard edges (`radius: 0px`). Padding: `spacing-3` top/bottom, `spacing-6` left/right.
- **Secondary:** `surface_container_highest` background with `on_surface` text.
- **State Change:** On hover, primary buttons should shift to `primary_dim`.

### Cards & Lists
- **No Dividers:** Forbid the use of line dividers. Separate list items using a background shift to `surface_container_low` or vertical white space of `spacing-4`.
- **Layout:** Cards should use `surface_container_lowest`. Use bold `headline-sm` typography for card titles to maintain the editorial feel.

### Input Fields
- **Style:** Underline only or a soft `surface_variant` background. Forbid the "rectangular box" look.
- **Focus State:** Use a 2px `primary` bottom border to signal activity.

### Additional Components: "The Kinetic Marquee"
Incorporate a scrolling text marquee (using `display-sm`) for announcements or brand taglines. This introduces movement and reinforces the energetic, modern personality of the design.

---

## 6. Do's and Don'ts

### Do
- **DO** use excessive white space (e.g., `spacing-20`) to separate major editorial sections.
- **DO** allow typography to overlap image containers slightly to create a layered, "collage" effect.
- **DO** use the `primary` orange as a highlight for specific keywords within a body of text.
- **DO** maintain strict `ROUND_FOUR` (0px) corner radius across all components to ensure a sharp, professional look.

### Don't
- **DON'T** use 1px solid borders to define boxes.
- **DON'T** use standard "Material Design" drop shadows.
- **DON'T** use rounded corners on buttons or cards; it dilutes the Brutalist editorial intent.
- **DON'T** use more than three levels of typographic scale on a single screen; keep the hierarchy clear and aggressive.