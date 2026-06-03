# FRONTEND_ARCHITECTURE.md

Frontend architecture, module organization, and integration strategy.

---

## 1. FOLDER STRUCTURE (Detailed)

```
project-root/
│
├── app/
│   ├── page.tsx              # Root page (SuggesterPage container)
│   ├── layout.tsx            # Root HTML layout, fonts
│   ├── globals.css           # Tailwind directives
│   ├── fonts/
│   │   └── index.ts          # Space Grotesk, Space Mono imports
│   └── (optional) error.tsx  # Error boundary
│
├── components/
│   ├── index.ts              # Named exports (for clean imports)
│   │
│   ├── SuggesterPage.tsx     # Page-level component (state mgmt)
│   │
│   ├── JoystickSection.tsx   # Container for joystick inputs
│   ├── HungerTriangle.tsx    # SVG interactive triangle
│   ├── IntentBillboard.tsx   # Auto-generated intent text display
│   ├── TextInput.tsx         # Supplementary text input field
│   ├── MicrophoneButton.tsx  # Voice input button
│   │
│   ├── GetSuggestionsButton.tsx # Main CTA button
│   │
│   ├── RecommendationsSection.tsx # Container for results
│   ├── PlateCard.tsx         # 3D flip card (front + back)
│   │   ├── PlateFront.tsx    # (Sub-component inside PlateCard)
│   │   └── PlateBack.tsx     # (Sub-component inside PlateCard)
│   │
│   ├── BackButton.tsx        # Return to joystick
│   ├── ChangeRecButton.tsx   # Re-roll recommendations (optional)
│   └── BudgetFilterButton.tsx # Budget slider (optional)
│
├── hooks/
│   ├── useSpeechToText.ts    # Web Speech API hook
│   ├── useJoystick.ts        # (Optional) Joystick state logic
│   └── useCoordinateNormalization.ts  # (Optional) Triangle math
│
├── utils/
│   ├── types.ts              # Shared TypeScript interfaces
│   ├── constants.ts          # Colors, spacing, magic numbers
│   ├── mockApi.ts            # Mock API during development
│   └── intentGenerator.ts    # Intent text generation logic
│
├── lib/
│   └── (future) api.ts       # Real API calls (post-MVP)
│
├── public/
│   └── (empty for MVP; images come from URLs)
│
├── .env.local                # (Not committed) API endpoint
├── .env.example              # Template
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind customization
├── tsconfig.json             # TypeScript config (strict)
├── package.json
└── README.md
```

---

## 2. MODULE BOUNDARIES & RESPONSIBILITIES

### Boundary 1: Presentation vs Data
```
┌─────────────────────────────────────────────────────────┐
│ SuggesterPage (Data & State Management)                 │
│  - joystickCoords state                                 │
│  - textInput state                                      │
│  - suggestions state                                    │
│  - API calls to mockApi.getAIRecommendations()          │
│  - Controls mode: joystick | recommendations | flipped  │
└─────────────────────────────────────────────────────────┘
            ↓ Props & Callbacks ↓
┌─────────────────────────────────────────────────────────┐
│ JoystickSection & RecommendationsSection (UI Only)      │
│  - Receive state as props                               │
│  - No state creation (except internal UI state)         │
│  - Call parent callbacks on user action                 │
└─────────────────────────────────────────────────────────┘
```

### Boundary 2: Interactive vs Static
```
Interactive Components (Client):
- HungerTriangle (pointer events)
- TextInput (form input)
- MicrophoneButton (Web Speech API)
- PlateCard (click to flip)
- All buttons (click handlers)

Static Components (Presentational):
- PlateFront (display)
- PlateBack (display)
- IntentBillboard (computed display)
```

### Boundary 3: API vs UI
```
┌──────────────────────────────────────────┐
│ utils/mockApi.ts                         │
│  - Scoring algorithm                     │
│  - Mock restaurant data                  │
│  - Latency simulation (1.2s)             │
│  - Export: getAIRecommendations()        │
└──────────────────────────────────────────┘
            ↓ Import in ↓
┌──────────────────────────────────────────┐
│ components/SuggesterPage.tsx             │
│  - Calls mockApi.getAIRecommendations()  │
│  - Handles response as state             │
│  - Easy to swap with real API (same sig) │
└──────────────────────────────────────────┘
```

---

## 3. STATE MANAGEMENT STRATEGY

### State Hierarchy
```
SuggesterPage (Root)
├── joystickCoords: JoystickCoords       // Controlled input
│   └── Updated by HungerTriangle via callback
│
├── textInput: string                    // Controlled input
│   └── Updated by TextInput & MicrophoneButton via callbacks
│
├── suggestions: Suggestion[]            // API response
│   └── Updated by handleGetSuggestions
│
├── isLoading: boolean                   // API state
│   └── Updated before/after API call
│
├── mode: 'joystick' | 'recommendations' | 'flipped'
│   └── Controls which UI section renders
│
└── flippedPlateId: string | null        // Which plate is flipped
    └── Updated when user clicks plate
```

### No Redux/Zustand (MVP Constraint)
- React hooks sufficient
- Props passing is clear and traceable
- Future enhancement: extract to Context if >10 nested props

### localStorage Strategy (Optional)
```typescript
// Save draft intent on change
useEffect(() => {
  localStorage.setItem('draft:intent', textInput);
}, [textInput]);

// Restore on page load
useEffect(() => {
  const saved = localStorage.getItem('draft:intent');
  if (saved) setTextInput(saved);
}, []);
```

---

## 4. DATA FLOW PATTERNS

### Pattern 1: Joystick Drag → Coordinate Update → Intent Text Update
```
User drags emoji in HungerTriangle
  ↓
HungerTriangle.onPointerMove()
  ↓
calculateTriangleCoords() → { hot, cheap, near }
  ↓
HungerTriangle calls onCoordsChange(coords)
  ↓
SuggesterPage.setJoystickCoords(coords)
  ↓
Re-render JoystickSection with new coords
  ↓
IntentBillboard receives coords
  ↓
generateIntentText(coords) → "Tôi muốn ăn nóng"
  ↓
IntentBillboard displays text
```

### Pattern 2: Button Click → API Call → Show Results
```
User clicks "GỚI Ý MÓN NGAY CHO TÔI"
  ↓
GetSuggestionsButton.onClick()
  ↓
SuggesterPage.handleGetSuggestions(coords, textInput)
  ↓
setIsLoading(true)
  ↓
mockApi.getAIRecommendations(coords, textInput)
  ↓ (await 1.2s)
  ↓
setSuggestions(result)
  ↓
setMode('recommendations')
  ↓
RecommendationsSection renders with 3 PlateCards
```

### Pattern 3: Plate Click → Flip Animation → Show AI Reasoning
```
User clicks PlateCard 1
  ↓
PlateCard.onClick()
  ↓
calls onFlip() prop callback
  ↓
SuggesterPage.setFlippedPlateId(restaurant_id)
  ↓
PlateCard receives isFront={false}
  ↓
CSS transform: rotateY(0deg) → rotateY(180deg)
  ↓
Back face visible with AI reasoning + CTA
```

---

## 5. API INTEGRATION STRATEGY

### During MVP: Mock API
**Location:** `utils/mockApi.ts`

```typescript
export const getAIRecommendations = async (
  coords: JoystickCoords,
  message: string
): Promise<Suggestion[]> => {
  // Fake latency for realism
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Score mockRestaurants based on coords + message
  // Return top 3

  return topThree;
};
```

**Usage:**
```typescript
// SuggesterPage.tsx
const handleGetSuggestions = async () => {
  setIsLoading(true);
  const result = await getAIRecommendations(joystickCoords, textInput);
  setSuggestions(result);
  setMode('recommendations');
  setIsLoading(false);
};
```

### Post-MVP: Real Backend (FastAPI)
**Changes Required:**

1. **Create Route Handler:**
```typescript
// app/api/recommend/route.ts
export async function POST(req: NextRequest) {
  const { coords, message } = await req.json();
  const response = await fetch('https://backend.api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coords, message }),
  });
  return response.json();
}
```

2. **Update Client Call (Interface Unchanged):**
```typescript
// utils/mockApi.ts → utils/api.ts (renamed)
export const getAIRecommendations = async (
  coords: JoystickCoords,
  message: string
): Promise<Suggestion[]> => {
  const response = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coords, message }),
  });
  return response.json();
};
```

3. **No UI changes needed** — same function signature

### Caching Strategy
```typescript
// Simple in-memory cache during session
const recommendationCache = new Map<string, Suggestion[]>();

export const getAIRecommendations = async (
  coords: JoystickCoords,
  message: string
): Promise<Suggestion[]> => {
  const cacheKey = JSON.stringify({ coords, message });
  
  if (recommendationCache.has(cacheKey)) {
    return recommendationCache.get(cacheKey)!;
  }

  // Fetch...
  const result = await fetch('/api/recommend', { /* ... */ });
  recommendationCache.set(cacheKey, result);
  
  return result;
};
```

---

## 6. REVALIDATION STRATEGY

### No Revalidation During MVP
- Mock API = instant response
- Real backend: add cache headers if needed

### Example (Post-MVP)
```typescript
// app/api/recommend/route.ts
export async function POST(req: NextRequest) {
  // ... handle request ...

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'private, max-age=300', // 5 minute cache
    },
  });
}
```

---

## 7. COMPONENT ORGANIZATION STRATEGY

### Co-location Rules
```
✅ GOOD:
components/
├── PlateCard.tsx          // Exports PlateCard, PlateFront, PlateBack
├── HungerTriangle.tsx     // Only HungerTriangle
└── MicrophoneButton.tsx   // Only MicrophoneButton

❌ WRONG:
components/
├── Plate/
│   ├── Card.tsx
│   ├── Front.tsx
│   └── Back.tsx           // Over-nested
├── Triangle.tsx
└── Voice/
    └── Button.tsx         // Unnecessary folder
```

### Naming Convention
- **Components:** PascalCase, matches filename
- **Props:** `interface ComponentNameProps`
- **Handlers:** `handle{ActionName}` or `on{ActionName}`

### Export Strategy
```typescript
// components/index.ts (Optional, clean imports)
export { SuggesterPage } from './SuggesterPage';
export { JoystickSection } from './JoystickSection';
export { HungerTriangle } from './HungerTriangle';
// ... etc ...

// Usage in SuggesterPage:
import { HungerTriangle, IntentBillboard } from '@/components';
```

---

## 8. CROSS-CUTTING CONCERNS

### Logging & Debugging
```typescript
// utils/constants.ts
export const DEBUG = process.env.NODE_ENV === 'development';

// In components:
if (DEBUG) console.log('Coordinates updated:', coords);
```

### Error Handling
```typescript
// Global error boundary in layout
import { ErrorBoundary } from '@/components';

export default function RootLayout({ children }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
```

### Accessibility
- All buttons have `onClick` + `onKeyDown` (for Enter)
- All inputs have labels (visible or ARIA)
- All images have alt text
- Focus indicators visible (outline or custom)

### Performance
- Image lazy loading (`loading="lazy"`)
- No unnecessary re-renders (use `React.memo` if needed)
- Event handler memoization with `useCallback` (if >10 renders/sec)

---

## 9. DEPENDENCY INJECTION (Advanced Pattern)

### Example: Swap Mock API for Real API
```typescript
// utils/api.ts
type RecommendationFn = (
  coords: JoystickCoords,
  message: string
) => Promise<Suggestion[]>;

let getAIRecommendations: RecommendationFn;

if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
  getAIRecommendations = mockApi.getAIRecommendations;
} else {
  getAIRecommendations = realApi.getAIRecommendations;
}

export { getAIRecommendations };
```

### Example: Inject Mock Data for Testing
```typescript
// components/PlateCard.tsx (testable)
interface PlateCardProps {
  suggestion: Suggestion;
  isFront: boolean;
  onClick: () => void;
  mockSuggestions?: Suggestion[]; // For testing
}

export function PlateCard({
  suggestion,
  isFront,
  onClick,
  mockSuggestions = [], // Default empty
}: PlateCardProps) {
  const data = mockSuggestions.length ? mockSuggestions[0] : suggestion;
  return <div>...</div>;
}
```

---

## 10. TESTING STRATEGY OUTLINE (Post-MVP)

### Unit Tests (Vitest)
```
components/__tests__/
├── HungerTriangle.test.tsx   (Coordinate calculation)
├── IntentBillboard.test.tsx  (Text generation)
├── PlateCard.test.tsx        (Flip animation)
└── MicrophoneButton.test.tsx (Voice API mock)

utils/__tests__/
├── intentGenerator.test.ts
└── mockApi.test.ts
```

### Integration Tests (Playwright)
```
e2e/
├── joystick-flow.spec.ts      (User drags joystick)
├── recommendation-flow.spec.ts (Button click → results)
├── voice-input.spec.ts         (Microphone use)
└── flip-card.spec.ts           (Plate flip animation)
```

### Test Coverage Goals
- Components: >80% coverage
- Utils: >90% coverage (pure functions)
- E2E: 3-5 critical user flows

---

## 11. DEPLOYMENT ARCHITECTURE

### Hosting
- **Platform:** Vercel (Next.js native)
- **Build:** `npm run build` (Next.js optimizations)
- **Runtime:** Node.js 18+

### Environment Setup
```
Development:
- NEXT_PUBLIC_USE_MOCK=true
- NEXT_PUBLIC_API_URL=http://localhost:8000

Staging:
- NEXT_PUBLIC_USE_MOCK=false
- NEXT_PUBLIC_API_URL=https://staging-api.example.com

Production:
- NEXT_PUBLIC_USE_MOCK=false
- NEXT_PUBLIC_API_URL=https://api.example.com
```

### Build Optimization
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'api.example.com' }, // Restaurant images
    ],
  },
  swcMinify: true, // Minify with SWC
  compress: true,  // Gzip compression
};

module.exports = nextConfig;
```

---

## 12. SCALABILITY CONSIDERATIONS (Future)

### If recommendation engine grows:
- Move scoring logic to backend (Route Handler → FastAPI)
- Cache recommendations (Redis or in-memory)
- Implement pagination if >3 results needed

### If adding user accounts:
- Create `auth/` folder with NextAuth.js
- Store preferences in database
- Add user context provider

### If adding real-time updates:
- Use WebSocket (Socket.io) for live restaurant status
- Add server-sent events for order tracking
- Implement optimistic UI updates

---

## END OF FRONTEND ARCHITECTURE

This document describes the overall frontend structure and integration patterns.

Agents should refer here for architectural decisions and rationale.
