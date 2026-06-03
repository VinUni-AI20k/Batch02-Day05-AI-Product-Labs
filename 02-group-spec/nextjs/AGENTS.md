# ShopeeFood AI Suggester - Agent Operating System

Master operating manual for AI agents building this product.

---

## 1. PRODUCT VISION

### Problem Statement
Hungry users in urban areas are cognitively overloaded. They want food **NOW** but lack the mental energy to:
- Search through menus
- Compare prices
- Calculate delivery times
- Type complex queries

Current food delivery apps force users into consumption friction via chat, search bars, and decision paralysis.

### Solution
**Zero-Chat Interface** with "Hunger Joystick" - a physical, immediate interaction model that translates body intuition into food preferences without typing.

**Guiding Principle:** Users should make a food decision within 30 seconds using pure gesture-based interaction.

### Success Definition
Users can:
1. Drag a joystick to express preference (hot, cheap, or near)
2. See 3 AI-recommended dishes within 2 seconds
3. Click to order without additional friction
4. Recognize the product within 3 seconds of seeing a screenshot

---

## 2. PRODUCT GOALS

### Primary Goals (MVP)
1. **Reduce Decision Time:** Food selection in <30 seconds vs traditional 5+ minutes
2. **Minimize Typing:** Zero required text input; optional supplementary input
3. **Distinctive Visual Identity:** Neo-Brutalism aesthetic that's immediately recognizable
4. **Instant Recommendations:** AI scoring responds to joystick input in <2 seconds
5. **Mobile-First Usability:** Gesture-based interaction works seamlessly on touch devices

### Secondary Goals
1. Voice input as friction-reduction alternative
2. Personalized recommendations based on gestures + text
3. Transparent AI reasoning ("Why did AI choose this?")
4. Delightful micro-interactions (3D flips, physical shadow feedback)

---

## 3. TEAM STRUCTURE (Hackathon Context - 3 Person Team)

Based on hackathon_brainstorm_plan.md, the recommended split is:

### Role 1: Frontend Lead (Next.js Developer)
**Name:** Bùi Minh (or assigned)

**Responsibilities:**
1. Initialize Next.js App Router project
2. Implement HungerTriangle SVG component (interactive dragging)
3. Implement IntentBillboard (real-time text generation)
4. Implement TextInput + MicrophoneButton (Web Speech API)
5. Implement PlateCard 3D flip animation
6. Connect API calls (initially mock, then real backend)
7. Deploy to Vercel
8. Integrate complete UI with backend

**Deliverables:** `/components/*`, `/hooks/*`, `/utils/mockApi.ts`, `/utils/intentGenerator.ts`

### Role 2: Backend Core Developer (FastAPI Infrastructure)
**Name:** Backend Dev 1

**Responsibilities:**
1. Set up FastAPI boilerplate + CORS configuration
2. Create Mock Database (JSON file with 15-20 restaurants)
3. Implement pre-filtering algorithm (distance, price calculation)
4. Build `/api/recommend` endpoint receiving `{ coords, message }`
5. Implement scoring algorithm
6. Deploy to Render.com or Hugging Face Spaces

**Deliverables:** FastAPI app, mock database JSON, pre-filtering logic

### Role 3: AI/LLM Specialist (Prompt Engineer)
**Name:** Backend Dev 2

**Responsibilities:**
1. Set up connection to Gemini API or OpenAI
2. Design System Prompt that rejects hallucinations
3. Implement Structured Output (Pydantic/JSON Mode)
4. Test prompt against edge cases (TC-03, TC-08, TC-11)
5. Handle `action: "clarify"` responses

**Deliverables:** LLM integration code, prompt templates, error handling

### Timeline (Hackathon: 8 Hours Total)
- **Hour 0-1:** Brainstorm & finalize API contract
- **Hour 1-4:** Parallel development (frontend, backend, AI)
- **Hour 4-5:** Integration testing (local connection)
- **Hour 5-7:** Deploy to Render + Vercel, test production
- **Hour 7-8:** Final testing + demo preparation

---

## 3. USER PERSONAS

### Primary: The Hungry Office Worker (Tình Huống Chính)
- **Context:** Lunch break, 30 minutes available
- **Pain Point:** Mentally drained from meetings, wants food fast
- **Behavior:** Scrolls food delivery apps aimlessly, procrastinates
- **Goal:** Make a decision immediately without overthinking
- **Success Metric:** Opens app → Drags joystick → Clicks order (2-3 minutes total)

### Secondary: The Price-Conscious Student
- **Context:** Limited budget, many options in neighborhood
- **Pain Point:** Wants cheap food, hesitant about overspending
- **Behavior:** Compares prices, reads reviews, takes time
- **Goal:** Find food under a price threshold quickly
- **Success Metric:** Discovers affordable options without scanning dozens of items

### Tertiary: The Proximity-Obsessed User
- **Context:** Wants food delivered ASAP, willing to compromise on variety
- **Pain Point:** Long delivery wait times are deal-breakers
- **Behavior:** Filters by distance first
- **Goal:** Get food in <15 minutes
- **Success Metric:** Finds nearest restaurants without searching

---

## 4. UX PHILOSOPHY

### Core Principle: Gesture Over Language
- Interaction model relies on **spatial gestures** (dragging), not linguistic precision
- Users communicate via **body intuition** (position on triangle), not typed keywords
- Text input is **optional enhancement**, not required path

### Cognitive Load Reduction
- **Eliminate comparison paralysis:** Show exactly 3 dishes, not 30
- **Real-time feedback:** Joystick drag → instant intent text generation
- **Physical affordances:** Shadows respond to interaction (psychomotor feedback)
- **Zero latency perception:** <300ms between gesture and visual response

### Micro-Copy Principles
- **Directness:** "BẠN MUỐN ĂN GÌ? DỊCH CHUYỂN NÚT ĐỂ CHỌN KHẨU VỊ" (not "Adjust preferences")
- **Urgency:** "AI ĐÃ CHỌN CHO BẠN" (not "Here are suggestions")
- **Action clarity:** "CHỐT MÓN NÀY" (not "Add to cart")
- **Irreverence:** Allow emoji, fragmented phrasing, slang

### Design for Distraction
Assume user is:
- Tired
- In a noisy environment
- Checking phone while doing something else
- Not interested in reading

Therefore:
- Maximize use of icons, emojis, color coding
- Keep text to 2-3 lines maximum
- Use contrast and hierarchy aggressively
- Never require scrolling on primary screens

---

## 5. ARCHITECTURAL PHILOSOPHY

### Separation of Concerns
1. **Interaction Layer** (Joystick, UI Gestures)
2. **Intent Translation Layer** (Coords → Natural Language)
3. **AI Recommendation Engine** (Scoring algorithm)
4. **Presentation Layer** (Plates, Flip cards)
5. **External Integration** (Restaurant data, ordering)

### Data Flow Pattern
```
User Gesture (joystick.x, joystick.y) 
  → Normalize to Triangle Coordinates 
  → Generate JoystickCoords { hot, cheap, near }
  → Combine with optional text input
  → Send to AI recommendation engine
  → Return sorted top-3 suggestions
  → Render PlateCards
```

### Mock vs Real API Boundary
- **During development:** Use `mockApi.ts` with hardcoded restaurant data
- **Scoring logic location:** In frontend (mockApi) during MVP; move to backend post-MVP
- **Transition strategy:** Backend endpoint replaces `getAIRecommendations()` call; interface remains identical
- **API contract:** `JoystickCoords + string` → `Suggestion[]`

### State Management Strategy
- **Joystick position state:** Client-side, updated on pointer events
- **Intent text:** Derived state (computed from joystick position + user text)
- **Recommendations:** Fetched state (cached for 5 minutes)
- **Selected plate:** UI state (which card is flipped)
- **Voice input:** Temporary state (append to intent text)

**No global state library needed for MVP.** Use React hooks and context.

---

## 6. DECISION HIERARCHY

### Design Decisions (Non-Negotiable)
1. ✅ Neo-Brutalism aesthetic (high-contrast colors, thick borders, flat shadows)
2. ✅ Triangle-based joystick model (3 axes: hot, cheap, near)
3. ✅ Exactly 3 plate recommendations (not 2, not 5)
4. ✅ 3D flip cards for AI reasoning (not expandable panels)
5. ✅ Mustard yellow primary background (#FED049)
6. ✅ Chili red CTAs (#FF4B2B)
7. ✅ Caviar black (#0C0C0C) for all text/borders
8. ✅ Space Grotesk or Clash Display for headings
9. ✅ Space Mono for data/pricing

### Functional Decisions (Defensible, Changeable)
- Voice input via Web Speech API (cost: free, risk: less reliable than proprietary STT)
- Mock API during MVP (allows parallel development with backend)
- Real-time intent text generation (cost: latency, benefit: user feedback)
- No user accounts/auth (MVP assumes anonymous single-session use)
- No favorites or history (scope: single session only)

### Technical Decisions (Justifiable)
- Next.js App Router (modern, type-safe, server components)
- TypeScript (type safety for AI agent consumption)
- Tailwind CSS (rapid styling, no custom CSS dependencies)
- SVG for triangle (scalable, interactive, accessible)
- CSS transforms for 3D flip (no external animation libraries)
- localStorage for draft intent (recover from accidental refresh)

---

## 7. PLANNING PROCESS BEFORE CODING

### Agent Checklist Before Implementation
1. **Read all 8 operating documents thoroughly** (this is your contract)
2. **Validate with specification:** Does architecture align with requirements?
3. **Identify ambiguities:** Mark any unclear requirements before coding
4. **Plan folder structure:** Map components to module boundaries
5. **Design data flow:** Trace user gesture → recommendation → UI render
6. **Identify integration points:** Where does mock API sit? Where does real API connect?
7. **Estimate complexity:** Which components have highest risk?
8. **Plan testing strategy:** What user flows must be validated?

### High-Risk Areas to Clarify
1. **Joystick coordinate normalization:** How to handle edge cases at triangle boundaries?
2. **Intent text generation:** What natural language template set should be used?
3. **Image handling:** Where do restaurant images come from? Fallback strategy?
4. **Mobile gesture handling:** Touch events vs pointer events?
5. **Voice input fallback:** What if Web Speech API not supported?
6. **Loading states:** How long should mock API delay be (1.2s specified)?
7. **Error states:** No error handling specified; assume happy path only?
8. **Accessibility:** WCAG compliance expected? (Brutalism aesthetic makes this hard)

### Code Review Readiness
Before writing code, ensure you can answer:
- How will I test this component in isolation?
- Where does this component's data come from?
- What props are required vs optional?
- How does this interact with joystick state?
- What happens if API is slow?

---

## 8. REVIEW PROCESS AFTER CODING

### Self-Review Before Submission (AI Agent Accountability)
After implementation, **agent must execute REVIEW_CHECKLIST.md** and provide evidence for each category.

Failure to pass review = return for rework.

### Review Gates
1. **Product Alignment:** Does implementation match stated requirements?
2. **UX Validation:** Does workflow match the 30-second decision model?
3. **Design System Integrity:** Do colors, spacing, typography match rules?
4. **Performance:** Joystick drag is smooth? API response <2s?
5. **Type Safety:** All TypeScript files compile with zero errors?
6. **Accessibility:** Can keyboard users complete primary flow?
7. **Mobile:** Does gesture work on touch devices?

### Anti-Patterns to Eliminate
- ❌ Using component libraries (shadcn/ui, etc.) if they violate Neo-Brutalism
- ❌ Adding UI state not explicitly required
- ❌ Complex state management (Context > Redux)
- ❌ Premature optimization
- ❌ Overengineered scoring algorithm (mock is sufficient)
- ❌ Missing error boundaries
- ❌ Hardcoding restaurant data in components

---

## 9. DEFINITION OF DONE (DoD)

### MVP is complete when:

#### Functional Requirements Met
- [ ] Joystick triangle renders with correct dimensions and colors
- [ ] Dragging joystick within triangle boundaries updates coordinates
- [ ] Real-time intent text updates as joystick moves
- [ ] Optional text input field appears and accepts input
- [ ] "Get suggestions" button triggers API call
- [ ] 3 recommendations appear within 2 seconds
- [ ] Each plate card displays: image, dish name, restaurant, price, distance, ETA
- [ ] Clicking plate flips card to show AI reasoning
- [ ] Flipped card shows "Why AI chose" text and red CTA button
- [ ] Voice input button appears (optional enhancement)
- [ ] Voice input appends to intent text when working

#### Design Requirements Met
- [ ] Colors exactly match spec (#FED049, #FF4B2B, #0C0C0C, #FAF6F0)
- [ ] Borders are `border-4` thick, all black
- [ ] Shadows use flat offsets `shadow-[6px_6px_0px_0px_#0C0C0C]`
- [ ] Hover state shrinks shadow to `shadow-[2px_2px_0px_0px_#0C0C0C]`
- [ ] Typography uses Space Grotesk/Clash for headings
- [ ] Typography uses Space Mono for numeric data
- [ ] No rounded corners on intentional UI elements
- [ ] No gradient backgrounds
- [ ] No purple colors anywhere
- [ ] No Inter font

#### Technical Requirements Met
- [ ] All TypeScript files pass type checking
- [ ] No console errors in browser
- [ ] No console warnings
- [ ] API calls are abstracted in mockApi.ts
- [ ] Easy to swap mock for real backend API
- [ ] Components receive data via props (no direct API calls)
- [ ] Joystick state managed at page level, passed down
- [ ] Touch events work on mobile
- [ ] No external animation libraries used
- [ ] CSS-only 3D transforms for card flip

#### Code Quality Requirements Met
- [ ] No commented-out code
- [ ] No magic numbers (constants defined)
- [ ] Function names are self-documenting
- [ ] Components have clear responsibilities
- [ ] No prop drilling (Context OK for joystick state)
- [ ] Error boundary wrapper around main component
- [ ] Responsive design without breakpoint hell

#### Testing Requirements Met
- [ ] Primary user flow works: drag joystick → get suggestions → click plate → see details
- [ ] Keyboard users can complete flow with Tab/Enter
- [ ] No crashes on invalid input
- [ ] API failure gracefully degrades (shows cached results or error message)
- [ ] Works on phone-sized viewport
- [ ] Voice input gracefully skips if API not supported

#### Documentation Requirements Met
- [ ] Component exports are exported as named exports
- [ ] Prop types are explicitly defined (no `any`)
- [ ] API interface types match mockApi.ts contracts
- [ ] Comments explain WHY, not WHAT
- [ ] README contains quick-start instructions

---

## 10. AGENT INSTRUCTIONS FOR THIS SYSTEM

### You are building for autonomous AI agents. Therefore:

1. **Be Explicit:** Avoid implicit behavior. An AI reading your code should immediately understand intent.

2. **Use Interfaces Heavily:** Every data structure should have a TypeScript interface. Agents learn via types.

3. **Document Integration Points:** Mark clearly where mock API connects to real API. Show the contract.

4. **Test via User Flows:** AI agents should validate code via actual user scenarios, not unit tests.

5. **Avoid Overengineering:** Simpler code is easier for agents to understand and modify. Prefer straightforward solutions.

6. **Make Failures Obvious:** Use error boundaries. Log errors. Agents need to know what breaks.

7. **Preserve Simplicity:** Every new dependency is a question mark for the next agent. Justify all imports.

8. **Name Things Clearly:** `JoystickCoords`, not `Coords`. `PlateCard`, not `Card`. Agents should know what everything is.

9. **Provide Examples in Comments:** If something is non-obvious, show usage pattern.

10. **Never Surprise:** Follow conventions. No clever hacks. No implicit dependencies. No surprise behavior.

---

## END OF OPERATING SYSTEM MANUAL

This document defines the **contract** between human product definition and AI implementation agents.

Agents must read, understand, and adhere to these principles before writing code.

Deviation from this system requires explicit approval (edit this file and add rationale).
