# 🔧 API Endpoint Migration Plan

## Issue
Frontend is calling old `/api/db/tables/...` endpoints but backend only has new simplified endpoints.

## Backend Endpoints (simple-login-server.js)
✅ Available:
- `GET /api/map/:map_id` - Get map by ID
- `POST /api/map` - Create new map
- `PUT /api/map/:map_id` - Update map
- `GET /api/customer/:customer_id/maps` - Get customer maps
- `GET /api/map/:map_id/zones` - Get zones for map
- `POST /api/zone` - Create zone
- `PUT /api/zone/:zone_id` - Update zone
- `DELETE /api/zone/:zone_id` - Delete zone

## Frontend Files to Update

### ✅ FIXED:
1. **MapPageWithSidebar.tsx**
   - Changed: `/api/db/tables/map/${id}` → `/api/map/${id}`
   - Changed: `/api/db/tables/zones?map_id=${id}` → `/api/map/${id}/zones`
   - Changed: `data.record` → `data.map`
   - Changed: `zonesData.records` → `zonesData.zones`

### ⏳ NEED TO FIX:

2. **DashboardPage.tsx** (Line 84)
   - Need to change: `/api/db/tables/map/${id}` → `/api/map/${id}`
   - This is for DELETE operation

3. **CreateMapPage.tsx** (Lines 149-150, 311)
   - Need to change: `/api/db/tables/map` → `/api/map`
   - Need to change: `/api/db/tables/zones` → `/api/zone`
   - Already partially correct API flow

4. **WorldMap.tsx** (Multiple lines)
   - Line 263: `/api/db/tables/zones?map_id=` → `/api/map/${mapId}/zones`
   - Line 301: `/api/db/tables/map/${mapId}` → `/api/map/${mapId}`
   - Line 375: `/api/db/tables/map/${mapId}` → `/api/map/${mapId}`
   - Line 386: `/api/db/tables/zones` → `/api/zone`
   - Line 473: `/api/db/tables/zones/${id}` → `/api/zone/${id}`
   - Line 516: `/api/db/tables/zones/${zone.id}` → `/api/zone/${zone.id}`
   - Line 641: `/api/db/tables/map/${mapId}` → `/api/map/${mapId}`

## Migration Strategy

1. ✅ Fix MapPageWithSidebar.tsx (DONE)
2. Fix DashboardPage.tsx DELETE endpoint
3. Fix CreateMapPage.tsx endpoints
4. Fix WorldMap.tsx endpoints (most critical)

After these fixes, map viewing should work correctly!
