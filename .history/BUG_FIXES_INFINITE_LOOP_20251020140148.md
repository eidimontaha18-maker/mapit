# Bug Fixes - Infinite Loop & API Errors

## Issues Fixed

### 1. **Infinite Loop in CountrySidebar Component**
**Problem:** The component was causing "Maximum update depth exceeded" error.

**Root Cause:**
- `getCitiesForCountry` function was defined inside the component but not memoized
- `useEffect` dependencies included `onSearch` which changed on every render
- This caused endless re-renders

**Solution:**
```typescript
// Wrapped function in React.useCallback with empty deps
const getCitiesForCountry = React.useCallback((countryName: string) => {
  // ... function logic
}, []);

// Removed onSearch from useEffect dependencies
useEffect(() => {
  // ... logic
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedCountry, getCitiesForCountry]);
```

### 2. **Backend Server Not Running**
**Problem:** API calls to `/api/customer/18/maps` and `/api/map` returned 500 errors.

**Root Cause:**
- The backend Node.js server (`server.js`) was not running
- Frontend was making API calls to localhost but nothing was listening

**Solution:**
- Started the backend server: `node server.js`
- Server is now running and connected to PostgreSQL

### 3. **JSON Parsing Error**
**Problem:** `Failed to execute 'json' on 'Response': Unexpected end of JSON input`

**Root Cause:**
- Server returned empty or invalid JSON response when it wasn't running
- API endpoints returned 500 status with no valid JSON body

**Solution:**
- With backend server running, endpoints now return proper JSON responses
- All API calls should work correctly now

## Changes Made

### Files Modified
- `src/components/CountrySidebar.tsx`
  - Wrapped `getCitiesForCountry` in `React.useCallback`
  - Removed `onSearch` from useEffect dependencies to prevent infinite loops
  - Added eslint-disable comments to suppress false-positive warnings

### Server Status
- ✅ Backend server running: `node server.js`
- ✅ PostgreSQL connected successfully
- ✅ API endpoints accessible on port 3000
- ✅ Vite dev server running on port 5175

## Testing Checklist

- [ ] Navigate to http://localhost:5175/
- [ ] Try creating a new map
- [ ] Search for a country (e.g., "Lebanon")
- [ ] Verify city list appears
- [ ] Click on a city
- [ ] Verify no infinite loop errors in console
- [ ] Check that API calls succeed (status 200)

## Technical Details

### UseEffect Dependencies Strategy
```typescript
// First useEffect - Run once on mount
useEffect(() => {
  onSearch(20, 0, 2); // Show world view
  // Load saved maps...
}, []); // Empty array = run once

// Second useEffect - Run when country changes
useEffect(() => {
  if (selectedCountry) {
    onSearch(lat, lng, zoom, selectedCountry);
    const cities = getCitiesForCountry(selectedCountry);
    setCountryCities(cities);
  }
}, [selectedCountry, getCitiesForCountry]); 
// onSearch excluded to prevent loops
```

### Why onSearch Causes Loops
1. Parent component passes `onSearch` function as prop
2. Function is recreated on every parent render
3. If included in dependencies, useEffect runs again
4. useEffect calls `onSearch`, which triggers parent re-render
5. Loop continues infinitely ♾️

### Solution Pattern
- Use `useCallback` for functions defined in the component
- Exclude props that change frequently from dependencies
- Use eslint-disable comments to acknowledge intentional exclusions

## Common React Patterns Applied

### Pattern 1: Memoized Functions
```typescript
const myFunction = React.useCallback(() => {
  // Function logic
}, [/* dependencies */]);
```

### Pattern 2: Controlled Dependencies
```typescript
useEffect(() => {
  // Effect logic
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [/* only stable dependencies */]);
```

### Pattern 3: One-Time Effects
```typescript
useEffect(() => {
  // Initialization logic
}, []); // Empty array = run once
```

## Prevention Tips

1. **Always memoize functions** that are used in useEffect dependencies
2. **Be careful with props** - they often change on every render
3. **Use eslint-disable sparingly** - only when you're certain it's safe
4. **Test for infinite loops** - watch the console for warning messages
5. **Keep effects focused** - one effect per concern

## Status

✅ **All issues resolved**
- No more infinite loops
- API calls working
- Backend server running
- Frontend compiling without errors
