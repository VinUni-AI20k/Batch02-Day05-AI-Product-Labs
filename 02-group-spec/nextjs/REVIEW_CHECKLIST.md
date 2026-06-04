# REVIEW_CHECKLIST.md

Post-implementation review checklist that AI agents must execute before submission.

Do not proceed without satisfying all items in each category.

---

## 1. PRODUCT ALIGNMENT REVIEW

### Requirements Traceability
- [ ] Joystick triangle renders with exact dimensions and labels ("🔥 NÓNG SỐT", "💸 SIÊU RẺ", "⚡ ĂN LIỀN")
- [ ] Dragging emoji updates coordinates in real-time (no latency)
- [ ] Coordinates normalize to [0.0, 1.0] range
- [ ] Intent text auto-generates from coordinates
- [ ] Text input accepts user supplementary preferences
- [ ] Voice input button captures speech (vi-VN) and appends transcript
- [ ] "Get Suggestions" button triggers API call
- [ ] Mock API returns exactly 3 recommendations within 1.2 seconds
- [ ] Each recommendation displays: image, dish name, restaurant name, price, distance, ETA
- [ ] Clicking plate flips card with 3D animation
- [ ] Back face shows "TẠI SAO AI CHỌN" title, AI reasoning, red CTA button
- [ ] Red CTA button navigates to ordering flow (external)
- [ ] Back button returns to joystick screen
- [ ] No required features are missing

### User Flow Validation
- [ ] Happy path flows end-to-end without errors:
  1. Open app → See joystick
  2. Drag joystick → Intent text updates
  3. Click "Get Suggestions" → See 3 plates in 1.2s
  4. Click plate → Flip animation → See AI reasoning
  5. Click "Order" button → Redirected to external site
- [ ] Voice input path works: Click mic → Speak → Transcript added to text
- [ ] Joystick adjustment path works: Get results → Back → Adjust joystick → Get new results
- [ ] All user flows complete in <30 seconds (or <45 seconds with voice)

### Specification Compliance
- [ ] No unspecified features added (scope creep)
- [ ] All mockup elements present in final UI
- [ ] No features mentioned in spec are missing
- [ ] Implementation matches provided mockups visually

---

## 2. UX REVIEW

### Cognitive Load Assessment
- [ ] User never needs to read >3 lines of text to proceed
- [ ] All primary actions (joystick drag, button click, plate flip) are <2 seconds to complete
- [ ] No modal dialogs blocking main flow
- [ ] No required scrolling on mobile viewport
- [ ] Decision tree is linear: joystick → suggestions → order (no branching)

### Feedback & Affordances
- [ ] Joystick provides visual feedback when dragged (emoji moves smoothly)
- [ ] Intent text updates visibly in <100ms
- [ ] "Get Suggestions" button shows loading state ("⏳ AI ĐANG SUY NGHĨ...")
- [ ] Button shadow changes on hover (physical press feedback)
- [ ] Microphone button indicates listening state (red background, pulse animation)
- [ ] Plate flip animation is smooth and clear (3D perspective visible)
- [ ] Error states are clearly visible with readable messages

### Mobile Experience
- [ ] Touch events work for all interactions (joystick drag, button clicks)
- [ ] Button tap targets are >44x44px (easy to hit)
- [ ] Text input is full-width and accessible
- [ ] Microphone button is positioned logically (right edge of input)
- [ ] Plates are scrollable horizontally or stacked vertically (readable)
- [ ] No horizontal scroll required for main content
- [ ] Viewport doesn't zoom when interacting (no 300ms tap delay)

### Accessibility (Best Effort)
- [ ] Tab order is logical: Joystick area → Text input → Mic button → Submit button → Back button
- [ ] Focus indicators are visible on all interactive elements
- [ ] Button labels are descriptive (not just "Click me")
- [ ] Images have alt text (dish name + restaurant)
- [ ] Color contrast passes basic checks (yellow text on black ok, red on black ok)
- [ ] Keyboard users can complete primary flow with Tab + Enter
- [ ] No keyboard traps (can always Tab away)

---

## 3. DESIGN SYSTEM REVIEW

### Color Integrity
- [ ] Mustard Yellow (#FED049) used only for backgrounds
- [ ] Chili Red (#FF4B2B) used only for CTAs and hover states
- [ ] Caviar Black (#0C0C0C) used for all text and borders
- [ ] Parchment Cream (#FAF6F0) used for card backgrounds (optional)
- [ ] No white (#FFFFFF) used anywhere
- [ ] No purple colors anywhere
- [ ] No gradients present
- [ ] No other colors introduced

### Typography Compliance
- [ ] Headings use Space Grotesk or Clash Display (Bold 700)
- [ ] Body text uses Space Mono (Regular 400)
- [ ] Numeric data (price, distance) is Space Mono (Regular 400)
- [ ] All-caps used only for CTA text
- [ ] Font sizes follow specified scale: 12, 14, 16, 18, 20, 24, 36px
- [ ] No custom font weights (only 400 and 700)
- [ ] No letter-spacing changes
- [ ] Emoji prefix or suffix labels (e.g., "✨ GET SUGGESTIONS")

### Border & Shadow Rules
- [ ] All major containers use `border-4` thick black
- [ ] All borders are Caviar Black (#0C0C0C)
- [ ] All corners are sharp (0px radius) — no rounded corners
- [ ] Resting shadow: `shadow-[6px_6px_0px_0px_#0C0C0C]` (offset, no blur)
- [ ] Hover shadow: `shadow-[2px_2px_0px_0px_#0C0C0C]` (shrunk for press effect)
- [ ] Active shadow: `shadow-[0px_0px_0px_0px_#0C0C0C]` (no shadow when fully pressed)
- [ ] All shadows are flat offsets (no blur, no spread)
- [ ] No drop shadows (blurred shadows)

### Spacing & Layout
- [ ] Page margins: 24px (3x) minimum on all sides
- [ ] Section gaps: 24px (3x) or more between major sections
- [ ] Component padding: 16-24px (consistent throughout)
- [ ] All spacing is multiple of 8px (mobile-first scale)
- [ ] No inconsistent whitespace
- [ ] Center alignment on desktop (max-width constraint)
- [ ] Full-width on mobile (minus margins)

### Visual Hierarchy
- [ ] Most important element (dish recommendation) is largest and prominently placed
- [ ] Price and distance are secondary (smaller, below dish name)
- [ ] AI reasoning is tertiary (visible only on back of card)
- [ ] No competing visual weights

### Brutalism Aesthetic (Overall)
- [ ] Design looks distinctly different from typical SaaS chatbots
- [ ] No soft UI, no gradients, no shadows with blur
- [ ] Clear geometric shapes (triangle, circles)
- [ ] High contrast (yellow on black, red on black)
- [ ] Would be immediately recognizable in a screenshot
- [ ] Feels intentionally bold, not "broken" or amateurish

---

## 4. ENGINEERING REVIEW

### TypeScript & Type Safety
- [ ] All TypeScript files compile with `tsc` (zero errors)
- [ ] No `any` types anywhere (use explicit interfaces)
- [ ] All props are typed with `interface ComponentProps { }`
- [ ] All API responses are typed (JoystickCoords, Suggestion, etc.)
- [ ] Function parameters have explicit types
- [ ] Return types are specified (not inferred)
- [ ] strict mode is enabled in tsconfig.json

### Code Quality
- [ ] No console.log() statements left in production code (debug only)
- [ ] No commented-out code
- [ ] No TODO comments without context
- [ ] Function names are self-documenting
- [ ] Variable names avoid abbreviations (use `joystickCoords` not `joyCoords`)
- [ ] No magic numbers (all extracted to constants.ts)
- [ ] Functions do one thing and do it well
- [ ] Cyclomatic complexity is low (<5 nested if statements)

### Performance
- [ ] Joystick drag is smooth at 60fps (no jank on pointer move)
- [ ] Intent text updates within 100ms of joystick change
- [ ] API response time is <2 seconds (1.2s mock, acceptable for real API)
- [ ] Initial page load is <3 seconds
- [ ] No memory leaks (pointers cleaned up, listeners removed)
- [ ] Unnecessary re-renders are avoided (use React DevTools to verify)
- [ ] Images are lazy-loaded (`loading="lazy"`)
- [ ] No N+1 queries or redundant API calls

### Accessibility (WCAG Basic)
- [ ] Color contrast ratio >4.5:1 for text on background (test with WebAIM)
- [ ] All interactive elements are focusable (tab order)
- [ ] Focus indicators are visible (outline or custom style)
- [ ] Error messages are descriptive (not just red X)
- [ ] Alternative text for all images
- [ ] Semantic HTML (`<button>`, `<input>`, not `<div onClick>`)
- [ ] Form labels are associated with inputs (or aria-label)

### Cross-Browser Compatibility
- [ ] Works on Chrome 90+
- [ ] Works on Safari 14+ (test on macOS or BrowserStack)
- [ ] Works on Firefox 88+
- [ ] Web Speech API fallback tested (graceful on unsupported browsers)
- [ ] Touch events work on iOS (tested on iPhone or iPad)
- [ ] No console errors in any browser

### Error Handling
- [ ] API failures don't crash the app (try-catch or error boundary)
- [ ] Network timeout is handled (show error message, don't hang)
- [ ] Invalid user input is rejected gracefully (text length limit enforced)
- [ ] Microphone permission denial is handled (button disabled, not crashed)
- [ ] Missing images show fallback (not broken layout)
- [ ] All error paths have user-facing messages

### Testing (MVP May Skip)
- [ ] Joystick drag is tested (mock pointer events)
- [ ] Intent text generation is tested with various coordinate combinations
- [ ] API call is mocked and tested (success + failure cases)
- [ ] Plate flip animation is tested
- [ ] Voice input transcript append is tested
- [ ] Mobile touch events are tested
- [ ] All user flows are manually tested end-to-end

---

## 5. DESIGN SYSTEM ENFORCEMENT

### Tailwind Configuration
- [ ] Custom colors defined in tailwind.config.js for app colors
- [ ] Spacing scale defined (if custom)
- [ ] No shadcn/ui preset (to avoid component library defaults)
- [ ] Safe list includes arbitrary values (e.g., `shadow-[...]`)

### CSS Constraints
- [ ] No CSS files except globals.css
- [ ] All styling via Tailwind classes
- [ ] No inline styles except for dynamic transforms
- [ ] No styled-components or CSS-in-JS

### Tailwind Class Consistency
- [ ] All buttons use same class structure: `border-4 border-[#0C0C0C] shadow-[...]`
- [ ] All inputs use same class structure: `border-4 bg-[#FAF6F0] text-[#0C0C0C]`
- [ ] All containers use same margin/padding scale (8px multiples)
- [ ] No custom one-off classes for styling
- [ ] Hover states are consistent (shadow shrink for buttons, shadow expand for cards)

---

## 6. COMPONENT ARCHITECTURE REVIEW

### Component Responsibility
- [ ] SuggesterPage owns all state (joystick, text, suggestions, mode, flipped)
- [ ] JoystickSection is a container (passes props down, collects callbacks)
- [ ] HungerTriangle is self-contained (only handles pointer events, emits coords)
- [ ] IntentBillboard is stateless (receives coords, displays text)
- [ ] TextInput is stateless (controlled by parent)
- [ ] PlateCard is mostly stateless (flip state controlled by parent)
- [ ] No props drilling (props max 5 levels deep)
- [ ] No prop spreading ({...props})

### Data Flow Clarity
- [ ] All state flows down as props
- [ ] All events flow up via callbacks
- [ ] No sibling-to-sibling communication (go through parent)
- [ ] No global state (Context only if necessary post-MVP)
- [ ] API calls happen at page level only

### Reusability
- [ ] Button component not duplicated (all buttons same structure)
- [ ] Input component not duplicated
- [ ] Color/sizing constants extracted to constants.ts
- [ ] Text generation logic extracted to intentGenerator.ts
- [ ] Triangle math extracted to utility function (not inline)
- [ ] No copy-paste code

### Component Naming
- [ ] Component names match file names (PascalCase both)
- [ ] Interface names are `{ComponentName}Props`
- [ ] Event handler names are `on{EventName}` or `handle{ActionName}`
- [ ] Hooks are named `use{FeatureName}`
- [ ] Utilities are named descriptively (not `util.ts`)

---

## 7. ANTI-PATTERN DETECTION

### Avoid These
- [ ] No complex state management logic in components (should be hooks or utils)
- [ ] No async API calls in component body (should be in useEffect)
- [ ] No object creation in render body (move to constants or useMemo)
- [ ] No inline event handlers every render (use useCallback if needed)
- [ ] No direct DOM manipulation (use refs if absolutely necessary)
- [ ] No CSS-in-JS libraries (use Tailwind)
- [ ] No component library shadcn/ui components (custom styled)
- [ ] No feature flags without clear documentation
- [ ] No dead code (commented or unreachable)
- [ ] No overly clever/clever tricks (prefer readable code)

### Overengineering Check
- [ ] Is state management simpler than needed? (Redux when hooks suffice)
- [ ] Are there more abstractions than necessary?
- [ ] Is there duplication that isn't justified?
- [ ] Are all dependencies actually used?
- [ ] Is the component tree deeper than needed?
- [ ] Would a simpler solution work as well?

---

## 8. DOCUMENTATION REVIEW

### Code Comments
- [ ] Comments explain WHY, not WHAT
- [ ] Complex algorithms have comments
- [ ] Magic numbers are explained (though better: extracted to constants)
- [ ] Non-obvious logic is annotated
- [ ] No over-commenting (clutters readable code)

### Type Documentation
- [ ] All interfaces have JSDoc comments (if non-obvious)
```typescript
/**
 * Represents the user's preference weights for food recommendations.
 * Each value is 0.0-1.0, normalized by proximity to triangle vertices.
 */
interface JoystickCoords {
  hot: number;    // 0: want cold, 1: want hot
  cheap: number;  // 0: want expensive, 1: want cheap
  near: number;   // 0: want far/delivery, 1: want nearby
}
```

### Component Documentation
- [ ] Every component file has a comment explaining its purpose
- [ ] Props are self-documenting (clear names)
- [ ] State variables have comments if non-obvious
- [ ] Callback props are documented

### README
- [ ] Quick start instructions included
- [ ] Folder structure explained
- [ ] How to run dev server
- [ ] How to build for production
- [ ] Environment variables listed (with examples)
- [ ] Known limitations listed

---

## 9. MOBILE TESTING VERIFICATION

### Responsive Design
- [ ] Tested on viewport sizes: 320px, 768px, 1024px
- [ ] Layout breaks gracefully at each breakpoint
- [ ] No horizontal scroll on mobile
- [ ] Touch targets are >44x44px
- [ ] Text is readable without zoom

### Touch Interaction
- [ ] Joystick drag works with touch (tested on iOS/Android)
- [ ] Buttons respond to tap without delay
- [ ] Microphone captures speech on mobile
- [ ] Plate flip works on touch devices
- [ ] No hover states required (only focus/active)

### Mobile Orientation
- [ ] Portrait mode works correctly
- [ ] Landscape mode works correctly
- [ ] Orientation change doesn't break layout
- [ ] State persists on orientation change (or reasonable reset)

---

## 10. BROWSER TESTING VERIFICATION

### Chrome (Primary)
- [ ] All features working
- [ ] Web Speech API working
- [ ] Console clean (no errors/warnings)
- [ ] Devtools shows good performance (no jank)

### Safari (Secondary)
- [ ] All features working
- [ ] Web Speech API working (may have different UI)
- [ ] Touch events work
- [ ] CSS transforms render correctly

### Firefox (Tertiary)
- [ ] All features working except Web Speech API (graceful fallback)
- [ ] Console clean
- [ ] Layout correct

---

## 11. FINAL SIGN-OFF

### Executive Summary
- [ ] Feature parity achieved (all MVP features working)
- [ ] Design system fully implemented
- [ ] No critical bugs remaining
- [ ] Performance acceptable (<30s user flow)
- [ ] Code quality meets standards

### Agent Certification
- [ ] I have executed all checklist items above
- [ ] I have tested the application end-to-end
- [ ] I have verified no regressions from previous version
- [ ] I am confident this implementation meets specifications
- [ ] Deviations from spec are documented and justified

### Evidence Submission
Provide:
1. **Checklist completion:** Link to this document with all boxes checked
2. **Test results:** Screenshots or video of key user flows
3. **Code review:** Link to code repository or files
4. **Browser testing:** List of tested browsers and versions
5. **Performance metrics:** Load time, interaction latency measurements
6. **Known issues:** List any deviations or limitations (if any)

---

## END OF REVIEW CHECKLIST

**Do not submit implementation without checking all boxes.**

**All 85+ checklist items must be satisfied.**

**Agents: Use this as your quality gate. Failure = return for rework.**

---

## HOW TO USE THIS CHECKLIST

### Before Implementation
- Read this checklist
- Understand all requirements
- Ask questions about any unclear items

### During Implementation
- Refer back to relevant sections
- Self-correct as you code
- Keep a notes file tracking completion

### After Implementation (Self-Review)
- Execute this checklist systematically
- Take screenshots for evidence
- Fix any failures immediately
- Don't move to submission until 100% complete

### Submission Package
Include with code submission:
1. Completed checklist (mark every box)
2. Test evidence (screenshots, videos, console output)
3. Performance measurements
4. Links to implementation
5. Notes on any deviations
