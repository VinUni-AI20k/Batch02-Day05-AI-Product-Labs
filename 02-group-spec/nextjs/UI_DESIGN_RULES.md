# UI_DESIGN_RULES.md

Formal design system rules for autonomous AI agents.

No subjective language. All rules are constraints.

---

## 1. COLOR PALETTE (Strict)

### Primary Colors
| Name | Hex | Usage | Tailwind Alternative |
|------|-----|-------|----------------------|
| **Mustard Yellow** | `#FED049` | Primary background, all body areas | `bg-[#FED049]` |
| **Chili Red** | `#FF4B2B` | CTAs, accents, highlights, button fills | `bg-[#FF4B2B]` |
| **Caviar Black** | `#0C0C0C` | All text, borders, shadows | `text-[#0C0C0C]`, `border-[#0C0C0C]`, `shadow-[0_0_0_0_#0C0C0C]` |
| **Parchment Cream** | `#FAF6F0` | Card backgrounds, text containers, readability overlays | `bg-[#FAF6F0]` |

### Forbidden Colors
- ❌ No purple (#8B5CF6, #A78BFA, etc.) — common SaaS cliché
- ❌ No gradients (solid colors only)
- ❌ No white (#FFFFFF) — use Parchment Cream instead
- ❌ No gray for text — must be Caviar Black
- ❌ No light colors for borders — only Caviar Black
- ❌ No transparent backgrounds (except loading states)

### Color Usage Rules
1. **Yellow is universal background** — every major section uses #FED049 as backdrop
2. **Red is action** — every CTA button, hover state, and accent uses #FF4B2B
3. **Black is structure** — borders, text, shadows are always #0C0C0C
4. **Cream is contrast** — use only for white-background cards that need contrast against yellow

### Opacity Rules
- **Full opacity (1.0):** All primary elements
- **No partial opacity** except for loading states (assume 0.6 opacity on disabled buttons)
- **No rgba() shadows** — use flat color shadows with offsets

---

## 2. TYPOGRAPHY SYSTEM (Strict)

### Font Families
| Category | Font | Fallback | Usage |
|----------|------|----------|-------|
| **Heading 1 & 2** | Space Grotesk Bold (700) | Clash Display, system sans-serif | Main title, section headers |
| **Heading 3 & Body** | Space Mono (400) | Courier New, monospace | Numeric data, prices, distances, dish names |
| **UI Labels** | Space Mono (400) | Courier New, monospace | Button text, intent billboard, input labels |

### Font Sizing
| Element | Size | Weight | Line Height | Notes |
|---------|------|--------|-------------|-------|
| **Page Title** | 36px | 700 | 1.2 | "✨ SHOPEEFOOD AI SUGGESTER" |
| **Intent Header** | 24px | 700 | 1.2 | "💬 Ý ĐỊNH:" prefix |
| **Intent Text** | 18px | 400 | 1.4 | Auto-generated user intent |
| **Button Text** | 16px | 700 | 1 | CTA button labels |
| **Dish Name** | 20px | 700 | 1.3 | On plate cards |
| **Restaurant Name** | 14px | 400 | 1.3 | Smaller, below dish name |
| **Price/Distance/ETA** | 14px | 400 | 1.2 | Numeric data |
| **AI Reason** | 16px | 400 | 1.4 | Back of flip card |

### Spacing Rules (Line Height & Margins)
- **Headings:** 1.2 line height (tighter)
- **Body text:** 1.4 line height (more breathing room)
- **Between sections:** 24px vertical margin minimum
- **Between inline elements:** 8px horizontal gap (buttons, labels)

### Constraints
- **No letter-spacing changes** — use default
- **No font variations** besides Bold (700) and Regular (400)
- **All caps for CTAs only** — "GỎI Ý MÓN NGAY" (not lowercase)
- **No abbreviations** — "MÓN ĂN" not "MƠNN" or "MN"
- **Emoji always prefix/suffix text** — "✨ SHOPEEFOOD" not "SHOPEEFOOD✨"

---

## 3. BORDER & SHADOW SYSTEM (Strict)

### Border Rules
| Element | Width | Color | Radius |
|---------|-------|-------|--------|
| **Major containers** | 4px (`border-4`) | Caviar Black (#0C0C0C) | 0px (sharp corners) |
| **Buttons** | 4px | Caviar Black | 0px |
| **Input fields** | 4px | Caviar Black | 0px |
| **Card containers** | 4px | Caviar Black | 0px |
| **Triangle SVG outline** | 3px stroke | Caviar Black | N/A (SVG) |
| **All secondary elements** | 2px | Caviar Black | 0px |

### Shadow Rules
| State | Shadow Rule | Applied To |
|-------|------------|-----------|
| **Resting** | `shadow-[6px_6px_0px_0px_#0C0C0C]` | Buttons, containers, cards |
| **Hover (Button)** | `shadow-[2px_2px_0px_0px_#0C0C0C]` | Interactive buttons (3D press effect) |
| **Hover (Card)** | `shadow-[8px_8px_0px_0px_#0C0C0C]` | Lift effect on plates |
| **Active/Pressed** | `shadow-[0px_0px_0px_0px_#0C0C0C]` | Button fully depressed |
| **No shadows** | None | Text, inline elements, disabled items |

### Implementation
- Use Tailwind arbitrary shadows: `shadow-[6px_6px_0px_0px_#0C0C0C]`
- Never use Tailwind defaults like `shadow-lg`, `shadow-md`
- All shadows are flat offsets (no blur/spread)
- Shadows move on state change (visual feedback)

---

## 4. SPACING SYSTEM (Strict)

### Scale
All spacing uses multiples of 8px (mobile-first convention):

| Multiple | Size | Usage |
|----------|------|-------|
| 1x | 8px | Micro spacing (between text and icon) |
| 2x | 16px | Small padding, inline gaps |
| 3x | 24px | Section margins, medium gaps |
| 4x | 32px | Container padding, large gaps |
| 5x | 40px | Between major sections |
| 6x | 48px | Full-bleed spacing, max-width gutter |

### Layout Margins
- **Page margin (all sides):** 24px (3x) minimum on mobile, 32px (4x) on desktop
- **Section top/bottom:** 24px (3x) minimum
- **Between elements:** 16px (2x) minimum

### Component Padding
- **Buttons:** 16px horizontal, 12px vertical (2x / 1.5x)
- **Input fields:** 16px horizontal, 12px vertical
- **Cards:** 24px (3x) on all sides
- **Text containers:** 24px (3x) horizontal, 16px (2x) vertical

### Container Widths
- **Mobile:** Full width minus 24px margins (max ~400px)
- **Tablet:** ~600px centered
- **Desktop:** ~900px centered
- **No full-width stretching** (maintain readability)

---

## 5. INFORMATION HIERARCHY (Strict)

### Primary Information (Most Important)
- AI dish recommendation (name, image)
- Price and distance (decision factors)
- Action button (order now)

**Visual treatment:**
- Largest font (20px+)
- Brightest color (red for buttons)
- Top of card/screen
- No competing visual weight

### Secondary Information (Important)
- Restaurant name
- ETA minutes
- AI reasoning explanation

**Visual treatment:**
- Medium font (14-16px)
- Standard black text
- Below primary
- Medium visual weight

### Tertiary Information (Nice to know)
- Subtitle text
- Helper text
- Decorative icons

**Visual treatment:**
- Small font (12-14px)
- Muted treatment (still black, but often emoji-based)
- Beneath secondary
- Low visual weight

### Visual Hierarchy Rules
1. **Size hierarchy:** Increase font size = increase importance
2. **Color hierarchy:** Red > Black (red is action, black is information)
3. **Position hierarchy:** Top > Bottom, Left > Right
4. **Density hierarchy:** Whitespace around important elements
5. **Weight hierarchy:** Bold (700) > Regular (400)

### Information Density
- **Never show >5 data points per card** (overload)
- **Max 2 lines of text per section** (readability)
- **Use icons + text, not text-only** (faster scanning)
- **Align numbers right-justified** (money/distance tradition)

---

## 6. NAVIGATION & FLOW PRINCIPLES (Strict)

### Primary Flow
**Joystick Input → Recommendations → Flip Card → Order**

Rules:
1. **Single page application** — no URL changes
2. **Back button not needed** — slide animation or state toggle
3. **Always keep joystick visible** until user clicks "Get Suggestions"
4. **Results screen shows recommendations** with option to go back (one-step undo)
5. **Flip card is modal-like** (darken background? Or full-screen?) — **TBD (ambiguity)**

### Button Placement Rules
- **Primary CTA** ("Get Suggestions"): Center, below intent text, red background
- **Secondary actions** ("Change Dish", "Budget Filter"): Right-aligned, same height row
- **Back/return actions**: Top-left or slide gesture
- **Microphone**: Right side of input field (small, 32px square)

### Screen Transitions
- **Joystick → Results:** Slide up animation (300ms)
- **Results → Flip:** 3D rotate (500ms per spec)
- **Flip → Back:** Reverse 3D rotate (500ms)
- **Results → Joystick:** Slide down animation (300ms)

---

## 7. COMPONENT CONSISTENCY RULES (Strict)

### All Buttons Must Conform
```
- Border: 4px solid #0C0C0C
- Corner radius: 0px (sharp)
- Padding: 16px horizontal, 12px vertical
- Font: Space Mono Bold (700), 16px
- Text color: #0C0C0C or White (based on background)
- Background: #FF4B2B (red) for CTA, #FED049 (yellow) for secondary
- Shadow resting: shadow-[6px_6px_0px_0px_#0C0C0C]
- Shadow hover: shadow-[2px_2px_0px_0px_#0C0C0C]
- Cursor: pointer
- Disabled: Opacity 0.6, no hover effect
```

### All Input Fields Must Conform
```
- Border: 4px solid #0C0C0C
- Corner radius: 0px
- Padding: 16px horizontal, 12px vertical
- Background: #FAF6F0 (cream)
- Text color: #0C0C0C
- Font: Space Mono Regular (400), 16px
- Placeholder text: #0C0C0C at 0.6 opacity
- Focus state: Border thickness increase? Or shadow? (TBD)
```

### All Cards Must Conform
```
- Border: 4px solid #0C0C0C
- Corner radius: 0px
- Background: #FED049 (yellow) or #FAF6F0 (cream)
- Padding: 24px
- Shadow: shadow-[6px_6px_0px_0px_#0C0C0C]
- Hover shadow: shadow-[8px_8px_0px_0px_#0C0C0C]
- Max width: ~300px (plate card)
- Min height: ~350px (with image)
```

---

## 8. MOBILE-FIRST RULES (Strict)

### Viewport Breakpoints
- **Mobile:** <600px width (default target)
- **Tablet:** 600px - 1000px (adjusted layout)
- **Desktop:** >1000px (full luxury layout)

### Mobile Constraints
- **Full-width usage** minus 24px margins
- **Touch target minimum:** 44x44px (all buttons)
- **Spacing increases:** Use 3x (24px) minimum between interactive elements
- **Font sizes stay same** (no reduction on mobile) for readability
- **Images scale proportionally** via CSS `max-width: 100%`
- **Horizontal scroll only for plate carousel** (if 3 plates don't fit)

### Mobile Interaction
- **Joystick:** Drag via touch events (pointer events cover both)
- **Buttons:** Large target area (no small buttons)
- **Input:** Full-width field, thumb-friendly
- **Microphone:** Easy tap target, clear visual feedback

### Responsive Patterns
```
Mobile (400px):
- Single column layout
- Full-width containers
- Vertical stacking

Tablet (600px+):
- Center alignment with max-width
- Horizontal spacing increases
- Cards arranged in rows

Desktop (1000px+):
- Max-width ~900px
- Generous side margins
- Multi-column grids (if needed)
```

---

## 9. ACCESSIBILITY RULES (Best Effort)

### Color Contrast
- **Text on yellow:** Black text (1.0) on Mustard Yellow (contrast ratio ~9.5:1) ✓ WCAG AAA
- **Text on red:** White or black? (Red #FF4B2B is medium saturation; test both)
- **Text on cream:** Black text on Parchment Cream ✓ WCAG AA
- **Inverse: yellow text on black:** OK (contrast sufficient)

### Keyboard Accessibility (Best Effort)
- Tab order: Joystick area → Text input → Mic button → Main CTA → Back button
- Enter key submits form/recommendations
- Escape closes flip card or returns to joystick
- Focus indicators: Visible outline on all focusable elements

### ARIA Labels (If Implemented)
- `aria-label="Drag emoji to express food preference (hot, cheap, near)"`
- `aria-label="Dish recommendation 1 of 3"`
- `aria-live="polite"` on intent text (announce changes)
- `aria-pressed` on toggle buttons (if any)

### Screen Reader Considerations
- **Intent text announcement:** Use `aria-live` to announce "Intent updated to: ..."
- **Plate cards:** Provide alt text for images
- **Flip animation:** Announce "Card flipped, showing AI reasoning"
- **Error messages:** Use `role="alert"` for speech API errors

### Warnings (Brutalism vs WCAG)
⚠️ **Neo-Brutalism aesthetic may conflict with WCAG AA in areas:**
- High contrast borders (good)
- All-caps text (harder to read for dyslexic users)
- Flat design (no visual distinction beyond color)
- No rounded corners (less forgiving for imprecise touch)

**Recommendation:** Test with real users; prioritize functionality over strict WCAG compliance if conflict arises.

---

## 10. DESIGN SYSTEM ANTI-PATTERNS (Prohibited)

| Anti-Pattern | Why It's Wrong | What to Do Instead |
|--------------|----------------|-------------------|
| Soft shadows (blur) | Contradicts Brutalism | Use flat offset shadows |
| Rounded corners | Too modern SaaS | Keep 0px radius |
| Color gradients | Cliché, not Brutalism | Solid colors only |
| Transparency/opacity | Weakens contrast | Use solid colors + opacity changes on state |
| Inter font | Generic SaaS default | Use Space Grotesk or Space Mono |
| Multiple font sizes | Hierarchy unclear | Use defined scale (12, 14, 16, 18, 20, 24, 36px) |
| Purple colors | SaaS cliché | Use yellow, red, black, cream only |
| Curved borders | Soft aesthetics | Sharp 0px corners |
| Drop shadows (blur) | Not Brutalist | Flat color offset shadows |
| Subtle animations | Imperceptible | Clear 300-500ms transitions |
| Floating buttons | Looks dated | Anchored to grid/layout |
| Emoji without text | Unclear meaning | Pair with label: "✨ GET SUGGESTIONS" |
| Right-aligned text (left in Vietnamese) | Harder to scan | Left-align body text |
| Nested containers | Visual confusion | Flat, clear visual hierarchy |
| Truncated text without ellipsis | Broken layout | Use `text-ellipsis overflow-hidden` |

---

## 11. DYNAMIC STATE STYLING (Strict)

### Button States
```
1. Resting
   - Background: #FF4B2B
   - Text: #FFFFFF (or black if needed)
   - Border: 4px #0C0C0C
   - Shadow: shadow-[6px_6px_0px_0px_#0C0C0C]

2. Hover
   - Background: #FF4B2B (same)
   - Shadow: shadow-[2px_2px_0px_0px_#0C0C0C] (shrink shadow = "press" effect)
   - Cursor: pointer
   - No color change (maintain visual consistency)

3. Active/Clicked
   - Shadow: shadow-[0px_0px_0px_0px_#0C0C0C] (no shadow = fully pressed)
   - Background: Maybe slightly darker? (TBD, use red as-is for simplicity)

4. Disabled
   - Opacity: 0.6
   - Background: #FF4B2B (faded)
   - Cursor: not-allowed
   - Shadow: None
   - Text: Same color (just faded)
```

### Input Focus State
```
- Border: Remains 4px #0C0C0C
- Background: #FAF6F0 (unchanged)
- Outline: Add focus ring? (TBD)
- Shadow: Optional, no change from resting
- Cursor: text
```

### Card Hover State
```
- Background: Unchanged
- Shadow: shadow-[8px_8px_0px_0px_#0C0C0C] (expand shadow = "lift" effect)
- Border: No change
- Cursor: pointer (clickable)
```

### Plate Card Flip State
```
- Rotation: 0deg (front) → 180deg Y-axis (back)
- Duration: 500ms
- Timing: ease-in-out
- Preserve-3d: Must be applied to parent
- Perspective: perspective-[1000px] on container
```

---

## 12. CONTENT & COPYWRITING RULES (Strict)

### Tone & Voice
- **Urgent:** "NGAY", "LIỀN", "LẬP TỨC" (immediate actions)
- **Directness:** "BẠN MUỐN ĂN GÌ?" (not "Tell us your preference")
- **Casualness:** "CHỐT MÓN NÀY" (not "Proceed to checkout")
- **Confidence:** "AI ĐÃ CHỌN CHO BẠN" (not "We suggest")

### Text Length Constraints
| Element | Max Length | Notes |
|---------|-----------|-------|
| Button label | 30 chars | "✨ GỎI Ý MÓN NGAY CHO TÔI" |
| Intent text | 100 chars | Auto-generated, concise |
| Dish name | 40 chars | "Phở Bò Tái Nạm Nước Lèo" |
| Restaurant name | 50 chars | "Phở Lý Quốc Sư" |
| AI reason | 150 chars | "PHÒ NÓNG BỎNG TAY: Đạt điểm tối đa..." |
| Input field placeholder | 50 chars | "Hoặc gõ chi tiết khẩu vị của bạn..." |

### Punctuation Rules
- Use all-caps for action labels (buttons, CTA text)
- Use emoji liberally (🔥, 💸, ⚡, ✨, etc.)
- Use colons to separate sections: "💬 Ý ĐỊNH: [text]"
- Use brackets for system messages: "[ TẠI SAO AI CHỌN? ]"
- Vietnamese punctuation standard (no changes for Brutalism)

---

## END OF DESIGN RULES

These rules are the source of truth for visual and interactive consistency.

**All UI implementation must pass against these constraints.**

Ambiguities are marked with **(TBD)** — resolve before coding.
