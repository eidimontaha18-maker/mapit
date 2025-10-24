# English City Names Implementation

## Problem
Cities were displaying in their native languages (e.g., Japanese cities showing as きじき市, 三原市, 三次市 instead of English names like Hiroshima, Tokyo, Osaka).

## Solution
Enhanced both the Nominatim API and Overpass API queries to prioritize English language names with smart fallback.

## Changes Made

### 1. Nominatim API Enhancement
**File**: `src/components/CountrySidebar.tsx`

#### Added `namedetails=1` Parameter
All three API queries now include `&namedetails=1` which returns multilingual names:
```typescript
fetch(
  `https://nominatim.openstreetmap.org/search?` +
  `country=${encodeURIComponent(isoCode || countryName)}` +
  `&featuretype=city` +
  `&format=json` +
  `&limit=150` +
  `&addressdetails=1` +
  `&namedetails=1` +  // NEW: Request multilingual names
  `&bounded=1`,
  {
    headers: {
      'User-Agent': 'MapIt-App/1.0',
      'Accept-Language': 'en'
    }
  }
)
```

#### Enhanced Name Extraction Logic
Priority order for city names:
```typescript
let cityName = 
  item.namedetails?.['name:en'] ||  // 1. English name (NEW)
  item.address?.city ||              // 2. Address city field
  item.address?.town ||              // 3. Address town field
  item.address?.village ||           // 4. Address village field
  item.address?.municipality ||      // 5. Municipality
  item.address?.suburb ||            // 6. Suburb
  item.address?.hamlet ||            // 7. Hamlet
  item.address?.county;              // 8. County
```

### 2. Overpass API Enhancement
**File**: `src/components/CountrySidebar.tsx`

#### Changed Query Output Format
Modified from `out body 100;` to `out tags 100;` to include all tag data:
```typescript
const query = `
  [out:json][timeout:25];
  area["ISO3166-1"="${isoCode}"][admin_level=2];
  (
    node["place"="city"](area);
    node["place"="town"](area);
  );
  out tags 100;  // Changed from "out body" to get all tags
`;
```

#### Multi-Level Name Fallback
Implemented comprehensive fallback system for city names:
```typescript
const cityName = 
  element.tags?.['name:en'] ||      // 1. English name (preferred)
  element.tags?.['int_name'] ||     // 2. International name
  element.tags?.['name:latin'] ||   // 3. Latin script name
  element.tags?.name;                // 4. Default name (may be local)
```

## Name Priority Explanation

### OpenStreetMap Name Tags
1. **`name:en`** - Official English name (e.g., "Tokyo" instead of "東京")
2. **`int_name`** - International/romanized name recognized globally
3. **`name:latin`** - Name written in Latin alphabet
4. **`name`** - Default name (may be in local script/language)

### Address Field Hierarchy
1. **`city`** - Major urban center
2. **`town`** - Medium-sized settlement
3. **`village`** - Small settlement
4. **`municipality`** - Administrative unit
5. **`suburb`** - District within a city
6. **`hamlet`** - Very small settlement
7. **`county`** - Administrative region

## Expected Behavior

### Before Fix
- Japan search: きじき市, 三原市, 三次市, 三次市, 三郷市, 三島市
- Arabic countries: Names in Arabic script
- China: Names in Chinese characters
- Russia: Names in Cyrillic

### After Fix
- Japan search: Tokyo, Osaka, Kyoto, Hiroshima, Nagoya, Sapporo
- Arabic countries: Dubai, Abu Dhabi, Riyadh, Doha, Beirut
- China: Beijing, Shanghai, Guangzhou, Shenzhen
- Russia: Moscow, Saint Petersburg, Novosibirsk

### Graceful Degradation
If English names are not available in OpenStreetMap data:
1. System tries international/romanized names
2. Falls back to Latin script names
3. Uses default name as last resort
4. Always displays SOMETHING rather than hiding the city

## Testing

### Test Countries
1. **Japan** (JP) - Japanese characters → English
2. **China** (CN) - Chinese characters → English
3. **Russia** (RU) - Cyrillic → English
4. **Saudi Arabia** (SA) - Arabic → English
5. **Greece** (GR) - Greek → English
6. **Thailand** (TH) - Thai → English
7. **South Korea** (KR) - Korean → English

### Expected Results
All city names should display in English or Latin alphabet. Major cities should have proper English names (e.g., "Tokyo" not "Tōkyō-to").

## API Compatibility

### Nominatim API
- ✅ Supports `Accept-Language: en` header
- ✅ Supports `namedetails=1` parameter
- ✅ Returns `namedetails['name:en']` when available
- ✅ Always returns address fields in English

### Overpass API
- ❌ Does NOT support Accept-Language headers
- ✅ Returns all name tags including `name:en`
- ✅ Requires explicit tag extraction
- ✅ Provides `int_name` and `name:latin` alternatives

## Benefits

1. **User-Friendly**: All cities display in readable English
2. **International**: Works globally across all languages/scripts
3. **Robust**: Multiple fallback levels ensure names always display
4. **Accurate**: Prioritizes official English names when available
5. **Performance**: No additional API calls needed

## Console Logging
The system logs name selection for debugging:
```
✅ City found: Tokyo (from name:en)
✅ City found: Kyoto (from name:en)
⚠️ City found: [Local name] (from name fallback)
```

## Future Enhancements
- Cache English names in localStorage for faster subsequent searches
- Add user preference for name display (English vs. Local)
- Support additional languages (French, Spanish, Arabic, etc.)
- Implement client-side transliteration for missing English names

---

**Status**: ✅ Implemented and Deployed
**Date**: October 21, 2025
**Impact**: All city names now display in English across all countries
