# Map Info Overlay - Close/Hide Feature

## Feature Added
Added the ability to close/hide the map information overlay on the edit-map page with an option to show it again.

## Changes Made

### File: `src/pages/MapPageWithSidebar.tsx`

#### 1. Added State Management
```typescript
const [showMapInfo, setShowMapInfo] = useState(true);
```

#### 2. Added Close Button to Map Info Overlay
- Positioned in top-right corner of the overlay
- Clean "✕" icon
- Hover effects (background change on hover)
- Clicking hides the entire map info overlay

#### 3. Added "Show Map Info" Button
- Appears at bottom-left when overlay is hidden
- Blue button with "ℹ️ Show Map Info" text
- Same position as the hidden overlay
- Hover effects (lift animation and color change)
- Clicking shows the map info overlay again

## User Experience

### Initial State
- Map info overlay is visible by default
- Shows map title, description, code, and action buttons
- Close button (✕) visible in top-right corner

### After Clicking Close (✕)
- Entire map info overlay disappears
- "Show Map Info" button appears in the same bottom-left position
- Map area is now fully visible without overlay

### After Clicking "Show Map Info"
- Map info overlay reappears
- Close button is available again
- User can toggle as many times as needed

## Visual Layout

### With Map Info Visible:
```
┌────────────────────────┐
│  Map Title        [✕]  │
│  Description           │
│                        │
│  MAP CODE              │
│  MAP-XXXX-XXXX         │
│                        │
│  [Save & Return]       │
│  [Back to Dashboard]   │
│                        │
│  0 zones               │
└────────────────────────┘
```

### With Map Info Hidden:
```
┌─────────────────────────┐
│  ℹ️ Show Map Info       │
└─────────────────────────┘
```

## Benefits
✅ Users can hide map info to get more screen space for the map
✅ Easy to toggle visibility with clear buttons
✅ Maintains same position for consistent UX
✅ No permanent removal - always recoverable
✅ Smooth transitions and hover effects

## Button Styling

### Close Button (✕)
- Transparent background by default
- Gray color (#666)
- Hover: Light gray background (#f0f0f0), black text
- Positioned absolute in top-right
- 18px font size

### Show Map Info Button (ℹ️)
- Blue background (#4f8cff)
- White text
- Hover: Darker blue (#3a7dff), lifts 2px, enhanced shadow
- Fixed position at bottom-left
- 14px font size, bold weight

## Testing
1. Navigate to `/edit-map/:id`
2. Verify map info overlay is visible
3. Click the ✕ button in top-right corner
4. Verify overlay disappears
5. Verify "Show Map Info" button appears at bottom-left
6. Click "Show Map Info" button
7. Verify overlay reappears
8. Repeat toggle to ensure it works consistently
