# COMPONENT_PATTERNS.md

Component architecture, responsibility matrix, and reusable patterns for Next.js app.

---

## 1. COMPONENT TREE & HIERARCHY

```
<SuggesterPage>  [Client Component]
  ├── <JoystickSection>  [Client]
  │   ├── <HungerTriangle>  [Client - SVG Interactive]
  │   ├── <IntentBillboard>  [Client - Derived State]
  │   ├── <TextInput>  [Client - Form Input]
  │   └── <MicrophoneButton>  [Client - Voice API]
  │
  ├── <GetSuggestionsButton>  [Client - Form Submission]
  │
  └── <RecommendationsSection>  [Client - Conditional]
      ├── <PlateCard>  [Client - Interactive 3D Flip] (x3)
      │   ├── <PlateFront>  [Static]
      │   └── <PlateBack>  [Static]
      │
      ├── <BackButton>  [Client - Navigation]
      ├── <ChangeRecButton>  [Optional - Client]
      └── <BudgetFilterButton>  [Optional - Client]
```

---

## 2. PAGE-LEVEL STRUCTURE

### `<SuggesterPage>` (Main Container)
**Type:** Client Component (needs interactivity)

**Responsibility:**
- Manage page-level state (joystick coords, text input, recommendations, UI mode)
- Handle API calls (getAIRecommendations)
- Control screen transitions (joystick → recommendations → flip card → joystick)
- Manage loading/error states

**State:**
```typescript
const [joystickCoords, setJoystickCoords] = useState<JoystickCoords>({ hot: 0, cheap: 0, near: 0 });
const [textInput, setTextInput] = useState<string>("");
const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
const [isLoading, setIsLoading] = useState<boolean>(false);
const [mode, setMode] = useState<'joystick' | 'recommendations' | 'flipped'>('joystick');
const [flippedPlateId, setFlippedPlateId] = useState<string | null>(null);
```

**Props:** None (root component)

**Children:**
1. JoystickSection (always visible)
2. GetSuggestionsButton (always visible in joystick mode)
3. RecommendationsSection (conditional, visible if mode === 'recommendations' or 'flipped')

**Server/Client Boundary:**
- Entire page is Client Component
- Mock API call is async (no Server Action for MVP)

---

## 3. JOYSTICK INTERACTION SECTION

### `<JoystickSection>` (Container)
**Type:** Client Component

**Responsibility:**
- Layout joystick and related inputs
- Pass handlers to child components
- Display intent billboard

**Props:**
```typescript
interface JoystickSectionProps {
  joystickCoords: JoystickCoords;
  onCoordsChange: (coords: JoystickCoords) => void;
  textInput: string;
  onTextChange: (text: string) => void;
  isLoading: boolean;
}
```

**Children:**
1. HungerTriangle (receives coords + handler)
2. IntentBillboard (receives coords + text, display only)
3. TextInput (receives value + handler)
4. MicrophoneButton (receives text + onAdd handler)

**Layout Notes:**
- HungerTriangle centered, large (300px or responsive)
- IntentBillboard below triangle, full-width with margins
- TextInput below billboard, full-width with margins
- MicrophoneButton positioned right-edge of TextInput

---

### `<HungerTriangle>` (SVG Interactive Component)
**Type:** Client Component

**Responsibility:**
- Render SVG triangle with labeled vertices
- Handle pointer events (down, move, up)
- Calculate emoji position relative to triangle
- Normalize coordinates to [0, 1] range
- Emit coordinate updates

**Props:**
```typescript
interface HungerTriangleProps {
  coords: JoystickCoords;
  onCoordsChange: (coords: JoystickCoords) => void;
}
```

**State:**
```typescript
const [isPointerDown, setIsPointerDown] = useState(false);
// All triangle geometry calculations happen in handlers
```

**Key Implementation Details:**
1. **Triangle vertices (SVG coordinates):**
   - Top: (150, 50) — "🔥 NÓNG SỐT"
   - Bottom-Left: (50, 250) — "💸 SIÊU RẺ"
   - Bottom-Right: (250, 250) — "⚡ ĂN LIỀN"

2. **Emoji position bounds:** Must stay within triangle (use barycentric coordinates or simple distance check)

3. **Coordinate normalization:**
   - hot: distance from bottom edge / max distance = higher when closer to top
   - cheap: distance from right edge / max distance = higher when closer to left
   - near: distance from left edge / max distance = higher when closer to right

4. **Event handlers:**
   ```
   onPointerDown → set isPointerDown = true, calculate initial position
   onPointerMove → if isPointerDown, update emoji position, recalculate coords, emit onCoordsChange
   onPointerUp → set isPointerDown = false
   onTouchMove → same as onPointerMove (Pointer Events cover both)
   ```

5. **No debouncing** — emit every move event (real-time feedback)

**Styling:**
- SVG with explicit width/height (300x300px or responsive wrapper)
- Triangle outline: stroke 3px #0C0C0C, fill transparent
- Vertex labels: Space Grotesk Bold, 16px, #0C0C0C
- Emoji: 😋, font-size 48px, positioned absolutely or via SVG `text`

**Constraints:**
- Zero external dependencies (vanilla SVG + React hooks)
- Must support touch events (pointer events API)
- No animation library

---

### `<IntentBillboard>` (Display Component)
**Type:** Client Component (for typewriter effect animation, if implemented)

**Responsibility:**
- Display auto-generated intent text
- Update in real-time as joystick moves
- Generate natural language from coordinates

**Props:**
```typescript
interface IntentBillboardProps {
  coords: JoystickCoords;
  userText: string; // optional supplementary text from user
}
```

**Logic:**
```typescript
// Generate intent sentence based on coordinate dominance
const generateIntentText = (coords: JoystickCoords, userText: string): string => {
  const { hot, cheap, near } = coords;
  
  // Find dominant axis (0-indexed: 0=hot, 1=cheap, 2=near)
  const values = [hot, cheap, near];
  const dominantIdx = values.indexOf(Math.max(...values));
  
  // Template library (15-20 variations)
  const templates = {
    hot: [
      "Tôi muốn món nước ấm bụng",
      "Tôi muốn ăn cái gì đó nóng",
      "Khẩu vị: nóng sốt, ấm lòng"
    ],
    cheap: [
      "Tôi muốn món ăn siêu rẻ",
      "Tôi muốn tiết kiệm tiền",
      "Budget: dưới 50 ngàn"
    ],
    near: [
      "Tôi muốn ăn liền, giao nhanh",
      "Tôi muốn ăn trong 15 phút",
      "Tôi cần món gần nhất"
    ],
    balanced: [
      "Tôi muốn ăn cái gì đó ngon, rẻ, và gần",
      "Tôi muốn nóng, rẻ, và giao nhanh"
    ]
  };
  
  // Select template based on dominance
  let baseText = "";
  if (dominantIdx === 0) baseText = templates.hot[0];
  else if (dominantIdx === 1) baseText = templates.cheap[0];
  else if (dominantIdx === 2) baseText = templates.near[0];
  
  // Append user text if provided
  return userText ? `${baseText}, ${userText}` : baseText;
};
```

**Rendering:**
- Container: border-4 #0C0C0C, padding 24px, background #FAF6F0
- Label: "💬 Ý ĐỊNH:" in Space Mono Bold 18px
- Text: Space Mono Regular 16px, #0C0C0C, wrapping

**Optional: Typewriter Effect**
- Use `useEffect` with `setInterval` to reveal text character-by-character
- Duration: 300-500ms total
- Only on coordinate updates, not on first render

**Styling Constraints:**
- No overflow (truncate if too long)
- No whitespace collapse (preserve intent clarity)
- All-black text on cream background

---

### `<TextInput>` (Form Control)
**Type:** Client Component

**Responsibility:**
- Accept user-typed food preferences
- Emit text updates
- Support voice input append

**Props:**
```typescript
interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onVoiceResult?: (transcript: string) => void;
  placeholder?: string;
}
```

**Constraints:**
- Max 200 characters (enforce in onChange handler)
- Trim whitespace on blur
- No validation (free text only)

**Styling:**
- Wrapper: full-width with margins
- Input field: border-4 #0C0C0C, padding 16px 12px, background #FAF6F0
- Focus: maintain border color (no color change on focus, maybe expand shadow?)
- Placeholder: #0C0C0C at 60% opacity, Space Mono Regular 16px

**Accessibility:**
- Label: "Hoặc gõ chi tiết khẩu vị của bạn..." (as placeholder or visible label)
- `type="text"`, `autocomplete="off"`, `spellcheck="true"`

---

### `<MicrophoneButton>` (Voice Input)
**Type:** Client Component

**Responsibility:**
- Trigger voice capture via Web Speech API
- Handle microphone permission
- Append transcript to text input
- Provide visual feedback during recording

**Props:**
```typescript
interface MicrophoneButtonProps {
  onTranscript: (text: string) => void;
  isDisabled?: boolean;
}
```

**State:**
```typescript
const [isListening, setIsListening] = useState(false);
const [isSupported, setIsSupported] = useState(true);
```

**Key Logic:**
```typescript
const useSpeechToText = (onTranscript: (text: string) => void) => {
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || 
                              (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // auto-stop
      recognition.interimResults = false; // final results only
      recognition.lang = "vi-VN"; // Vietnamese
      
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript); // append to input
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      
      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }
  }, [onTranscript]);

  return { isListening, isSupported, startListening, stopListening };
};
```

**Styling:**
- Icon: 🎤
- Resting: Square button 44x44px, border-2 #0C0C0C, background #FED049, positioned right-edge of input
- Listening: background #FF4B2B, border-dashed, animate-pulse
- Disabled: opacity 0.6, not-allowed cursor
- No text label (icon only)

**Constraints:**
- Web Speech API not guaranteed on all browsers (graceful fallback)
- No error message shown; button simply disabled if unsupported
- No transcription UI (just appends to input)

---

## 4. SUBMISSION & RECOMMENDATIONS SECTION

### `<GetSuggestionsButton>` (CTA)
**Type:** Client Component

**Responsibility:**
- Trigger recommendation API call
- Show loading state
- Handle success/error

**Props:**
```typescript
interface GetSuggestionsButtonProps {
  isLoading: boolean;
  onClick: () => void;
}
```

**Styling:**
- Text: "✨ GỎI Ý MÓN NGAY CHO TÔI"
- Style: border-4 #0C0C0C, background #FF4B2B, text white or black
- Padding: 16px horizontal, 12px vertical
- Shadow: shadow-[6px_6px_0px_0px_#0C0C0C]
- Hover: shadow-[2px_2px_0px_0px_#0C0C0C]
- Loading: text changes to "⏳ AI ĐANG SUY NGHĨ...", disabled=true, opacity 1 (no fade)

**Constraints:**
- No async logic in component (parent handles API call)
- No error boundary (errors shown at page level)

---

### `<RecommendationsSection>` (Container)
**Type:** Client Component

**Responsibility:**
- Display 3 plate cards in a row
- Handle plate flip interactions
- Manage back button to return to joystick

**Props:**
```typescript
interface RecommendationsSectionProps {
  suggestions: Suggestion[];
  flippedPlateId: string | null;
  onFlipPlate: (restaurantId: string | null) => void;
  onBack: () => void;
  isLoading: boolean;
}
```

**Layout:**
- Flex row, center-aligned, gap 16px
- Responsive: scroll horizontally on mobile if needed
- BackButton: positioned top-left (sticky or absolute)
- ActionButtons: positioned bottom-right (ChangeRec, BudgetFilter)

**Children:**
1. BackButton
2. PlateCard (x3)
3. ChangeRecButton (optional)
4. BudgetFilterButton (optional)

---

### `<PlateCard>` (3D Flip Component)
**Type:** Client Component

**Responsibility:**
- Render front and back faces of plate card
- Handle 3D flip animation on click
- Manage flipped state via parent

**Props:**
```typescript
interface PlateCardProps {
  suggestion: Suggestion;
  isFront: boolean; // parent controls flipped state
  onClick: () => void;
}
```

**Structure:**
```
<PlateCardContainer perspective-[1000px]>
  <PlateCardContent isFlipped={!isFront} transform-style-preserve-3d>
    <PlateFront rotate-y-0>
      [Image, name, price, distance, ETA]
    </PlateFront>
    <PlateBack rotate-y-180>
      [AI reasoning, CTA button]
    </PlateBack>
  </PlateCardContent>
</PlateCardContainer>
```

**CSS Transform Details:**
```css
/* Container: enable 3D perspective */
.plate-container {
  perspective: 1000px;
}

/* Content wrapper: preserve 3D space */
.plate-content {
  transform-style: preserve-3d;
  transition: transform 500ms ease-in-out;
  transform: rotateY(0deg); /* or rotateY(180deg) when flipped */
}

/* Front and back faces */
.plate-front,
.plate-back {
  backface-visibility: hidden; /* hide back while showing front */
  transform-style: preserve-3d;
}

.plate-front {
  transform: rotateY(0deg);
}

.plate-back {
  transform: rotateY(180deg);
}
```

**Front Face (`<PlateFront>`):**
- Image: responsive, circular or rounded, 200px diameter
- Dish name: Space Mono Bold 20px, #0C0C0C, centered
- Restaurant name: Space Mono 14px, #0C0C0C, centered below
- Price: Space Mono 14px, right-aligned, "45.000đ" format
- Distance: Space Mono 14px, right-aligned, "0.8 km"
- ETA: Space Mono 14px, right-aligned, "12 phút"

**Back Face (`<PlateBack>`):**
- Title: "[ TẠI SAO AI CHỌN? ]" in Space Mono Bold 24px, #0C0C0C
- AI reason: Space Mono 16px, #0C0C0C, 1-2 lines, centered
- CTA button: "[ CHỐT MÓN NÀY ]", red background, border-4 #0C0C0C
- Button action: href to restaurant page (external link, `target="_blank"`)

**Styling Constraints:**
- Max width: 300px
- Min height: 350px
- Border: border-4 #0C0C0C
- Background: alternating #FED049 (front) and #FAF6F0 (back)
- Shadow: shadow-[6px_6px_0px_0px_#0C0C0C]
- Hover shadow: shadow-[8px_8px_0px_0px_#0C0C0C]

---

## 5. REUSABLE PATTERNS & UTILITIES

### Pattern: Coordinate Normalization (Utility Function)
```typescript
// Convert pointer position to triangle-bounded coordinates
const normalizeCoordinatesInTriangle = (
  pointerX: number, 
  pointerY: number, 
  triangleVertices: { top: [number, number], bottomLeft: [number, number], bottomRight: [number, number] }
): JoystickCoords => {
  // 1. Check if point is inside triangle (barymetric coordinates or distance check)
  // 2. Calculate distances from point to each vertex
  // 3. Normalize to [0, 1] based on max distance
  // Return { hot, cheap, near }
};
```

### Pattern: Intent Text Generation (Utility Function)
```typescript
const generateIntentText = (coords: JoystickCoords): string => {
  // 1. Identify dominant axis
  // 2. Select template based on dominance
  // 3. Add blending text if multiple axes engaged
  // Return natural language string
};
```

### Pattern: Shadow State Manager (CSS Class)
```typescript
// Use conditional Tailwind classes for shadow states
const shadowClass = {
  resting: 'shadow-[6px_6px_0px_0px_#0C0C0C]',
  hover: 'shadow-[2px_2px_0px_0px_#0C0C0C]',
  active: 'shadow-[0px_0px_0px_0px_#0C0C0C]',
};

// Apply dynamically
<button className={isHovered ? shadowClass.hover : shadowClass.resting}>
```

### Pattern: 3D Flip State (CSS Transform)
```typescript
const flipStyle: React.CSSProperties = isFront ? 
  { transform: 'rotateY(0deg)' } : 
  { transform: 'rotateY(180deg)' };
  
// Apply with transition
<div style={flipStyle} className="transition-transform duration-500 ease-in-out">
```

---

## 6. STATE MANAGEMENT STRATEGY

### State Ownership (Clear Hierarchy)
1. **Page-level state (SuggesterPage):**
   - joystickCoords
   - textInput
   - suggestions
   - isLoading
   - mode (joystick/recommendations/flipped)
   - flippedPlateId

2. **Component-level state:**
   - HungerTriangle: isPointerDown (internal)
   - MicrophoneButton: isListening (internal)
   - PlateCard: controlled via parent (no internal state)

3. **No Redux/Zustand needed** (props suffice)

### Prop Drilling Concerns
- **Accept:** JoystickSection receives many props (necessary bridge)
- **Reduce:** Use Context if >3 levels deep (not needed for MVP)
- **Pattern:** Container component (Page) passes to section, section passes to leaf components

---

## 7. DATA FLOW EXAMPLE

### User drags joystick:
```
1. HungerTriangle receives onPointerMove
2. calculateTriangleCoords() → { hot: 0.8, cheap: 0.2, near: 0.3 }
3. HungerTriangle emits onCoordsChange(coords)
4. SuggesterPage.setJoystickCoords(coords)
5. JoystickSection re-renders with new coords
6. IntentBillboard receives coords, calls generateIntentText()
7. IntentBillboard displays "Tôi muốn ăn nóng"
```

### User clicks "Get Suggestions":
```
1. SuggesterPage.handleSubmit()
2. setIsLoading(true)
3. Call mockApi.getAIRecommendations({ joystickCoords, textInput })
4. Wait 1.2 seconds
5. setSuggestions(result)
6. setMode('recommendations')
7. RecommendationsSection renders with 3 plates
```

### User clicks plate:
```
1. PlateCard.onClick()
2. SuggesterPage.setFlippedPlateId(suggestion.restaurant_id)
3. PlateCard re-renders with isFront={false}
4. CSS transform: rotateY(180deg)
5. Back face visible with AI reasoning
```

---

## 8. SERVER/CLIENT BOUNDARIES

### Client Components (All MVP)
- SuggesterPage (root)
- JoystickSection
- HungerTriangle
- IntentBillboard
- TextInput
- MicrophoneButton
- GetSuggestionsButton
- RecommendationsSection
- PlateCard

### Server Components (Future)
- Layout wrapper (if meta needed)
- Analytics (not in MVP)
- Error boundary (Client, but can wrap server content)

### API Calls
- **During MVP:** Client-side fetch in SuggesterPage via mockApi.getAIRecommendations()
- **Post-MVP:** Move to Server Action or Route Handler at `/api/recommend`

---

## 9. PERFORMANCE CONSIDERATIONS

### Optimizations (If Needed)
1. **Joystick drag:** Use `useCallback` to avoid re-rendering on every pointer move (memoize handler)
2. **PlateCard:** Use `React.memo` if many renders from parent (conditional rendering)
3. **Image loading:** Use `<Image>` from Next.js with `loading="lazy"`
4. **Intent text:** Memoize `generateIntentText()` function with `useMemo`

### Anti-Patterns to Avoid
- ❌ Creating new objects/functions on every render (bind handlers in render)
- ❌ Rendering all 3 plates if only 1 flipped (use conditional rendering)
- ❌ Full page re-render on coordinate change (React handles efficiently; use dev tools to verify)

---

## END OF COMPONENT PATTERNS

This document defines the blueprint for component architecture.

Agents should follow these patterns strictly to ensure consistency and maintainability.
