# IMPLEMENTATION_ROADMAP.md

Phased implementation plan with dependencies, risks, and validation criteria.

Prioritizes highest-value functionality first.

**Context:** This roadmap supports both Hackathon (8 hours) and standard development (10-14 days).

---

## ROADMAP OVERVIEW

```
Phase 0: Setup & API Contract (1 hour / 1 day)
  ↓
Phase 1: Core Joystick (2 hours / 2 days)
  ↓
Phase 2: Intent Display (1 hour / 1 day)
  ↓
Phase 3: Text Input & Voice (1 hour / 1 day)
  ↓
Phase 4: Recommendations API (1.5 hours / 2 days)
  ↓
Phase 5: Plate Display & Flip (1 hour / 2 days)
  ↓
Phase 6: Integration & Deploy (0.5 hours / 1 day)
  ↓
SHIP MVP
```

**Total Estimate:** 
- **Hackathon (Aggressive):** 8 hours (with 3-person parallel team)
- **Standard Development:** 10 days (sequential or small team)

## PHASE 0: PROJECT SETUP & API CONTRACT (1 Hour / 1 Day)

### Objective
Create Next.js project scaffolding, FastAPI boilerplate, and finalize API contract.

**Critical:** Team must align on API contract (from hackathon_brainstorm_plan.md Section 2) before starting Phase 1.

### Frontend Deliverables (Bùi Minh)
1. Next.js App Router project initialized
2. TypeScript strict mode enabled
3. Tailwind CSS configured with custom colors (#FED049, #FF4B2B, #0C0C0C, #FAF6F0)
4. Fonts (Space Grotesk, Space Mono) loaded via Next.js fonts
5. Folder structure created (components/, hooks/, utils/, etc.)
6. Initial type definitions in utils/types.ts (including API contract types)
7. Mock API stub (mockApi.ts) with hardcoded response structure
8. Updated app/layout.tsx with fonts and metadata

### Backend Deliverables (FastAPI Dev 1 & 2)
1. FastAPI boilerplate with CORS configured
2. Mock Database JSON file (15-20 restaurants with full data)
3. Route file placeholder: `POST /api/recommend`
4. Type definitions matching API contract (Pydantic models)
5. Pre-filtering algorithm skeleton
6. Deployment configuration (Render.com or Hugging Face)

### API Contract Lock-In
**CRITICAL:** Both teams must agree on this exact JSON structure:

**Frontend sends:**
```json
{
  "message": "optional user text",
  "coords": { "hot": 0.8, "cheap": 0.9, "near": 0.7 },
  "user_location": { "lat": 10.76, "lng": 106.66 }
}
```

**Backend responds:**
```json
{
  "action": "suggest",
  "suggestions": [
    {
      "restaurant_id": "res_001",
      "restaurant_name": "...",
      "dish_name": "...",
      "price": 45000,
      "distance_km": 0.8,
      "eta_minutes": 15,
      "reason": "...",
      "image_url": "..."
    }
  ]
}
```

*No changes to this structure allowed after Phase 0.*

### Tasks
**Frontend:**
- [ ] `npx create-next-app@latest --typescript --tailwind`
- [ ] Configure `tsconfig.json` with strict mode
- [ ] Add Space Grotesk and Space Mono to fonts/index.ts
- [ ] Update tailwind.config.js with custom colors
- [ ] Create folder structure
- [ ] Define types in utils/types.ts (including API request/response types)
- [ ] Create mockApi.ts stub
- [ ] Test build: `npm run build` passes

**Backend:**
- [ ] `pip install fastapi uvicorn pydantic`
- [ ] Create FastAPI app with CORS
- [ ] Create Mock Database JSON (20 restaurants)
- [ ] Define Pydantic models for request/response
- [ ] Create `/api/recommend` placeholder route
- [ ] Test local: `uvicorn main:app --reload`

**AI/LLM:**
- [ ] Create Python environment
- [ ] Test connection to Gemini/OpenAI API
- [ ] Verify API key accessibility

### Dependencies
- None (starting from zero)

### Risks
- **High:** API contract mismatch between teams → rebuild entire frontend/backend
  - **Mitigation:** Sit together, finalize JSON in first 15 minutes, document in README
- **Medium:** Font loading issues
  - **Mitigation:** Test fonts load correctly before moving to Phase 1

### Validation Criteria
- [ ] Frontend: Project builds successfully, `npm run dev` works, fonts visible
- [ ] Backend: FastAPI starts on port 8000, `/docs` shows endpoint schema
- [ ] API Contract: Both teams have written document with exact JSON
- [ ] Mock Database: JSON file with 15+ restaurants, all required fields populated
- [ ] Types: TypeScript types match API contract on both sides
- [ ] All team members understand the contract (no surprises later)

---

## PHASE 0B: PARALLEL BACKEND DEVELOPMENT (Phases 1-5 Parallel)

## PHASE 1: CORE JOYSTICK INTERACTION (2 Days)

### Objective
Build the triangle joystick with interactive dragging and coordinate normalization.

**This is the unique signature feature.** Highest priority.

### Deliverables
1. HungerTriangle SVG component (interactive)
2. Joystick state management at page level
3. Pointer event handling (mouse + touch)
4. Coordinate normalization algorithm
5. Real-time coordinate updates

### Dependencies
- Phase 0 complete (setup)

### Tasks
1. **Create HungerTriangle.tsx component**
   - [ ] Define SVG with 3 vertices (top, bottom-left, bottom-right)
   - [ ] Render labels: "🔥 NÓNG SỐT", "💸 SIÊU RẺ", "⚡ ĂN LIỀN"
   - [ ] Render 😋 emoji at center initially
   - [ ] Implement pointer event handlers (onPointerDown, onPointerMove, onPointerUp)
   - [ ] Constraint emoji position within triangle bounds
   - [ ] Calculate distances from emoji to each vertex
   - [ ] Normalize to JoystickCoords { hot, cheap, near } (0.0-1.0)
   - [ ] Emit onCoordsChange callback on every move
   - [ ] Test on desktop (mouse) and mobile (touch)

2. **Create SuggesterPage.tsx (root component)**
   - [ ] Manage joystickCoords state
   - [ ] Render HungerTriangle with coords and onChange handler
   - [ ] Debug: Log coordinates to console during drag
   - [ ] Verify coordinates update in real-time

3. **Create utils/constants.ts**
   - [ ] Export triangle vertex positions (if reusable)
   - [ ] Export color hex values (#FED049, etc.)
   - [ ] Export magic numbers

4. **Create utils/types.ts**
   - [ ] Define interface JoystickCoords
   - [ ] Define interface Suggestion
   - [ ] Define other shared types

### Risks
- **High:** Coordinate normalization math (barycentric coordinates complex)
  - **Mitigation:** Use simple distance-based approach first, refine if needed
- **Medium:** Touch event handling on iOS (might be slow)
  - **Mitigation:** Test on actual device early
- **Medium:** SVG scaling on different viewports
  - **Mitigation:** Use responsive wrapper with viewBox

### Validation Criteria
- [ ] Emoji can be dragged smoothly within triangle
- [ ] Coordinates update in real-time (<16ms latency)
- [ ] Emoji cannot be dragged outside triangle
- [ ] Coordinates normalize to [0, 1] correctly
- [ ] Touch events work on mobile (tested on phone)
- [ ] No console errors
- [ ] Performance smooth at 60fps (use DevTools)

### Testing
```typescript
// Manual test: Drag emoji to each vertex
// hot should max when near top
// cheap should max when near bottom-left
// near should max when near bottom-right
// All three together should be possible in the center
```

---

## PHASE 2: INTENT TEXT DISPLAY (1 Day)

### Objective
Generate and display natural language intent based on joystick coordinates.

**This provides user feedback and validates joystick is working.**

### Deliverables
1. IntentBillboard component
2. Intent text generation logic (intentGenerator.ts)
3. Real-time updates as joystick moves

### Dependencies
- Phase 1 complete (joystick working)

### Tasks
1. **Create utils/intentGenerator.ts**
   - [ ] Implement generateIntentText(coords: JoystickCoords): string
   - [ ] Create 15-20 template variations in Vietnamese
   - [ ] Identify dominant axis (hot, cheap, near) from coords
   - [ ] Select appropriate template based on dominance
   - [ ] Handle blended cases (e.g., hot + cheap)
   - [ ] Return natural sentence in Vietnamese

   **Example templates:**
   ```
   hot=1, cheap=0, near=0: "Tôi muốn ăn cái gì đó nóng"
   cheap=1, hot=0, near=0: "Tôi muốn tiết kiệm tiền"
   near=1, hot=0, cheap=0: "Tôi muốn ăn trong 15 phút"
   hot=0.5, cheap=0.5, near=0.5: "Tôi muốn nóng, rẻ, và giao nhanh"
   ```

2. **Create IntentBillboard.tsx component**
   - [ ] Receive joystickCoords as prop
   - [ ] Call generateIntentText(coords)
   - [ ] Display: "💬 Ý ĐỊNH: [text]" in Brutalist box
   - [ ] Update in real-time as coords change
   - [ ] Style: border-4 #0C0C0C, bg-#FAF6F0, padding 24px
   - [ ] Font: Space Mono Regular 16px

3. **Integrate IntentBillboard into SuggesterPage**
   - [ ] Pass joystickCoords prop
   - [ ] Render below HungerTriangle
   - [ ] Verify text updates as joystick moves

4. **Test intent generation**
   - [ ] Test all major axes individually
   - [ ] Test axis combinations
   - [ ] Verify Vietnamese text is grammatically correct
   - [ ] Verify no overflow/truncation in container

### Risks
- **Medium:** Template variations feel artificial or unnatural
  - **Mitigation:** Get Vietnamese speaker to review; iterate
- **Low:** Text overflows container on long strings
  - **Mitigation:** Truncate with max-width; word-break property

### Validation Criteria
- [ ] Intent text updates instantly when joystick moves
- [ ] Text is grammatically correct Vietnamese
- [ ] Text reflects all three axes when engaged
- [ ] Text fits within billboard container (no overflow)
- [ ] No console errors

---

## PHASE 3: TEXT INPUT & VOICE (1 Day)

### Objective
Allow supplementary text input and voice capture.

**Reduces friction; optional but important for UX.**

### Deliverables
1. TextInput component
2. MicrophoneButton component
3. useSpeechToText hook
4. Integration into SuggesterPage

### Dependencies
- Phase 2 complete (intent display)

### Tasks
1. **Create TextInput.tsx component**
   - [ ] Render `<input type="text">` with Brutalist styling
   - [ ] Styling: border-4 #0C0C0C, bg-#FAF6F0, padding 16px 12px
   - [ ] Receive value and onChange props
   - [ ] Enforce 200 character limit
   - [ ] Placeholder: "Hoặc gõ chi tiết khẩu vị của bạn..."
   - [ ] Label (visible or aria): input purpose

2. **Create hooks/useSpeechToText.ts**
   - [ ] Wrap Web Speech API
   - [ ] Set language to vi-VN
   - [ ] Return { isListening, startListening, stopListening, isSupported }
   - [ ] Handle unsupported browsers gracefully
   - [ ] Manage microphone permissions
   - [ ] Return transcript via callback

3. **Create MicrophoneButton.tsx**
   - [ ] Render icon 🎤 button
   - [ ] Styling: 44x44px, border-2 #0C0C0C, bg-#FED049
   - [ ] Use useSpeechToText hook
   - [ ] Show visual feedback when listening (bg #FF4B2B, pulse animation)
   - [ ] Append transcript to text input on completion
   - [ ] Show error if microphone not supported
   - [ ] Handle permission denied gracefully

4. **Integrate into SuggesterPage**
   - [ ] Add textInput state
   - [ ] Render TextInput component with value/onChange
   - [ ] Render MicrophoneButton below TextInput
   - [ ] Wire microphone transcript to append to textInput

5. **Test voice capture**
   - [ ] Test on Chrome (primary)
   - [ ] Test on Safari (if available)
   - [ ] Test permission denied flow
   - [ ] Test unsupported browser (Firefox)
   - [ ] Test Vietnamese speech recognition accuracy

### Risks
- **High:** Web Speech API may not work on all browsers (Firefox)
  - **Mitigation:** Graceful fallback (disable button, show message)
- **Medium:** Microphone permission UX confusing
  - **Mitigation:** Clear messaging ("Click to record voice")
- **Medium:** Speech recognition accuracy for Vietnamese
  - **Mitigation:** Test early; may need backend STT post-MVP

### Validation Criteria
- [ ] Text input accepts keyboard input (max 200 chars)
- [ ] Microphone button triggers speech recording
- [ ] Transcript appends to text input field
- [ ] Microphone button shows listening state (red, pulse)
- [ ] Works on Chrome, gracefully fails on Firefox
- [ ] Permission denial shows friendly message
- [ ] No console errors

---

## PHASE 4: RECOMMENDATIONS API (2 Days)

### Objective
Implement mock API and scoring algorithm.

**Core business logic; medium priority (joystick is priority #1).**

### Deliverables
1. mockApi.ts with scoring algorithm
2. Mock restaurant data (4-6 restaurants)
3. API contract types
4. GetSuggestionsButton component
5. Loading state management

### Dependencies
- Phase 3 complete (text input works)

### Tasks
1. **Create utils/mockApi.ts**
   - [ ] Define Suggestion interface (from spec)
   - [ ] Create mockRestaurants array (4-6 items with real data from spec)
   - [ ] Implement getAIRecommendations(coords, message) function
   - [ ] Implement scoring algorithm:
     - hot score = coords.hot * (1.0 if hot dish, -0.5 otherwise)
     - cheap score = coords.cheap * ((50000 - price) / (50000 - 15000))
     - near score = coords.near * ((2.0 - distance) / (2.0 - 0.4))
   - [ ] Text matching: boost score if message keywords match dish name
   - [ ] Return top 3 by total score
   - [ ] Add 1.2 second latency (await new Promise)
   - [ ] Handle edge cases (zero coords, no matching text)

2. **Create GetSuggestionsButton.tsx**
   - [ ] Render CTA button with text "✨ GỚI Ý MÓN NGAY CHO TÔI"
   - [ ] Styling: border-4 #0C0C0C, bg-#FF4B2B, text white, padding 16px 12px
   - [ ] Shadow: shadow-[6px_6px_0px_0px_#0C0C0C]
   - [ ] Hover shadow: shadow-[2px_2px_0px_0px_#0C0C0C]
   - [ ] Receive isLoading prop
   - [ ] When loading, show "⏳ AI ĐANG SUY NGHĨ..." and disable button
   - [ ] onClick callback

3. **Update SuggesterPage**
   - [ ] Add suggestions state (Suggestion[])
   - [ ] Add isLoading state
   - [ ] Implement handleGetSuggestions(coords, text) handler
   - [ ] Call mockApi.getAIRecommendations(coords, text)
   - [ ] Update suggestions state with result
   - [ ] Set isLoading during fetch
   - [ ] Handle errors (try-catch, log to console)

4. **Test scoring algorithm**
   - [ ] Test coords = [1, 0, 0] (hot only) → hot dishes ranked first
   - [ ] Test coords = [0, 1, 0] (cheap only) → cheap dishes ranked first
   - [ ] Test coords = [0, 0, 1] (near only) → nearest dishes ranked first
   - [ ] Test text matching: input "phở" → phở dish boosted
   - [ ] Test zero coords → balanced recommendations
   - [ ] Verify exactly 3 returned (not 2, not 4)

### Risks
- **Medium:** Scoring algorithm weights feel off
  - **Mitigation:** Test with various input combinations; adjust coefficients if needed
- **Low:** 1.2s latency feels too long (actually realistic for ML inference)
  - **Mitigation:** Keep as specified

### Validation Criteria
- [ ] API call completes in ~1.2 seconds
- [ ] Returns exactly 3 recommendations
- [ ] Recommendations rank according to coords and text input
- [ ] No duplicates in top 3
- [ ] All Suggestion fields populated (no missing data)
- [ ] Loading state shows "⏳" text
- [ ] Button disabled during loading
- [ ] No console errors

---

## PHASE 5: PLATE DISPLAY & 3D FLIP (2 Days)

### Objective
Display 3 recommendations as circular plates with 3D flip animation.

**High visual impact; critical for MVP polish.**

### Deliverables
1. RecommendationsSection container
2. PlateCard with front/back faces
3. 3D flip animation (CSS transforms)
4. BackButton to return to joystick
5. Plate data display (image, name, price, distance, ETA, AI reasoning)

### Dependencies
- Phase 4 complete (recommendations available)

### Tasks
1. **Create RecommendationsSection.tsx**
   - [ ] Receive suggestions: Suggestion[] prop
   - [ ] Render 3 PlateCard components in flex row
   - [ ] Manage flippedPlateId state (which plate is showing back face)
   - [ ] Render BackButton
   - [ ] Handle plate click → toggle flipped state
   - [ ] Responsive layout (scroll horizontally on mobile if needed)

2. **Create PlateCard.tsx**
   - [ ] Receive suggestion: Suggestion prop, isFront: boolean, onClick: () => void
   - [ ] Structure:
     ```
     <PlateCardContainer perspective-[1000px]>
       <PlateCardContent transform-style-preserve-3d isFlipped>
         <PlateFront rotate-y-0>
           {front face}
         </PlateFront>
         <PlateBack rotate-y-180>
           {back face}
         </PlateBack>
       </PlateCardContent>
     </PlateCardContainer>
     ```
   - [ ] Front face: image, dish name, restaurant, price, distance, ETA
   - [ ] Back face: "[ TẠI SAO AI CHỌN? ]", AI reason, red CTA button
   - [ ] Styling: border-4 #0C0C0C, width ~300px, min-height ~350px
   - [ ] Shadow: shadow-[6px_6px_0px_0px_#0C0C0C], hover: shadow-[8px_8px_0px_0px_#0C0C0C]
   - [ ] Animation: CSS transition-transform duration-500 ease-in-out

3. **Create PlateFront.tsx (sub-component)**
   - [ ] Display image (circular, 200x200px)
   - [ ] Dish name (Space Mono Bold 20px, centered)
   - [ ] Restaurant name (Space Mono 14px, centered, smaller)
   - [ ] Price: "X.000đ" (Space Mono 14px, right-aligned)
   - [ ] Distance: "X km" (Space Mono 14px, right-aligned)
   - [ ] ETA: "X phút" (Space Mono 14px, right-aligned)
   - [ ] Background: #FAF6F0

4. **Create PlateBack.tsx (sub-component)**
   - [ ] Title: "[ TẠI SAO AI CHỌN? ]" (Space Mono Bold 24px, centered)
   - [ ] AI reason text: suggestion.reason (Space Mono 16px, 1-2 lines, centered)
   - [ ] Red CTA button: "[ CHỐT MÓN NÀY ]" (border-4 #0C0C0C, bg-#FF4B2B, text white)
   - [ ] Button action: href to restaurant page (external, target="_blank")
   - [ ] Background: #FAF6F0

5. **Create BackButton.tsx**
   - [ ] Render button with text "← Trở lại" or just "⬅"
   - [ ] Styling: border-2 #0C0C0C, bg-#FED049, min size 44x44px
   - [ ] onClick: parent callback to return to joystick
   - [ ] Position: top-left corner

6. **CSS 3D Transforms**
   - [ ] Parent container: `perspective: 1000px`
   - [ ] Content wrapper: `transform-style: preserve-3d`, `transition: transform 500ms ease-in-out`
   - [ ] When flipped: `transform: rotateY(180deg)`
   - [ ] Front face: `backface-visibility: hidden`, `transform: rotateY(0deg)`
   - [ ] Back face: `backface-visibility: hidden`, `transform: rotateY(180deg)`

7. **Test flip animation**
   - [ ] Click plate → smooth flip
   - [ ] Click back to flip back
   - [ ] Works on touch (mobile)
   - [ ] Perspective is 3D (not flat rotation)
   - [ ] Animation duration is 500ms (not too slow)

### Risks
- **Medium:** Flip animation may not be smooth on low-end devices
  - **Mitigation:** Test on older devices; optimize CSS if needed
- **Medium:** Image loading delays initial display
  - **Mitigation:** Show placeholder while loading
- **Low:** backface-visibility not supported on old browsers
  - **Mitigation:** Safari 15+ and modern browsers supported; OK for MVP

### Validation Criteria
- [ ] 3 plates display in a row
- [ ] Images load and display
- [ ] All data fields visible (name, price, distance, ETA)
- [ ] Click plate → smooth 3D flip animation
- [ ] Back face shows AI reasoning and CTA button
- [ ] Click back face → flips back
- [ ] CTA button opens restaurant page in new tab
- [ ] BackButton returns to joystick screen
- [ ] Mobile: plates scrollable horizontally
- [ ] No console errors

---

## PHASE 6: POLISH & TESTING (1 Day)

### Objective
Visual polish, comprehensive testing, and bug fixes.

**Final mile; ensure MVP quality.**

### Deliverables
1. All UI refinements complete
2. Full end-to-end user flows validated
3. Mobile responsiveness verified
4. Cross-browser testing done
5. Review checklist 100% passed

### Tasks
1. **Visual Polish**
   - [ ] Verify all colors exactly match spec (#FED049, #FF4B2B, #0C0C0C, #FAF6F0)
   - [ ] Verify all borders are border-4 thick
   - [ ] Verify all shadows use correct offset values
   - [ ] Verify all fonts are Space Grotesk and Space Mono
   - [ ] Verify all text is properly aligned
   - [ ] Check for layout issues on edge cases (very long text, small viewports)
   - [ ] Add loading skeleton if images take time
   - [ ] Refine hover states (all buttons, all cards)
   - [ ] Test on actual devices (not just browser emulation)

2. **End-to-End Testing**
   - [ ] Happy path: joystick → get suggestions → flip card → order
   - [ ] Voice path: mic → speak → transcript appended → submit
   - [ ] Adjustment path: get results → back → adjust joystick → new results
   - [ ] Error path: API fails → show error message → recover gracefully
   - [ ] Edge cases:
     - All joystick coords = 0
     - Text input maxed out (200 chars)
     - Very long restaurant names
     - Network timeout (mock with setTimeout)

3. **Mobile Testing**
   - [ ] Test on iPhone (iOS 14+)
   - [ ] Test on Android (Chrome)
   - [ ] Verify touch events work (joystick drag, button tap)
   - [ ] Verify no zoom on tap
   - [ ] Verify text is readable (no tiny font)
   - [ ] Verify buttons are tappable (44x44px min)
   - [ ] Verify landscape and portrait modes

4. **Cross-Browser Testing**
   - [ ] Chrome latest (primary browser)
   - [ ] Safari latest (secondary)
   - [ ] Firefox latest (no Web Speech API, graceful fallback)
   - [ ] Edge (if available)
   - [ ] Verify console is clean (no errors/warnings)

5. **Performance Audit**
   - [ ] Lighthouse score >90
   - [ ] Page load <3 seconds
   - [ ] Joystick drag smooth (60fps, no jank)
   - [ ] Intent text updates <100ms
   - [ ] No memory leaks (check Task Manager on drag for 10 seconds)
   - [ ] Image lazy loading working

6. **Execute Review Checklist**
   - [ ] Complete REVIEW_CHECKLIST.md systematically
   - [ ] Check every item
   - [ ] Take screenshots for evidence
   - [ ] Fix any failures
   - [ ] Document any deviations
   - [ ] Final sign-off

7. **Documentation**
   - [ ] Update README.md with quick start
   - [ ] Add JSDoc comments to complex functions
   - [ ] Document all environment variables
   - [ ] Note any known limitations

### Risks
- **High:** Last-minute UI bugs discovered
  - **Mitigation:** Test early and often; don't rush polish phase
- **Medium:** Browser incompatibility found too late
  - **Mitigation:** Test browsers in Phase 5, not Phase 6

### Validation Criteria
- [ ] All review checklist items passing
- [ ] All user flows work end-to-end
- [ ] Works on mobile (iOS and Android)
- [ ] Works on Chrome, Safari, Firefox
- [ ] Performance acceptable (Lighthouse >90)
- [ ] No console errors anywhere
- [ ] Styling matches spec pixel-perfectly
- [ ] Documentation complete

---

## PARALLEL BACKEND DEVELOPMENT (Phases 1-5 Concurrent)

### Overview
While frontend team builds UI components (Phases 1-5), backend team (FastAPI Dev 1 & 2) builds API backend. Both teams work in parallel using the API contract from Phase 0.

### Backend Phase 1-2: Mock Database + Pre-filtering (2-3 hours / 2 days)
**Dependencies:** Phase 0 complete (FastAPI boilerplate + API contract)

**Deliverables:**
- [ ] Mock Database JSON fully populated (20 restaurants, full data)
- [ ] Pre-filtering function implemented (distance Haversine, price filtering)
- [ ] Test endpoint returns exactly 3 restaurants after filtering
- [ ] Endpoint responds in <1.2 seconds (with latency simulation)

**Tasks:**
- [ ] Populate mock_restaurants.json with real Vietnamese restaurants
- [ ] Implement distance calculation from user_location to restaurant coords
- [ ] Implement price-based filtering
- [ ] Create pre-filter function that returns top 8-10 candidates
- [ ] Test with various coords/message combinations

### Backend Phase 3-4: LLM Integration (1-2 hours / 1-2 days)
**Dependencies:** Backend Phase 1-2 complete + LLM API key available

**Deliverables:**
- [ ] Gemini/OpenAI API connection tested
- [ ] System Prompt designed (anti-hallucination, JSON structure)
- [ ] Structured Output (JSON Mode or Pydantic) configured
- [ ] LLM selects top 3 from pre-filtered candidates
- [ ] AI reasoning generation working

**Tasks:**
- [ ] Set up Gemini SDK or OpenAI client
- [ ] Create System Prompt that:
     - Takes pre-filtered restaurants + user message
     - Selects exactly 3 best matches
     - Explains why in Vietnamese (short, <15 words)
     - Never invents data
- [ ] Test prompt against 5+ test cases
- [ ] Implement fallback if LLM fails

### Backend Phase 5: Integration Testing (0.5 hours / 1 day)
**Dependencies:** All backend components complete

**Deliverables:**
- [ ] API endpoint `/api/recommend` fully functional
- [ ] Request/Response matches API contract exactly
- [ ] Tested with frontend on localhost
- [ ] CORS configured correctly
- [ ] Error handling for edge cases

**Tasks:**
- [ ] Run FastAPI app on local port 8000
- [ ] Test with cURL/Postman against API contract
- [ ] Test with frontend app (set `NEXT_PUBLIC_API_URL=http://localhost:8000`)
- [ ] Verify response times acceptable
- [ ] Test error cases (invalid input, API fails, etc.)

### Backend Phase 6: Deployment (0.5 hours / 1 day)
**Dependencies:** All integration tests pass

**Deliverables:**
- [ ] Backend deployed to Render.com or Hugging Face
- [ ] Production API endpoint URL created
- [ ] Environment variables configured (API keys, CORS origins)
- [ ] Tested from production frontend

**Tasks:**
- [ ] Push to GitHub repo with requirements.txt + main.py
- [ ] Create Render/Hugging Face account if needed
- [ ] Link GitHub repo for auto-deploy
- [ ] Set environment variables
- [ ] Test production endpoint
- [ ] Update frontend `.env.local` with production URL

---

## DEPLOYMENT READINESS (Post-MVP)

### Before Production:
1. [ ] Create `.env.local` with real API endpoint
2. [ ] Set `NEXT_PUBLIC_USE_MOCK=false` in production
3. [ ] Run `npm run build` and `npm start` test
4. [ ] Deploy to staging and test real API connection
5. [ ] Monitor error logs for 24 hours
6. [ ] Get stakeholder sign-off

### Post-MVP Roadmap (Not in MVP):
- Real backend FastAPI service
- User authentication
- Save favorites
- Order history tracking
- Analytics/logging
- Promo codes
- Dietary filtering
- Restaurant inventory sync

---

## SUCCESS CRITERIA (Overall)

### MVP Shipped Successfully When:
- ✅ All 10+ core requirements working
- ✅ All user flows complete in <30 seconds
- ✅ Review checklist 100% passed
- ✅ Tested on mobile (iOS + Android)
- ✅ Tested on Chrome, Safari, Firefox
- ✅ No critical bugs
- ✅ Lighthouse score >90
- ✅ Shipped and live

---

## TIMELINE BREAKDOWN

### Hackathon Context (8 Hours Total, 3-Person Parallel Team)

**Team Split:**
- **Frontend Lead (Bùi Minh):** Phases 0-6 (UI/UX)
- **Backend Dev 1:** Phase 0 + Backend Phases 1-2 (Pre-filtering)
- **Backend Dev 2:** Phase 0 + Backend Phases 3-4 (LLM Integration)

**Hour-by-Hour Schedule:**
```
Hour 0-1:   Phase 0 (Frontend setup + API contract + Backend setup)
            └─ All teams work on setup in parallel
            
Hour 1-2:   Phase 1 (Joystick) | Backend Phase 1 (Pre-filtering)
            └─ Frontend: Triangle SVG
            └─ Backend Dev 1: Mock DB + distance calculation
            └─ Backend Dev 2: LLM SDK setup
            
Hour 2-3:   Phase 2 (Intent) + Phase 3 (Voice) | Backend Phase 2 (LLM)
            └─ Frontend: Intent text + voice button
            └─ Backend: LLM integration + System Prompt
            
Hour 3-4:   Phase 4 (API) + Phase 5 (Plates) | Backend Phase 3-4 (Integration)
            └─ Frontend: Mock API calls + 3D flip cards
            └─ Backend: Full endpoint testing
            
Hour 4-6:   Phase 5 (Plates) | Backend Phase 5 (Prod deployment)
            └─ Frontend: Polish UI, fix layout
            └─ Backend: Deploy to Render/HF, test from prod
            
Hour 6-7:   Integration testing
            └─ Frontend & Backend teams connect live
            └─ Test full user flow end-to-end
            
Hour 7-8:   Final demo prep + presentation
            └─ Record demo video
            └─ Prepare talking points
            └─ Final bug fixes
```

**Success at 8 hours if:**
- ✅ Joystick dragging works smoothly
- ✅ Intent text updates in real-time
- ✅ Voice input works (at least on Chrome)
- ✅ Button shows 3 recommendations in <2 seconds (with 1.2s mock latency)
- ✅ Plate flip animation smooth
- ✅ Backend API integrated and responding from production
- ✅ Full user flow completes in <30 seconds

### Standard Development (10 Days, Sequential or Small Team)

- Phase 0: 1 day (full day setup)
- Phase 1: 2 days (joystick refinement)
- Phase 2: 1 day (intent text)
- Phase 3: 1 day (voice + text input)
- Phase 4: 2 days (API + scoring)
- Phase 5: 2 days (3D plates + animation)
- Phase 6: 1 day (polish + final testing)
- **Total: 10 days** (less stress, higher quality)

---

## AGGRESSIVE SCHEDULE NOTES (Hackathon 8 Hours)

### Shortcuts Acceptable in Hour 8:
- ❌ Don't skip Phase 0 (API contract mismatch = disaster)
- ✅ Simplify Phase 2 (2-3 intent templates instead of 15)
- ✅ Skip optional voice if running out of time (text input only)
- ✅ Mock database can have 4 restaurants instead of 20
- ✅ Skip accessibility testing (best-effort, not required)
- ✅ Skip Lighthouse optimization (works > optimal)
- ✅ Deploy backend without fancy error handling
- ✅ Don't build "Change Rec" or "Budget Filter" buttons (optional features)

### What NOT to Skip:
- ❌ API Contract alignment (must agree in Hour 1)
- ❌ Core joystick functionality (unique signature)
- ❌ 3D flip animation (memorable visual)
- ❌ End-to-end user flow testing (must complete in <30s)
- ❌ Production deployment (both frontend + backend)

---

## COMPARISON: SUCCESS METRICS

### 8-Hour Hackathon MVP
- Joystick works ✅
- Recommends 3 dishes ✅
- Beautiful UI ✅
- Backend integrated ✅
- Deployed to production ✅
- **Polish level:** 70%

### 10-Day Standard MVP
- Everything above ✅
- Voice input works perfectly ✅
- Polish animations ✅
- Full error handling ✅
- Comprehensive testing ✅
- **Polish level:** 95%

Both are MVPs. Hackathon version trades polish for speed.

---

## END OF IMPLEMENTATION ROADMAP

This roadmap provides a structured, sequential path to MVP completion.

**Each phase has clear dependencies, objectives, and validation criteria.**

Agents should follow phases in order and not jump ahead.

**For Hackathon:** Parallel team structure (3 people) can complete in 8 hours by dividing frontend/backend work.

**For Standard Dev:** Sequential approach (1-2 people) takes 10 days but produces higher-quality result.
