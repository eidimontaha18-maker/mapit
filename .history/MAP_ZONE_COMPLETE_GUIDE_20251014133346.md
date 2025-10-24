# 🗺️ MAP CREATION & ZONE MANAGEMENT - Complete Guide

## ✅ Backend API Endpoints Added

### **Map Endpoints**

#### 1. Create New Map
```
POST /api/map
```
**Body:**
```json
{
  "title": "My Map",
  "description": "Map description",
  "map_code": "MAP-AUTO-GENERATED",
  "customer_id": 18,
  "country": "Lebanon",
  "map_data": { "lat": 33.8, "lng": 35.5, "zoom": 8 },
  "map_bounds": { "center": [33.8, 35.5], "zoom": 8 },
  "active": true
}
```
**Response:**
```json
{
  "success": true,
  "map": {
    "map_id": 13,
    "title": "My Map",
    "description": "Map description",
    "map_code": "MAP-1697280000-ABC123XYZ",
    "customer_id": 18,
    "created_at": "2025-10-14T..."
  }
}
```

#### 2. Get Map by ID
```
GET /api/map/:map_id
```
**Response:**
```json
{
  "success": true,
  "map": {
    "map_id": 13,
    "title": "My Map",
    "map_code": "MAP-1697280000-ABC123XYZ",
    "customer_id": 18,
    "country": "Lebanon",
    "map_data": {...},
    "map_bounds": {...},
    "active": true,
    "created_at": "..."
  }
}
```

#### 3. Update Map
```
PUT /api/map/:map_id
```
**Body:**
```json
{
  "title": "Updated Map Title",
  "description": "Updated description",
  "country": "Syria",
  "active": true
}
```

#### 4. Get All Maps for Customer
```
GET /api/customer/:customer_id/maps
```
**Response:** Returns all maps with zone counts

---

### **Zone Endpoints**

#### 1. Create New Zone
```
POST /api/zone
```
**Body:**
```json
{
  "map_id": 13,
  "name": "Zone 1",
  "color": "#ff0000",
  "coordinates": [[33.8, 35.5], [33.9, 35.6], ...],
  "customer_id": 18
}
```
**Response:**
```json
{
  "success": true,
  "zone": {
    "id": "uuid-here",
    "map_id": 13,
    "name": "Zone 1",
    "color": "#ff0000",
    "coordinates": {...},
    "customer_id": 18,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

#### 2. Get Zones for a Map
```
GET /api/map/:map_id/zones
```
**Response:**
```json
{
  "success": true,
  "zones": [
    {
      "id": "uuid-1",
      "map_id": 13,
      "name": "Zone 1",
      "color": "#ff0000",
      "coordinates": {...}
    },
    ...
  ]
}
```

#### 3. Update Zone
```
PUT /api/zone/:zone_id
```
**Body:**
```json
{
  "name": "Updated Zone Name",
  "color": "#00ff00",
  "coordinates": [...]
}
```

#### 4. Delete Zone
```
DELETE /api/zone/:zone_id
```
**Response:**
```json
{
  "success": true,
  "message": "Zone deleted successfully."
}
```

---

## 🎯 How the System Works

### **Map Creation Flow:**

1. **User Creates Map** → Dashboard → "Create New Map" button
2. **Enter Map Details** → Title, Description
3. **Navigate to Map Builder** → Interactive map interface
4. **System Generates Map Code** → Unique code like `MAP-1697280000-ABC123XYZ`
5. **User Selects Country** → Click on country boundary
6. **User Creates Zones** → Draw polygons on map
7. **Save Map** → Map saved to database with:
   - Map record in `map` table
   - Customer-Map relationship in `customer_map` table
   - Map code for identification

### **Zone Creation Flow:**

1. **Map Must Be Saved First** → Get map_id
2. **User Draws Zone** → Using drawing tools
3. **Zone Properties Set:**
   - Name (e.g., "Zone 1", "Beirut Region")
   - Color (e.g., "#ff0000")
   - Coordinates (polygon points)
4. **Save Zone** → POST to `/api/zone`
5. **Zone Linked to Map** → via `map_id` foreign key

---

## 📊 Database Schema

### **map Table**
```sql
map_id          SERIAL PRIMARY KEY
title           VARCHAR NOT NULL
description     TEXT
created_at      TIMESTAMP
map_data        JSONB
map_bounds      JSONB
active          BOOLEAN
country         VARCHAR
customer_id     INTEGER NOT NULL (FK → customer)
map_code        VARCHAR (UNIQUE identifier)
```

### **zones Table**
```sql
id              UUID PRIMARY KEY (auto-generated)
map_id          INTEGER (FK → map)
name            VARCHAR NOT NULL
color           VARCHAR NOT NULL
coordinates     JSONB NOT NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
customer_id     INTEGER (FK → customer)
```

### **customer_map Table** (Junction table)
```sql
customer_map_id SERIAL PRIMARY KEY
customer_id     INTEGER (FK → customer)
map_id          INTEGER (FK → map)
access_level    VARCHAR (e.g., 'owner', 'viewer')
last_accessed   TIMESTAMP
created_at      TIMESTAMP
```

---

## 🔐 Data Relationships

```
customer (1)
    ├── has many → map (via customer_id)
    │       └── has many → zones (via map_id)
    │
    └── has many → customer_map (junction)
             └── links to → map
```

**Key Points:**
- 1 Customer → Many Maps
- 1 Map → Many Zones
- customer_map table allows sharing maps between users
- Each map has unique `map_code` for identification
- Each zone has UUID primary key

---

## 🎨 Frontend Features

### **Dashboard (DashboardPage.tsx)**
Shows:
- ✅ User email (logged in as)
- ✅ Total Maps count
- ✅ Total Zones count
- ✅ Average Zones per Map
- ✅ Table with all maps and zone counts
- ✅ Map code displayed for each map

### **Map Creation (CreateMapPage.tsx)**
Features:
- ✅ Interactive world map
- ✅ Country selection
- ✅ Auto-generated map code
- ✅ Zone drawing tools
- ✅ Zone management (create, edit, delete)
- ✅ Save map with all zones
- ✅ Display map code after save

### **Map Code Display**
- Generated format: `MAP-{timestamp}-{random}`
- Example: `MAP-1697280000-K3XRP9LMQ`
- Unique identifier for each map
- Displayed on dashboard
- Shown in map editor
- Used for sharing/reference

---

## 🚀 Usage Examples

### **Create a Map with Zones**

1. **Login:** `eidimontaha20@gmail.com`
2. **Dashboard:** Click "Create New Map"
3. **Enter Details:**
   - Title: "Lebanon Regions"
   - Description: "Administrative regions of Lebanon"
4. **System generates:** `MAP-1697280000-XYZ123`
5. **Select Country:** Click Lebanon on map
6. **Create Zones:**
   - Draw polygon for "Beirut" (color: #ff0000)
   - Draw polygon for "Mount Lebanon" (color: #00ff00)
   - Draw polygon for "North Lebanon" (color: #0000ff)
7. **Save:** Click "Save Map"
8. **Result:**
   - Map saved with ID 13
   - Map code: `MAP-1697280000-XYZ123`
   - 3 zones created and linked to map
   - Visible in dashboard with zone count

### **View Maps in Dashboard**

```
┌──────────────────────────────────────────────────────────┐
│ My Maps Dashboard                                        │
│ 👤 Logged in as: eidimontaha20@gmail.com               │
├──────────────────────────────────────────────────────────┤
│ [Total Maps: 3]  [Total Zones: 15]  [Avg: 5.0]         │
├──────────────────────────────────────────────────────────┤
│ ID │ Title          │ Code            │ Zones │ Actions │
│ #13│ Lebanon Regions│ MAP-...XYZ123   │   3   │ [Btns]  │
│ #12│ fff            │ MAP-...ABC456   │   2   │ [Btns]  │
│ #10│ map1           │ MAP-...DEF789   │   8   │ [Btns]  │
└──────────────────────────────────────────────────────────┘
```

---

## 📝 API Test Examples

### **Test Map Creation**
```powershell
$body = @{
  title = "Test Map"
  description = "Testing map creation"
  customer_id = 18
  map_code = "MAP-TEST-001"
  active = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:3101/api/map" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### **Test Zone Creation**
```powershell
$body = @{
  map_id = 13
  name = "Test Zone"
  color = "#ff0000"
  coordinates = @(@(33.8, 35.5), @(33.9, 35.6), @(33.85, 35.7))
  customer_id = 18
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:3101/api/zone" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### **Test Get Customer Maps**
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:3101/api/customer/18/maps" `
  -Method GET
```

---

## ✅ Current Status

### **Backend (Port 3101):**
- ✅ Map creation endpoint
- ✅ Map update endpoint  
- ✅ Map retrieval endpoint
- ✅ Zone creation endpoint
- ✅ Zone update endpoint
- ✅ Zone delete endpoint
- ✅ Get zones for map
- ✅ Get customer maps with zone counts
- ✅ Auto-generate map codes
- ✅ Create customer_map relationships

### **Frontend (Port 5173):**
- ✅ Dashboard with maps and zone counts
- ✅ Map creation interface
- ✅ Map code display
- ✅ Zone drawing tools (existing)
- ✅ Zone management (existing)
- ⏳ Update to use new API endpoints

### **Database:**
- ✅ customer table
- ✅ map table (with map_code column)
- ✅ zones table (with UUID ids)
- ✅ customer_map table
- ✅ Foreign key relationships

---

## 🎉 Summary

**You can now:**
1. ✅ Create maps with unique codes
2. ✅ Draw and save zones for each map
3. ✅ View all maps in dashboard
4. ✅ See zone counts for each map
5. ✅ Track which email/customer created which maps
6. ✅ Manage zones (create, update, delete)
7. ✅ Share maps (via customer_map table)
8. ✅ Identify maps by unique code

**The system tracks:**
- Each customer's maps
- Each map's zones
- Map codes for identification
- Zone counts per map
- Creation timestamps
- Customer-map relationships

Everything is now ready! Refresh your browser at **http://localhost:5173** and start creating maps with zones! 🗺️✨
