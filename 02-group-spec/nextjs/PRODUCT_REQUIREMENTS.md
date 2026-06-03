# PRODUCT_REQUIREMENTS.md

Extracted from nextjs_ui_brainstorm.md. Every requirement, edge case, and assumption documented.

---

## 1. CORE FEATURES (MVP)

### Feature 1.1: Hunger Joystick (Triangle Gesture Input)
**What:** Interactive triangle drag interface for expressing food preferences.

**Requirements:**
- Display SVG triangle with 3 labeled vertices: "🔥 NÓNG SỐT" (top), "💸 SIÊU RẺ" (bottom-left), "⚡ ĂN LIỀN" (bottom-right)
- Draggable emoji node (😋) that stays within triangle bounds
- Pointer events support (mouse + touch)
- Real-time calculation of distances from node to each vertex
- Normalize distances to coordinates: `hot: 0.0-1.0`, `cheap: 0.0-1.0`, `near: 0.0-1.0`
- Update joystick coordinates every time node moves (no debounce mentioned)

**Acceptance Criteria:**
- [ ] User can drag 😋 emoji smoothly within triangle
- [ ] Coordinates update in real-time
- [ ] Node cannot be dragged outside triangle boundaries
- [ ] No lag when dragging on mobile
- [ ] Corners and edges are precise targets

**Ambiguities:**
- **Initial position of emoji?** Spec shows it centered, assume center of triangle
- **Touch vs mouse priority?** Both should work; implementation detail
- **Accessibility for non-pointer devices?** Not specified; may need keyboard controls (scope uncertainty)

---

### Feature 1.2: Intent Text Generation (Real-Time)
**What:** Automatic translation of joystick coordinates into natural language description of food intent.

**Requirements:**
- Watch joystick coordinates (hot, cheap, near)
- Generate sentence describing what user "wants to eat" in Vietnamese
- Update in real-time as joystick moves (latency target: <100ms)
- Display in "IntentBillboard" box with Monospace font, heavy black border
- Add typewriter effect (light effect, not mandatory)
- Format: "💬 Ý ĐỊNH: [auto-generated sentence]"

**Example Mappings:**
- hot=1.0, cheap=0.0, near=0.0 → "Tôi muốn món nước ấm bụng"
- hot=0.0, cheap=1.0, near=0.0 → "Tôi muốn món ăn siêu rẻ"
- hot=0.0, cheap=0.0, near=1.0 → "Tôi muốn ăn liền, giao nhanh"
- hot=0.5, cheap=0.5, near=0.5 → "Tôi muốn món ấm, rẻ, và giao nhanh"

**Acceptance Criteria:**
- [ ] Intent text updates instantly as joystick moves
- [ ] Text is grammatically natural Vietnamese
- [ ] Text reflects all three axes (hot, cheap, near) when all are engaged
- [ ] Text is readable in given box without overflow
- [ ] Supports voice input appending to this text

**Ambiguities:**
- **Intent text generation algorithm?** Not specified. Brute-force: hardcode 10-15 template variations based on axis dominance
- **How to blend three axes into one sentence?** Spec doesn't detail priority/weighting logic
- **Should intent text clear when user manually types?** Spec mentions "Joystick may fade if text input is prioritized" but unclear

---

### Feature 1.3: Supplementary Text Input
**What:** Optional text input field for custom food preferences.

**Requirements:**
- Display text input box below IntentBillboard (labeled "Brutalist Input Bar")
- Accept freeform Vietnamese text (e.g., "không cay", "ăn chay", "thèm bún bò")
- Input text combines with joystick intent to influence AI scoring
- Bidirectional interaction: typing affects recommendation, joystick can update input
- Support voice input button attached to right edge of input bar
- Icon: 🎤 (microphone)

**Acceptance Criteria:**
- [ ] User can type in input field
- [ ] Text persists when submitting recommendations
- [ ] Text input influences scoring algorithm (text keywords boost relevant dishes)
- [ ] Voice button appears adjacent to input
- [ ] Input field uses Brutalist styling (black border-4, no rounded corners)
- [ ] Placeholder text: "Hoặc gõ chi tiết khẩu vị của bạn..." (or similar)

**Ambiguities:**
- **Bidirectional interaction mechanics unclear.** When user types "phở", should joystick move to "hot" vertex? Spec says "joystick may auto-adjust" but doesn't define when.
- **Max text length?** Not specified; assume 200 characters
- **Auto-completion?** Not mentioned; assume simple free text

---

### Feature 1.4: Recommendation Request Button
**What:** CTA button to fetch AI recommendations based on current joystick + text input state.

**Requirements:**
- Label: "✨ GỢI Ý MÓN NGAY CHO TÔI"
- Style: Heavy black border-4, Chili Red background (#FF4B2B)
- Action: Send `{ coords: JoystickCoords, message: string }` to recommendation API
- Show loading state for 1.2 seconds (mock API latency)
- Disable button during loading
- Update button text during loading: "⏳ AI ĐANG SUY NGHĨ..."

**Acceptance Criteria:**
- [ ] Button is visually prominent (red background, black border)
- [ ] Click triggers API call
- [ ] Button disables during fetch
- [ ] 1.2 second delay before results appear
- [ ] Button re-enables after recommendations load
- [ ] Hover state shrinks shadow (physical feedback)

**Ambiguities:**
- **What if API returns zero results?** Not specified; assume always returns 3 results
- **Retry on failure?** Not mentioned; assume single attempt, show error

---

### Feature 1.5: Three-Plate Recommendation Display
**What:** Present AI recommendations as 3 circular "plates" in a row.

**Requirements:**
- Display exactly 3 recommendations as horizontal carousel
- Each plate is a circular card (not rectangular)
- Front face shows:
  - Dish image (circular, like plate rim)
  - Dish name (large, centered)
  - Restaurant name (smaller)
  - Price in Vietnamese format (e.g., "45.000đ")
  - Distance in km (e.g., "0.8 km")
  - ETA in minutes (e.g., "12 phút")
- All text overlaid on image or on white background below image
- Images sourced from mock API (Unsplash URLs provided)
- Plates arranged horizontally (center alignment on desktop, scroll on mobile)

**Acceptance Criteria:**
- [ ] 3 recommendations display immediately after API returns
- [ ] Plates are visually circular (or rounded square mimicking plate)
- [ ] All required data fields appear
- [ ] Images load without breaking layout
- [ ] Text is readable (contrast, font size)
- [ ] Spacing between plates is consistent
- [ ] Mobile view is scrollable horizontally if needed

**Ambiguities:**
- **What if image fails to load?** No fallback specified; assume solid color placeholder
- **Plate size on different viewports?** Not specified; agent to decide responsively
- **Sorting of 3 recommendations?** Spec shows scoring logic; top 3 by score

---

### Feature 1.6: 3D Flip Card Animation
**What:** Click plate card to flip and reveal AI reasoning on back face.

**Requirements:**
- Click on plate card triggers 3D flip animation
- Front face: dish image + metadata
- Back face shows:
  - Title: "[ TẠI SAO AI CHỌN? ]" (Monospace font, large, centered)
  - AI reasoning text (1-2 lines, Vietnamese, explanation of why AI picked this dish)
  - Red CTA button: "[ CHỐT MÓN NÀY ]"
- Animation duration: smooth, <500ms
- Implement using CSS transforms (perspective, preserve-3d, rotateY)
- Click back face to flip back to front
- No JavaScript animation libraries

**Acceptance Criteria:**
- [ ] Click triggers smooth flip animation
- [ ] Back face content is readable
- [ ] CTA button is red (#FF4B2B) with heavy border
- [ ] Click reverses flip
- [ ] Works on mobile (touch events)
- [ ] No layout shift during flip
- [ ] Perspective is visually 3D (not flat rotation)

**Ambiguities:**
- **Flip axis direction?** Assume left-to-right (standard card flip)
- **Preserve-3d parent context?** Must be explicit in component structure
- **Back face button action?** Opens ordering flow (external to MVP, assume href to restaurant)

---

### Feature 1.7: Voice Input (Optional Enhancement)
**What:** Microphone button to capture spoken food preferences.

**Requirements:**
- Display 🎤 icon button adjacent to text input field (right edge)
- Click button starts listening (Web Speech API, vi-VN language)
- Button visual feedback during recording:
  - Background changes to red (#FF4B2B)
  - Border becomes dashed
  - Add `animate-pulse` effect
- Transcribed text appends to intent text input field
- Stop listening when user pauses (auto-stop, `continuous: false`)
- Show error if Speech API not supported
- Only return final results (`interimResults: false`)

**Acceptance Criteria:**
- [ ] Microphone button visible
- [ ] Click starts recording
- [ ] Recording stops automatically
- [ ] Transcript appears in text input
- [ ] Button provides visual feedback
- [ ] Graceful fallback if API unavailable
- [ ] Works in Chrome/Safari (primary browsers)

**Ambiguities:**
- **Error handling if user denies microphone permission?** Spec doesn't define; assume silent failure, button disabled
- **Support other languages?** Only Vietnamese (vi-VN) mentioned
- **Cancellation before speech ends?** Click button again to cancel?

---

### Feature 1.8: Scoring Algorithm (Mock API)
**What:** Backend logic that ranks restaurants based on joystick coordinates + text input.

**Requirements:**
- Input: `JoystickCoords { hot, cheap, near }` + optional `message: string`
- Output: sorted `Suggestion[]` of top 3 restaurants
- Scoring factors:
  1. **Hot factor:** Boost dishes like phở, bún bò (hot dishes). Spec: `coords.hot * (isHotDish ? 1.0 : -0.5)`
  2. **Cheap factor:** Boost dishes with low price. Spec: `coords.cheap * ((50000 - price) / (50000 - 15000))`
  3. **Near factor:** Boost restaurants close by. Spec: `coords.near * ((2.0 - distance_km) / (2.0 - 0.4))`
  4. **Text matching:** Boost dishes whose names match keywords in message text (e.g., "phở" +2.0 points)
- Return top 3 by total score
- Mock latency: 1.2 seconds

**Acceptance Criteria:**
- [ ] Algorithm weights all three factors proportionally
- [ ] Text keywords provide meaningful score boosts
- [ ] Top 3 are different dishes when possible
- [ ] Same dish never appears twice
- [ ] Score ties broken consistently (by distance, then by price)
- [ ] Edge case: all zeros for coords returns reasonable results

**Ambiguities:**
- **What if two restaurants have identical score?** Tiebreaker undefined; assume by distance (closest first)
- **Kitchen-specific scoring?** Should "phở" only match phở dishes, or also hot dishes? Spec: name-matching is keyword-based
- **Normalized vs absolute coordinates?** Spec shows normalized (0.0-1.0) used directly in scoring

---

## 2. SECONDARY FEATURES

### Feature 2.1: "Đổi Món Khác" Button (Change Recommendations)
**What:** Button on results screen to re-roll recommendations with different seed/algorithm.

**Status:** Mentioned in spec mockup. **Low priority, may be removed for MVP.**

**Requirements (if implemented):**
- Display button on results screen
- Click triggers new API call with same coords + message
- Cycle through different restaurant sets
- Limit: 3 re-rolls per session? (Not specified)

**Ambiguities:** 
- **Is this truly required, or just shown in mockup?** No explicit mention; could be removed for MVP to reduce scope

---

### Feature 2.2: "Rẻ Hơn Nữa" Button (Budget Filter)
**What:** Button to show cheaper options.

**Status:** Mentioned in spec mockup. **Low priority, may be removed for MVP.**

**Requirements (if implemented):**
- Click slider "cheap" axis to maximum
- Re-fetch recommendations with cheap=1.0
- Show only dishes under certain price

**Ambiguities:**
- **Is this truly required?** No explicit mention; could be removed for MVP

---

## 3. USER FLOWS

### Flow 1: Happy Path - Hunger Joystick to Order
```
1. User opens app
2. Sees Hunger Joystick triangle with 😋 emoji in center
3. Drags emoji toward "SIÊU RẺ" vertex
4. Intent text updates to reflect "cheap food" preference
5. Enters optional text: "bún" (to filter by noodles)
6. Clicks "GỢI Ý MÓN NGAY CHO TÔI"
7. Waits 1.2 seconds with loading state
8. 3 plates appear (bún bò, bún chả, etc.)
9. Clicks plate 1
10. Plate flips to show "Why AI chose"
11. Reads AI reasoning
12. Clicks "CHỐT MÓN NÀY"
13. Redirected to restaurant ordering page (external)
```
**Duration:** <30 seconds
**Friction points:** None expected

---

### Flow 2: Voice Input Path
```
1. User sees text input field
2. Clicks 🎤 button
3. Says "phở bò, không cay"
4. Transcript appears in input field
5. Text is appended to auto-generated intent
6. Clicks "GỢI Ý MÓN NGAY CHO TÔI"
7. Receives recommendations
8. Follows Flow 1 from step 9
```
**Duration:** <45 seconds
**Friction points:** Microphone recognition errors (handled with fallback)

---

### Flow 3: Joystick Adjustment Path
```
1. User gets 3 recommendations
2. Doesn't like any option
3. Clicks back (returns to joystick screen)
4. Adjusts joystick position (e.g., shift from "cheap" to "hot")
5. Intent text updates
6. Clicks "GỢI Ý MÓN NGAY CHO TÔI"
7. New recommendations appear
```
**Duration:** <15 seconds
**Friction points:** Are previous intent text and coordinates reset or preserved? (Spec doesn't say; assume preserved)

---

### Flow 4: Text Input Override Path
```
1. User starts with joystick drag
2. Auto-generated intent: "Tôi muốn món rẻ"
3. User decides to type something specific
4. Clears or appends to intent text: "Phở bò tái"
5. Joystick may fade or remain visible? (Spec: "nhường toàn quyền ưu tiên cho tin nhắn văn bản")
6. Clicks "GỢI Ý MÓN NGAY CHO TÔI"
7. Recommendations filtered by text + joystick coords
```
**Duration:** <20 seconds
**Friction points:** Joystick priority unclear when text is entered

---

## 4. FUNCTIONAL REQUIREMENTS (Detailed)

### Data Structure: JoystickCoords
```typescript
interface JoystickCoords {
  hot: number;   // 0.0 to 1.0
  cheap: number; // 0.0 to 1.0
  near: number;  // 0.0 to 1.0
}
```
- All values normalized to [0.0, 1.0] range
- Updated in real-time as user drags emoji
- Passed to API with text input

---

### Data Structure: Suggestion
```typescript
interface Suggestion {
  restaurant_id: string;
  restaurant_name: string;
  dish_name: string;
  price: number;              // in Vietnamese Dong
  distance_km: number;
  eta_minutes: number;
  reason: string;             // AI reasoning (100-200 chars)
  image_url: string;
}
```
- Mock API returns exactly 3 suggestions
- No pagination
- Each suggestion is complete (no lazy-loading fields)

---

### API Contract: getAIRecommendations
**Input:**
```typescript
{
  coords: JoystickCoords;
  message: string; // optional, user-typed text
}
```

**Output:**
```typescript
Promise<Suggestion[]> // exactly 3 items
```

**Latency:** 1.2 seconds (mock); real backend TBD

**Error Handling:** Not specified. Assume never fails during MVP (happy path only).

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **Joystick responsiveness:** <16ms latency (60fps) when dragging
- **Intent text update:** <100ms after joystick move
- **API response time:** 1.2 seconds (mock), TBD for real backend
- **Card flip animation:** <500ms
- **Page load time:** <2 seconds (MVP, no image optimization yet)

### Accessibility
- **Keyboard navigation:** Tab through button, Enter to click (may not be achievable with joystick interaction)
- **Screen reader:** Announce intent text changes? (Spec doesn't mention)
- **Color contrast:** Neo-Brutalism styling may violate WCAG AA (not specified as requirement)
- **Mobile touch targets:** Buttons min 44x44px (standard)

**Ambiguity:** Is WCAG compliance required? Spec doesn't mention.

---

### Mobile/Responsive
- **Viewport support:** Mobile-first, desktop-friendly
- **Touch gestures:** Pointer events, no mouse-specific logic
- **Orientation change:** Handle portrait and landscape
- **Image scaling:** Responsive images (srcset or CSS scaling)

---

### Browser Support
- **Modern browsers:** Chrome 90+, Safari 14+, Firefox 88+
- **Web Speech API:** Chrome, Safari, Edge (not Firefox)
- **CSS transforms:** All modern browsers
- **Flexbox/Grid:** All modern browsers

---

### Localization
- **Language:** Vietnamese (vi-VN)
- **Date/time format:** Not needed for MVP
- **Number format:** Vietnamese (periods for thousands: 45.000đ)
- **Right-to-left (RTL):** Not needed

---

## 6. EDGE CASES & ERROR HANDLING

### Edge Case 1: All Joystick Axes are Zero
**Scenario:** User hasn't moved joystick (all coords at 0.0).
**Expected behavior:** Not specified. Assume API returns balanced recommendations (doesn't crash).
**Acceptance:** API handles gracefully.

---

### Edge Case 2: User Moves Joystick Very Fast
**Scenario:** Rapid dragging generates many coordinate updates.
**Expected behavior:** Intent text and recommendations update smoothly without lag.
**Debounce?** Spec doesn't mention; assume no debounce (real-time updates).

---

### Edge Case 3: Speech Recognition Fails
**Scenario:** Browser denies microphone permission or speech API error occurs.
**Expected behavior:** Graceful degradation. Show error message? Disable button? Spec doesn't specify.
**Assumption:** Disable microphone button, allow text input as fallback.

---

### Edge Case 4: Text Input Exceeds Reasonable Length
**Scenario:** User pastes 5000-character text into input field.
**Expected behavior:** Truncate or reject? Spec doesn't mention.
**Assumption:** Limit to 200 characters, trim excess.

---

### Edge Case 5: Image Fails to Load
**Scenario:** Restaurant image URL is broken or returns 404.
**Expected behavior:** Fallback strategy?
**Current spec:** Silent failure assumed. Show white placeholder.

---

### Edge Case 6: API Returns Fewer Than 3 Recommendations
**Scenario:** Mock API filtered so severely that only 2 dishes exist.
**Expected behavior:** Display 2 plates? Pad with duplicates? Spec doesn't cover.
**Assumption:** Mock API always returns exactly 3 (hardcoded dataset is large enough).

---

### Edge Case 7: Same Restaurant Appears Twice in Top 3
**Scenario:** Scoring algorithm ranks same restaurant differently for different dishes.
**Expected behavior:** Should API deduplicate by restaurant_id or allow duplicates?
**Current spec:** Not mentioned. Assume allow (user can see multiple dishes from same restaurant).

---

### Edge Case 8: User Navigates Away and Returns
**Scenario:** User opens app, drags joystick, closes tab, reopens.
**Expected behavior:** Retain joystick position? Or reset to default?
**Spec mentions:** localStorage for draft intent (recovery from accidental refresh).
**Assumption:** Preserve joystick coords and text input in sessionStorage; clear on page reload.

---

## 7. ASSUMPTIONS & CONSTRAINTS

### Assumptions
1. **User is always hungry and wants food immediately.** (Behavior assumption)
2. **Three recommendations are always sufficient.** (No need for more options)
3. **Mock API never fails.** (No error handling needed during MVP)
4. **All restaurants have images.** (All have image_url)
5. **Text input is supplementary, not primary.** (Joystick is the main interaction)
6. **User has a functional web browser with pointer event support.** (No IE11 support)
7. **Mobile users have touch capability.** (Not keyboard-only)
8. **Vietnamese language is sufficient.** (No multilingual support)
9. **Single-session anonymous usage.** (No user accounts, no persistence beyond session)
10. **Restaurant ordering links are external.** (CTA button redirects out of app)

---

### Constraints
1. **No external UI component libraries allowed** (shadcn/ui forbidden if it violates Brutalism)
2. **No complex state management.** (React hooks sufficient for MVP)
3. **No database.** (Mock API with hardcoded data only)
4. **No authentication.** (No login, public access)
5. **No real backend during MVP.** (Frontend only with mock API)
6. **No animation libraries.** (CSS transforms only)
7. **Tailwind CSS is the styling tool.** (No custom CSS files)
8. **TypeScript is mandatory.** (All code typed)
9. **Neo-Brutalism aesthetic is non-negotiable.** (No soft UI, no gradients)
10. **Response time target: <30 seconds from open to order.** (UX constraint)

---

## 8. OPEN QUESTIONS & AMBIGUITIES

| Question | Impact | Suggested Answer |
|----------|--------|------------------|
| **What is initial joystick position?** | UX | Center of triangle |
| **Should joystick auto-adjust when user types text?** | Interaction model | No; text supplements joystick |
| **What is max length of text input?** | Data | 200 characters |
| **How to generate intent text for all 8 corner/edge cases?** | Implementation complexity | Hardcode 15 template variations |
| **Should results screen be reachable via URL?** | Routing | No; single page with state |
| **Is "Đổi Món Khác" truly required?** | Scope | Remove for MVP |
| **Is "Rẻ Hơn Nữa" button required?** | Scope | Remove for MVP |
| **Should app persist recommendations after refresh?** | State management | No; reset on refresh |
| **What is WCAG accessibility target?** | Compliance | None specified; attempt AA where feasible |
| **Should app support dark mode?** | Design system | No; Brutalism requires light contrast |
| **Keyboard accessibility for joystick drag?** | A11y | Arrow keys to adjust coords (add if time) |
| **What if text doesn't match any restaurant?** | Edge case | API still returns top-3 by score |
| **Mobile: swipe between plates or always see all 3?** | Layout | Always see all 3 (scrollable if needed) |
| **Back button behavior after flip card?** | Navigation | Return to joystick screen or results? (Assume results) |
| **How to handle restaurant name overflow?** | Typography | Truncate with ellipsis, no wrap |

---

## 9. WHAT IS NOT INCLUDED (Out of Scope)

- ❌ User authentication / accounts
- ❌ Favorites / saved preferences
- ❌ Order history tracking
- ❌ Real backend API (mock only)
- ❌ Payment integration
- ❌ Real restaurant data (mockData only)
- ❌ Multi-language support
- ❌ Dark mode
- ❌ Real-time restaurant inventory
- ❌ Promo codes
- ❌ Dietary restriction filtering (no UI for this)
- ❌ Nutritional information
- ❌ Restaurant ratings/reviews
- ❌ Custom allergen warnings
- ❌ Analytics/logging
- ❌ Error reporting (Sentry, etc.)

---

## END OF PRODUCT REQUIREMENTS

This document is the authoritative source of truth for what the application must do.

Any deviation must be documented and approved by product owner.
