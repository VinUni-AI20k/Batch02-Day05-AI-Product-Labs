# QUICK START GUIDE FOR SHOPEEFOOD AI SUGGESTER MVP

**🚀 Start here if you're building the product**

---

## FOR HACKATHON TEAM (8 Hours, 3 People)

### MINUTE 0: READ THIS FIRST (5 minutes)
```
1. Open hackathon_brainstorm_plan.md → Read Section 1-2 (Problem + Solution)
2. Open nextjs_ui_brainstorm.md → View mockups Section 3
3. This file → Current page
4. AGENTS.md → Understand your role
```

**Your Role:**
- **Bùi Minh (Frontend Lead):** Phases 0-6 complete. Start with Phase 0.
- **Backend Dev 1:** Phase 0 + Backend Phase 1. Focus on pre-filtering.
- **Backend Dev 2:** Phase 0 + Backend Phase 3. Focus on LLM integration.

### MINUTE 5-60: PHASE 0 (PROJECT SETUP & API CONTRACT)

**CRITICAL:** Do NOT skip this phase. API contract mismatch = disaster.

#### Frontend Setup (Bùi Minh):
```bash
# 1. Create Next.js project
npx create-next-app@latest shopeefood --typescript --tailwind --app

# 2. Configure fonts (Google Fonts)
# - Add Space Grotesk (bold 700)
# - Add Space Mono (regular 400)

# 3. Create folder structure
mkdir -p src/components/{Joystick,Intent,Recommendations}
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/lib

# 4. Install ZERO external dependencies (we're not using shadcn/ui, Framer Motion, Zustand)

# 5. Test: `npm run dev` → localhost:3000 should load
```

**Review Checklist:**
- ✅ Node 18.17+ installed
- ✅ TypeScript strict mode enabled (tsconfig.json)
- ✅ Tailwind CSS configured
- ✅ Space Grotesk + Space Mono fonts loaded
- ✅ No extra packages installed
- ✅ `npm run dev` works

#### Backend Setup (Both Devs):
```bash
# 1. Create FastAPI project
mkdir shopeefood-backend
cd shopeefood-backend

# 2. Create requirements.txt
pip install fastapi uvicorn pydantic python-dotenv google-generativeai

# 3. Create main.py with POST /api/recommend endpoint
# 4. Create mock_restaurants.json with 20 restaurants
# 5. Test: `uvicorn main:app --reload` → localhost:8000/docs

# 6. Verify endpoint responds to:
#    POST http://localhost:8000/api/recommend
#    with request: {"message": "...", "coords": {...}, "user_location": {...}}
```

**Review Checklist:**
- ✅ Python 3.8+ installed
- ✅ FastAPI app starts on port 8000
- ✅ /api/recommend endpoint exists (even if returns mock)
- ✅ CORS configured (allows localhost:3000)
- ✅ Requirements.txt complete

#### API Contract Agreement:
**At end of Hour 1, ALL THREE team members must agree on this JSON:**

```json
// REQUEST (Frontend sends to Backend)
{
  "message": "optional user text or intent template",
  "coords": {
    "hot": 0.8,      // 0.0-1.0 scale (nóng sốt = spicy/hot)
    "cheap": 0.9,    // 0.0-1.0 scale (siêu rẻ = affordable)
    "near": 0.7      // 0.0-1.0 scale (ăn liền = nearby/fast)
  },
  "user_location": {
    "lat": 10.7769,
    "lng": 106.7009
  }
}

// RESPONSE (Backend sends to Frontend)
{
  "action": "suggest",
  "suggestions": [
    {
      "restaurant_id": "res_001",
      "restaurant_name": "Bún Chả Hà Nội",
      "dish_name": "Bún Chả with Spring Rolls",
      "price": 45000,           // VND
      "distance_km": 0.8,
      "eta_minutes": 15,
      "reason": "Perfect for someone who likes hot, affordable food nearby",
      "image_url": "https://..."
    },
    // ... 2 more dishes
  ]
}

// CLARIFY RESPONSE (if LLM needs more info)
{
  "action": "clarify",
  "clarify_question": "Do you want spicy food?"
}
```

**Sign-off:** Get all 3 people to agree this matches. Save to comment in code.

---

### HOUR 1-2: PARALLEL TRACK A (Frontend - Bùi Minh)

**PHASE 1: Hunger Joystick (Interactive Triangle)**

**Deliverable:** Triangle that responds to mouse drag, shows coordinates

Files to create:
- `src/components/JoystickSection/HungerTriangle.tsx` (SVG + drag logic)
- `src/components/JoystickSection/index.tsx` (container)
- `src/hooks/useJoystickCoords.ts` (state management)

**Key Requirements:**
```
1. SVG triangle with vertices:
   - Top vertex: "🔥 NÓNG SỐT" (Hot/Spicy) - color #FF4B2B
   - Bottom-left: "💸 SIÊU RẺ" (Cheap) - color #FED049
   - Bottom-right: "⚡ ĂN LIỀN" (Nearby/Fast) - color #0C0C0C

2. When user clicks inside triangle, it shows coordinates:
   - hot: 0.0-1.0 (how close to top vertex)
   - cheap: 0.0-1.0 (how close to bottom-left)
   - near: 0.0-1.0 (how close to bottom-right)

3. Barycentric coordinate calculation:
   - Convert mouse position to triangle coordinates
   - Clamp all values 0.0-1.0
   - Keep on-screen dragging smooth

4. Visual feedback:
   - Dot appears at drag point
   - Coordinates update in real-time
   - Use Tailwind + inline SVG (no libraries)

5. Styling:
   - border-4 black (NOT border-2)
   - No rounded corners
   - Shadow: 6px 6px 0px #0C0C0C (hover: 2px 2px)
```

**Test:** Triangle responds to clicks, coordinates change 0.0-1.0

### HOUR 1-2: PARALLEL TRACK B (Backend Dev 1)

**BACKEND PHASE 1: Pre-filtering Algorithm**

**Deliverable:** Function that filters mock restaurants by distance/price

Files to create:
- `mock_restaurants.json` (20 restaurants, full data)
- `pre_filter.py` (distance + price calculation)

**Key Requirements:**
```
1. Mock Database (JSON):
   - 20 Vietnamese restaurants in Ho Chi Minh City (center: 10.7769, 106.7009)
   - Fields: id, name, cuisine, lat, lng, average_price_vnd, rating
   - Example:
     {
       "id": "res_001",
       "name": "Bún Chả Hà Nội",
       "cuisine": "Vietnamese",
       "lat": 10.7850,
       "lng": 106.7100,
       "average_price_vnd": 45000,
       "rating": 4.5
     }

2. Pre-filter function:
   - Input: user_location {lat, lng}, price_range 0-1
   - Distance calculation: Haversine formula (km)
   - Price filtering: cheap=0.8 means accept up to 1.2M VND
   - Returns: top 8-10 candidates sorted by pre-filter score

3. Endpoint response time:
   - Goal: <1.2 seconds (including LLM latency)
   - Pre-filter should be <200ms
```

**Test:** Filter 20 restaurants, get 8-10 candidates in <200ms

### HOUR 1-2: PARALLEL TRACK C (Backend Dev 2)

**BACKEND PHASE 2 START: LLM SDK Setup**

**Deliverable:** FastAPI endpoint accepts requests, LLM is ready to call

Files to create:
- `config.py` (API keys)
- `llm_integration.py` (Gemini/OpenAI setup)

**Key Requirements:**
```
1. Get LLM API key:
   - Google Gemini (recommended for hackathon)
   - OR OpenAI GPT-4
   - Store in .env file

2. Set up LLM client:
   - Python SDK (google-generativeai or openai)
   - Model: gemini-1.5-flash or gpt-4

3. System Prompt template (Vietnamese):
   Bạn là trợ lý AI giúp gợi ý món ăn cho người dùng.
   Người dùng nói rằng họ muốn: [user_message]
   Họ chuyên tâm vào:
   - Nóng sốt (spicy) = [hot value 0-1]
   - Giá rẻ (cheap) = [cheap value 0-1]
   - Ăn liền (nearby/fast) = [near value 0-1]
   
   Từ danh sách sau, chọn 3 nhà hàng tốt nhất:
   [pre_filtered_restaurants]
   
   Trả lời JSON: {"restaurant_ids": [...], "reasons": [...]}

4. Test: LLM can be called and returns valid JSON
```

**Test:** LLM SDK initialized, can call model successfully

---

### HOUR 2-3: PARALLEL TRACK A (Frontend - Bùi Minh)

**PHASE 2: Intent Text (Display joystick selection as text)**

**Deliverable:** Show what user selected in natural language

Files to create:
- `src/components/JoystickSection/IntentBillboard.tsx`
- `src/utils/getIntentTemplate.ts`

**Key Requirements:**
```
1. Template system (3-5 templates, Vietnamese):
   - hot=0.8, cheap=0.5, near=0.3 → "Tôi muốn ăn đồ cay, giá hợp lý"
   - hot=0.2, cheap=0.9, near=0.8 → "Tôi muốn ăn đồ rẻ, gần nhất"
   - hot=0.9, cheap=0.2, near=0.5 → "Tôi muốn ăn cay, quên giá cả"

2. Real-time updates:
   - As user drags joystick → text updates immediately
   - Display uses Space Mono font

3. Styling:
   - Text on #FED049 background
   - border-4 black
   - No rounded corners
   - Centered text

4. Example template logic:
   if hot > 0.7 && cheap > 0.7 → "Cay + rẻ"
   if near > 0.8 → "Gần nhất"
   etc.
```

**Test:** Text updates as joystick changes

### HOUR 2-3: PARALLEL TRACK B (Backend Dev 1 continues)

**BACKEND PHASE 1: Finish Pre-filtering**

**Deliverable:** Pre-filter function fully tested

Tasks:
- Populate mock_restaurants.json fully (20 restaurants)
- Test pre-filter with 5+ coordinate combinations
- Measure response time (<200ms)
- Document pre-filter scoring algorithm

**Test:** `python -m pytest pre_filter.py` passes all tests

### HOUR 2-3: PARALLEL TRACK C (Backend Dev 2 continues)

**BACKEND PHASE 2: LLM Integration**

**Deliverable:** LLM can select 3 dishes from candidates

Tasks:
- Fine-tune System Prompt (multiple iterations)
- Test with 5+ different user inputs
- Ensure JSON output format correct
- Add error handling if LLM fails
- Measure latency (<1 second)

**Test:** LLM selects 3 restaurants correctly, generates reasons in <1s

---

### HOUR 3-4: PARALLEL TRACK A (Frontend - Bùi Minh)

**PHASE 3: Voice Input (Optional, can skip in crunch)**

**Deliverable:** Microphone button records speech, converts to text

Files to create:
- `src/components/JoystickSection/MicrophoneButton.tsx`
- `src/hooks/useSpeechRecognition.ts`

**Key Requirements:**
```
1. Web Speech API (vi-VN Vietnamese):
   - Language: "vi-VN"
   - Continuous: false
   - Interim results: show live text

2. Button states:
   - Idle: "🎤 Nói"
   - Recording: "🎤 Đang nghe..." (red background)
   - Done: Text appears in TextInput

3. Fallback:
   - If browser doesn't support Speech API → disable button
   - Show error message

4. Integration:
   - Recorded text goes to TextInput field
   - User can edit before sending
```

**Test:** Click button, say "Tôi muốn ăn cơm tấm", text appears

### HOUR 3-4: PARALLEL TRACK B+C (Backend combines)

**BACKEND PHASE 3: Full Integration Testing**

**Deliverable:** /api/recommend endpoint fully functional

Files to merge:
- Pre-filter + LLM → single endpoint
- Add error handling
- Add request validation (Pydantic)
- Add CORS headers

**Test:** 
```bash
curl -X POST http://localhost:8000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want spicy food",
    "coords": {"hot": 0.8, "cheap": 0.5, "near": 0.5},
    "user_location": {"lat": 10.7769, "lng": 106.7009}
  }'
```

Should respond in <1.2 seconds with 3 recommendations.

---

### HOUR 4-5: PARALLEL TRACK A (Frontend - Bùi Minh)

**PHASE 4: Form Input**

**Deliverable:** Text input and submit button

Files to create:
- `src/components/JoystickSection/TextInput.tsx`
- `src/components/JoystickSection/GetSuggestionsButton.tsx`

**Key Requirements:**
```
1. TextInput:
   - Placeholder: "Tôi muốn ăn..."
   - Can be edited manually OR filled by voice
   - border-4 black, #FAF6F0 background
   - Space Mono font

2. Button:
   - Text: "Gợi ý cho tôi"
   - Color: #FF4B2B (Chili Red)
   - On hover: shrink shadow (6px → 2px)
   - Disabled when no coords set

3. Functionality:
   - Collect: message, coords, user_location
   - Prepare API call (but don't call yet)
```

**Test:** Button enabled, ready to call API

### HOUR 4-5: PARALLEL TRACK B+C (Backend Deploy)

**BACKEND PHASE 4: Deploy to Production**

**Deliverable:** Backend running on Render.com or Hugging Face

Steps:
- Push code to GitHub
- Create Render/HF account
- Link GitHub repo
- Set environment variables
- Deploy and test production endpoint

**Test:**
```bash
curl -X POST https://[your-backend-url]/api/recommend \
  -H "Content-Type: application/json" \
  -d '{...}'
```

Should work from outside localhost.

---

### HOUR 5-6: PARALLEL TRACK A (Frontend - Bùi Minh)

**PHASE 5: Recommendations Display & 3D Flip**

**Deliverable:** Show 3 recommendation cards with flip animation

Files to create:
- `src/components/RecommendationsSection/PlateCard.tsx`
- `src/components/RecommendationsSection/index.tsx`
- `src/styles/plate-flip.css` (3D transforms)

**Key Requirements:**
```
1. PlateCard (x3, for 3 recommendations):
   - Front face: dish image, name, price, distance, ETA
   - Back face: AI reason why recommended
   - Click to flip → CSS 3D transform
   - border-4 black, #FAF6F0 background

2. 3D Flip Animation:
   - CSS: perspective, rotateY transform
   - Smooth transition (300ms)
   - On hover: slight lift shadow (shadow-[6px_6px] → [2px_2px])

3. Data display:
   - Field: restaurant_name, dish_name, price (VND)
   - Field: distance_km, eta_minutes
   - Back: reason (AI generated text)
   - Image: from image_url (or placeholder)

4. Styling:
   - Space Mono for numbers (price, distance, ETA)
   - Space Grotesk for names
   - All text on #FAF6F0 (cream) cards
   - Border #0C0C0C (caviar black)
   - No rounded corners
```

**Test:** Cards display, click to flip, show reasons

---

### HOUR 6-7: Integration Testing (All 3 Together)

**DELIVERABLE:** Full user flow works end-to-end

**Checklist:**
```
Frontend (localhost:3000):
  ✅ Joystick dragging smooth
  ✅ Intent text updates in real-time
  ✅ Voice input works (if implemented)
  ✅ Text input accepts text
  ✅ Submit button enabled

Backend (production URL):
  ✅ Responds to /api/recommend in <1.2s
  ✅ Returns exactly 3 recommendations
  ✅ Recommendations make sense for input
  ✅ Image URLs work
  ✅ CORS allows frontend to call

Integration:
  ✅ Frontend → Backend API call works
  ✅ Response appears in 3 cards
  ✅ Flip animation smooth
  ✅ Full flow: drag joystick → submit → see results (<30s total)
```

**Test:** Use app once to completion, no errors

---

### HOUR 7-8: Demo Prep

**DELIVERABLE:** Ready to present

Tasks:
- Set user_location to a real Saigon location (10.77, 106.70)
- Record demo video (2-3 minutes):
  1. Show joystick interaction
  2. Show 3 recommendations
  3. Flip a card to show reason
  4. Mention AI logic behind it
- Prepare 30-second elevator pitch in Vietnamese/English
- Push final code to GitHub (both repos)

**During demo, say:**
```
"ShopeeFood AI Suggester giải quyết vấn đề 'ngoại nhập cảng'
(decision fatigue) bằng Joystick Interaction + AI Recommendations.

Thay vì scroll menu, user chỉ cần:
1. Drag triangle (hot, cheap, near)
2. Click 'Gợi ý' → AI returns 3 perfect dishes
3. Flip cards to see why

Tất cả trong <30 giây. Built on Next.js + FastAPI."
```

---

## FOR STANDARD DEVELOPMENT TEAM (10 Days, 1-2 People)

### DAY 1: PROJECT SETUP (Phase 0)

Same as hackathon Hour 0-1, but:
- More thorough testing
- Explore Next.js documentation
- Set up git properly
- Create comprehensive README

### DAYS 2-3: JOYSTICK (Phase 1)

- Build HungerTriangle with full accessibility
- Test on mobile touch events
- Add visual feedback (hover states)
- Write unit tests for coordinate calculation

### DAY 4: INTENT TEXT (Phase 2)

- Expand from 5 to 15 intent templates
- Support more language variations
- Add animations (optional)

### DAY 5: VOICE INPUT (Phase 3)

- Full Web Speech API implementation
- Error handling for unsupported browsers
- Accessibility features
- Support for multiple languages

### DAYS 6-7: API & BACKEND (Phases 4-5)

- Build complete FastAPI backend
- Real LLM integration (not mock)
- Comprehensive error handling
- Logging and monitoring

### DAYS 8-9: UI POLISH & TESTING (Phase 5)

- Refine animations
- Test all browsers (Chrome, Safari, Firefox)
- Test on iOS, Android
- Lighthouse score optimization

### DAY 10: DEPLOYMENT (Phase 6)

- Deploy to production
- Test real endpoints
- Set up monitoring/alerts
- Final QA

---

## KEY FILES TO READ

**In This Folder (nextjs/):**
1. `AGENTS.md` → Understand roles
2. `NEXTJS_RULES.md` → Tech stack rules
3. `COMPONENT_PATTERNS.md` → Component architecture
4. `IMPLEMENTATION_ROADMAP.md` → Your timeline (read "HACKATHON" or "STANDARD" section)
5. `REVIEW_CHECKLIST.md` → Validation before shipping

**In Parent Folder:**
1. `hackathon_brainstorm_plan.md` → Business context (Section 1-2)
2. `nextjs_ui_brainstorm.md` → Design mockups (Section 3)

---

## GOTCHAS (Common Mistakes)

### ❌ DON'T:
1. Use shadcn/ui (breaks design system)
2. Use Framer Motion (use CSS transforms only)
3. Use Zustand/Redux (React hooks only)
4. Add white background (#FFFFFF) - use #FAF6F0
5. Use rounded corners (border-radius: 0)
6. Add gradients (flat colors only)
7. Use purple colors (not in palette)
8. Skip API contract alignment (hour 1 critical!)
9. Deploy without testing both frontend + backend together
10. Forget to set `NEXT_PUBLIC_USE_MOCK=false` in production

### ✅ DO:
1. Read API contract first (Section 2 of hackathon_brainstorm_plan.md)
2. Test joystick dragging on touch devices
3. Verify coordinates are 0.0-1.0 (normalized)
4. Use Space Grotesk + Space Mono only
5. Keep colors exactly: #FED049, #FF4B2B, #0C0C0C, #FAF6F0
6. Test on Safari (different WebGL/3D support)
7. Test voice on Chrome (best support)
8. Deploy backend BEFORE finishing frontend
9. Test API response time (<1.2s)
10. Record demo video (shows it works)

---

## HELP? READ THESE:

- **"How do I drag a triangle?"** → COMPONENT_PATTERNS.md, "HungerTriangle"
- **"What API should I call?"** → NEXTJS_RULES.md, "Section 5: API Contract"
- **"What's my role?"** → AGENTS.md, "TEAM STRUCTURE"
- **"Can I skip voice input?"** → IMPLEMENTATION_ROADMAP.md, "AGGRESSIVE SCHEDULE NOTES"
- **"How do I deploy?"** → IMPLEMENTATION_ROADMAP.md, "Phase 6: DEPLOYMENT"
- **"What colors should I use?"** → UI_DESIGN_RULES.md, Color Palette table
- **"What components do I need?"** → COMPONENT_PATTERNS.md, Component Tree

---

## GO! 🚀

**For Hackathon:**
```
Hour 0: Read AGENTS.md, set up projects, agree on API contract
Hour 1-7: Follow IMPLEMENTATION_ROADMAP.md phases
Hour 7-8: Demo prep
Result: Shipped MVP in 8 hours
```

**For Standard Dev:**
```
Day 1: Read all .md files, set up projects
Days 2-9: Follow IMPLEMENTATION_ROADMAP.md phases (one per day-ish)
Day 10: Deploy
Result: Polished MVP in 10 days
```

Good luck! The specification is complete. Execute the plan. 💪

---

*Questions? Check ALIGNMENT_VERIFICATION.md for detailed compliance report.*
