# NEXTJS_RULES.md

Technical rules for Next.js App Router implementation.

---

## 1. PROJECT SETUP RULES

### Technology Stack (Non-Negotiable)
- **Framework:** Next.js App Router (latest stable)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS (v3+)
- **Package Manager:** npm or pnpm
- **Node Version:** 18.17+ (LTS)

### Forbidden Dependencies
- ❌ shadcn/ui (may violate Brutalism)
- ❌ Animation libraries (Framer Motion, anime.js)
- ❌ State management (Redux, Zustand, Jotai)
- ❌ UI kits (Material-UI, Chakra)
- ❌ Complex form libraries (React Hook Form for MVP)

### Allowed Dependencies
- ✅ Next.js Image (built-in)
- ✅ Next.js Font optimization (next/font)
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ react (latest)
- ✅ react-dom (latest)

### Folder Structure (Opinionated)
```
app/
├── page.tsx                   # Root page (SuggesterPage component)
├── layout.tsx                 # Root layout with metadata
├── globals.css                # Tailwind directives
├── fonts/
│   └── fonts.ts               # Font configuration (Space Grotesk, Space Mono)
│
components/
├── JoystickSection.tsx
├── HungerTriangle.tsx
├── IntentBillboard.tsx
├── TextInput.tsx
├── MicrophoneButton.tsx
├── GetSuggestionsButton.tsx
├── RecommendationsSection.tsx
├── PlateCard.tsx
├── PlateFront.tsx             # Sub-component of PlateCard
├── PlateBack.tsx              # Sub-component of PlateCard
└── index.ts                   # Re-export all components

hooks/
├── useJoystick.ts            # (Optional) Extract joystick logic to hook
├── useSpeechToText.ts         # Web Speech API hook
└── useCoordinateNormalization.ts  # (Optional) Triangle math

utils/
├── mockApi.ts                 # Mock API (move to lib/api post-MVP)
├── intentGenerator.ts         # Intent text generation logic
├── types.ts                   # Shared TypeScript types
└── constants.ts               # Magic numbers, colors, strings

public/
└── (no static assets for MVP; use image URLs)

.env.local                      # (Future) API endpoint, feature flags
.env.example                    # Template for .env.local
```

---

## 2. FILE NAMING CONVENTIONS

### Component Files
- **Format:** `PascalCase.tsx` (always)
- **Examples:** `HungerTriangle.tsx`, `PlateCard.tsx`, `IntentBillboard.tsx`
- **Sub-components:** `PlateCard.tsx` exports `<PlateCard>`, `<PlateFront>`, `<PlateBack>` (no separate files unless reused)

### Hook Files
- **Format:** `useXxx.ts` (lowercase "use" prefix)
- **Examples:** `useSpeechToText.ts`, `useJoystick.ts`
- **Not TSX** — hooks are functions, not JSX

### Utility Files
- **Format:** `camelCase.ts` (not TSX)
- **Examples:** `mockApi.ts`, `intentGenerator.ts`, `types.ts`

### Type/Interface Files
- **Format:** Keep types close to usage. Define in `types.ts` or at top of component file.
- **Naming:** `interface PascalCase { }`, `type camelCaseType = { }`
- **Examples:**
  ```typescript
  interface JoystickCoords { ... }
  interface Suggestion { ... }
  type Mode = 'joystick' | 'recommendations' | 'flipped';
  ```

---

## 3. SERVER VS CLIENT COMPONENTS (App Router)

### Root Component (`app/page.tsx`)
**Must be Client Component:**
```typescript
'use client'; // Always needed for interactivity

import SuggesterPage from '@/components/SuggesterPage';

export default function Home() {
  return <SuggesterPage />;
}
```

### All Leaf Components
**Must be Client Components:**
- `JoystickSection`, `HungerTriangle`, `IntentBillboard`, `TextInput`, `MicrophoneButton`
- All need `'use client'` directive

**Why:** Pointer events, state management, Web Speech API all require client-side runtime.

### Layout (`app/layout.tsx`)
**Can be Server Component:**
```typescript
// No 'use client' needed
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ShopeeFood AI Suggester',
  description: 'Get food recommendations in 30 seconds',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <style>{`* { margin: 0; padding: 0; box-sizing: border-box; }`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 4. TYPESCRIPT RULES

### Strict Mode (Required)
In `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### Type Definition Placement
```typescript
// ✅ GOOD: In same file (small types)
'use client';
import { ReactNode } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  isLoading?: boolean;
}

export function MyButton({ label, onClick, isLoading }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

```typescript
// ✅ GOOD: In types.ts (shared types)
// components/HungerTriangle.tsx
import { JoystickCoords } from '@/utils/types';

interface HungerTriangleProps {
  coords: JoystickCoords;
  onCoordsChange: (coords: JoystickCoords) => void;
}
```

### Type Exports
```typescript
// utils/types.ts
export interface JoystickCoords {
  hot: number;
  cheap: number;
  near: number;
}

export interface Suggestion {
  restaurant_id: string;
  restaurant_name: string;
  dish_name: string;
  price: number;
  distance_km: number;
  eta_minutes: number;
  reason: string;
  image_url: string;
}

export type Mode = 'joystick' | 'recommendations' | 'flipped';
```

### Avoid `any` Type
```typescript
// ❌ WRONG
const handlePointerMove = (event: any) => { ... };

// ✅ CORRECT
const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => { ... };
```

### Component Props Type
```typescript
// ✅ GOOD: Explicit interface
interface PlateCardProps {
  suggestion: Suggestion;
  isFront: boolean;
  onClick: () => void;
}

export function PlateCard({ suggestion, isFront, onClick }: PlateCardProps) {
  return <div onClick={onClick}>...</div>;
}
```

---

## 5. API CONTRACT (Critical for Backend Integration)

### API Endpoint Contract (Frontend ↔ Backend)
**This matches hackathon_brainstorm_plan.md Section 2 exactly.**

#### Request (Next.js Frontend → FastAPI Backend)
**POST** to `${NEXT_PUBLIC_API_URL}/api/recommend`

```json
{
  "message": "món gì nóng nóng rẻ rẻ gần đây, không cay nha",
  "coords": {
    "hot": 0.8,
    "cheap": 0.9,
    "near": 0.7
  },
  "user_location": {
    "lat": 10.762622,
    "lng": 106.660172
  }
}
```

#### Response (FastAPI Backend → Next.js Frontend)
```json
{
  "action": "suggest",
  "clarify_question": "",
  "suggestions": [
    {
      "restaurant_id": "res_001",
      "restaurant_name": "Bún Bò Cô Ba",
      "dish_name": "Bún Bò Nạm Lớn",
      "price": 45000,
      "distance_km": 0.8,
      "eta_minutes": 15,
      "reason": "Món nước nóng hổi đúng ý bạn, giá 45k (< 50k) và chỉ cách 0.8km.",
      "image_url": "https://images.unsplash.com/..."
    }
  ]
}
```

**Note:** If `action` is `"clarify"`, `suggestions` array is empty and `clarify_question` contains the AI's follow-up question.

### Backend Deployment (Hackathon Context)
From hackathon_brainstorm_plan.md:
- **Render.com:** Free tier, auto-deploy from GitHub (may have 15-50s cold start)
- **Hugging Face Spaces:** Free tier with Docker (typically faster)
- Both support environment variables for `GEMINI_API_KEY` or `OPENAI_API_KEY`

### Environment Setup
```bash
# .env.local (Frontend)
NEXT_PUBLIC_API_URL=http://localhost:8000        # (dev)
# or
NEXT_PUBLIC_API_URL=https://backend-app.onrender.com  # (prod)
```

---

## 6. CLIENT COMPONENT BEST PRACTICES

### `'use client'` Directive
- Place at **very top of file**, before any imports
- Apply only to components that need client features (state, events, browser APIs)
- Layout and page-level wrappers are often Server Components, but page content is Client

```typescript
'use client'; // ← First line

import React, { useState } from 'react';
import HungerTriangle from '@/components/HungerTriangle';

export default function SuggesterPage() {
  const [coords, setCoords] = useState({ hot: 0, cheap: 0, near: 0 });
  // ...
}
```

### Event Handlers in Client Components
```typescript
'use client';

export function TextInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Validate length
    const newValue = e.target.value.slice(0, 200);
    onChange(newValue);
  };

  return <input value={value} onChange={handleChange} />;
}
```

### Browser APIs (localStorage, window, etc.)
```typescript
'use client';
import { useEffect } from 'react';

export function MyComponent() {
  useEffect(() => {
    // Browser APIs only in useEffect (hydration-safe)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('myKey');
      // ...
    }
  }, []);

  return <div>...</div>;
}
```

---

## 6. DATA FETCHING PATTERNS (MVP)

### Mock API (During MVP)
**File:** `utils/mockApi.ts`

```typescript
// utils/mockApi.ts
import { JoystickCoords, Suggestion } from './types';

const mockRestaurants: Suggestion[] = [
  // hardcoded data from spec
];

export const getAIRecommendations = async (
  coords: JoystickCoords,
  message: string
): Promise<Suggestion[]> => {
  // Simulate 1.2s latency
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Scoring algorithm (from spec)
  const scored = mockRestaurants.map((r) => {
    let score = 0;
    // ... scoring logic ...
    return { restaurant: r, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((item) => item.restaurant);
};
```

### Calling Mock API from Client Component
```typescript
'use client';
import { useState } from 'react';
import { getAIRecommendations } from '@/utils/mockApi';
import { Suggestion, JoystickCoords } from '@/utils/types';

export default function SuggesterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const handleGetSuggestions = async (coords: JoystickCoords, text: string) => {
    setIsLoading(true);
    try {
      const result = await getAIRecommendations(coords, text);
      setSuggestions(result);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      // Show error UI
    } finally {
      setIsLoading(false);
    }
  };

  return <div>{/* JSX */}</div>;
}
```

### Post-MVP: Transition to Real FastAPI Backend

**Backend Deployment (Hackathon Option):**
- **Render.com:** Free tier with auto-deploy from GitHub (15 min cold start)
- **Hugging Face Spaces:** Free tier with Docker support (no cold start)

**Backend Endpoint (FastAPI):**
```python
# Backend: FastAPI main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.vercel.app", "http://localhost:3000"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

@app.post("/api/recommend")
async def recommend(request: RecommendRequest) -> RecommendResponse:
    # 1. Pre-filter restaurants by distance & price
    # 2. Call LLM (Gemini/OpenAI) to select top 3
    # 3. Return structured response
    return response
```

**Frontend Client Call (same interface as mock):**
```typescript
// utils/api.ts (replaces mockApi.ts)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const getAIRecommendations = async (
  coords: JoystickCoords,
  message: string
): Promise<Suggestion[]> => {
  const response = await fetch(`${API_URL}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coords, message }),
  });
  
  if (!response.ok) throw new Error('API call failed');
  const data = await response.json();
  return data.suggestions;
};
```

---

## 7. FORM HANDLING & SUBMISSION

### Form Submission (No React Hook Form for MVP)
```typescript
'use client';
import { useState } from 'react';

export default function SuggesterPage() {
  const [joystickCoords, setJoystickCoords] = useState({ hot: 0, cheap: 0, near: 0 });
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    setIsLoading(true);
    try {
      const suggestions = await getAIRecommendations(joystickCoords, textInput);
      // Update UI
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Joystick input */}
      {/* Text input */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Get Suggestions'}
      </button>
    </form>
  );
}
```

### Input Validation (Lightweight)
```typescript
const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value;
  
  // Only enforce character limit
  if (value.length > 200) {
    value = value.slice(0, 200);
  }
  
  setTextInput(value);
};
```

---

## 8. ERROR HANDLING

### Error Boundaries (Optional, React 18+)
```typescript
// components/ErrorBoundary.tsx
'use client';

import { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border-4 border-[#0C0C0C] p-6 bg-[#FAF6F0]">
          <p className="text-[#0C0C0C] font-bold">⚠️ Something went wrong</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Fetch Error Handling
```typescript
const handleGetSuggestions = async (coords: JoystickCoords, text: string) => {
  setIsLoading(true);
  setError(null);
  
  try {
    const result = await getAIRecommendations(coords, text);
    setSuggestions(result);
  } catch (error) {
    setError(`Failed to get recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('API Error:', error);
  } finally {
    setIsLoading(false);
  }
};
```

### Loading States
```typescript
<button disabled={isLoading} className={isLoading ? 'opacity-60' : ''}>
  {isLoading ? '⏳ AI ĐANG SUY NGHĨ...' : '✨ GỢI Ý MÓN NGAY CHO TÔI'}
</button>
```

---

## 9. STYLING WITH TAILWIND

### Arbitrary Color Values
```typescript
// Use arbitrary values for custom colors
<div className="bg-[#FED049] border-4 border-[#0C0C0C]">
  <p className="text-[#0C0C0C]">Hello</p>
</div>
```

### Arbitrary Shadow Values
```typescript
<button className="shadow-[6px_6px_0px_0px_#0C0C0C] hover:shadow-[2px_2px_0px_0px_#0C0C0C]">
  Click me
</button>
```

### No Custom CSS Files (MVP)
- All styling via Tailwind classes
- Exception: `app/globals.css` for Tailwind directives and resets

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Optional: global resets */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-family: 'Space Mono', monospace;
}
```

### Conditional Classes
```typescript
const buttonClass = `
  px-4 py-3
  border-4 border-[#0C0C0C]
  ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
  ${isFront ? 'rotate-y-0' : 'rotate-y-180'}
  transition-transform duration-500
`;

return <button className={buttonClass}>Click</button>;
```

---

## 10. IMAGE HANDLING

### Using Next.js Image Component (Recommended)
```typescript
import Image from 'next/image';

export function PlateCard({ suggestion }: { suggestion: Suggestion }) {
  return (
    <Image
      src={suggestion.image_url}
      alt={suggestion.dish_name}
      width={300}
      height={300}
      priority={false}
      loading="lazy"
      className="rounded-full object-cover"
    />
  );
}
```

### Fallback for Failed Images
```typescript
const [imageError, setImageError] = useState(false);

<img
  src={suggestion.image_url}
  alt={suggestion.dish_name}
  onError={() => setImageError(true)}
  className={imageError ? 'bg-[#FAF6F0]' : ''}
/>
```

---

## 11. FONT LOADING

### Space Grotesk & Space Mono from Google Fonts
```typescript
// app/fonts.ts
import { Space_Grotesk, Space_Mono } from 'next/font/google';

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
  variable: '--font-space-grotesk',
});

export const spaceMono = Space_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
});
```

```typescript
// app/layout.tsx
import { spaceGrotesk, spaceMono } from './fonts';

export default function RootLayout({ children }) {
  return (
    <html className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body className="font-[family-name:var(--font-space-mono)]">{children}</body>
    </html>
  );
}
```

---

## 12. ROUTE HANDLERS (Future Use)

### Example: Real API Endpoint
```typescript
// app/api/recommend/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { coords, message } = await req.json();
    
    // Validate input
    if (!coords || typeof coords.hot !== 'number') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Call external API (e.g., FastAPI backend)
    const response = await fetch('https://api.backend.com/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coords, message }),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## 13. ENVIRONMENT VARIABLES

### .env.local
```
# .env.local (not committed)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MOCK_MODE=true
```

### Usage in Code
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const USE_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

const getRecommendations = async (coords, message) => {
  if (USE_MOCK) {
    return mockApi.getAIRecommendations(coords, message);
  }

  const response = await fetch(`${API_URL}/api/recommend`, {
    method: 'POST',
    body: JSON.stringify({ coords, message }),
  });
  return response.json();
};
```

---

## 14. ANTI-PATTERNS (What NOT to Do)

| Anti-Pattern | Why | What to Do |
|--------------|-----|-----------|
| Server Components calling DB without await | Causes hydration mismatch | Always await server operations |
| Mixing state logic across components | Unmaintainable | Lift state to common parent |
| Using `any` type | Loss of type safety | Define explicit interfaces |
| Inline event handlers every render | Performance | Use `useCallback` or stable function refs |
| Direct DOM manipulation (document.querySelector) | React anti-pattern | Use refs or state |
| CSS-in-JS with styled-components | Unnecessary for MVP | Use Tailwind only |
| Props spreading ({...props}) | Opaque prop passing | Explicit prop destructuring |
| Creating objects in render body | Memory waste | Move to constants or useMemo |
| Async operations in useEffect cleanup | Race conditions | Use AbortController |
| useState(async function) | Not valid | Define async outside, call inside useEffect |

---

## 15. TESTING STRATEGY (Post-MVP)

### Unit Testing (Vitest + React Testing Library)
```typescript
// components/HungerTriangle.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { HungerTriangle } from '@/components/HungerTriangle';

describe('HungerTriangle', () => {
  it('updates coordinates when dragged', () => {
    const handleCoords = jest.fn();
    const { container } = render(
      <HungerTriangle coords={{ hot: 0, cheap: 0, near: 0 }} onCoordsChange={handleCoords} />
    );

    const svg = container.querySelector('svg');
    fireEvent.pointerDown(svg);
    fireEvent.pointerMove(svg, { clientX: 150, clientY: 100 });
    fireEvent.pointerUp(svg);

    expect(handleCoords).toHaveBeenCalled();
  });
});
```

### E2E Testing (Playwright)
```typescript
// e2e/user-flow.spec.ts
import { test, expect } from '@playwright/test';

test('happy path: joystick to order', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Drag joystick
  const triangle = await page.$('svg');
  await page.dragAndDrop(triangle, { x: 200, y: 200 });
  
  // Enter text
  await page.fill('input', 'phở');
  
  // Click submit
  await page.click('button:text("GỚI Ý")');
  
  // Wait for recommendations
  const plates = await page.locator('[data-testid="plate"]').count();
  expect(plates).toBe(3);
  
  // Click flip
  await page.click('[data-testid="plate"]:first-child');
  await expect(page.locator('text=TẠI SAO AI CHỌN')).toBeVisible();
});
```

---

## END OF NEXTJS RULES

All Next.js code must conform to these rules.

Agents should refer to this document before writing any TypeScript/JSX.
